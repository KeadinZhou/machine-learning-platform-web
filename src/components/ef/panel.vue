<template>
  <div v-if="easyFlowVisible" style="height: calc(100vh - 65px);">
    <div style="display: flex;height: 100%;">
      <project-file-tree style="width: 250px"></project-file-tree>
      <div>
        <div style="display: flex;height: calc(100% - 42px);width: calc(100vw - 250px);">
          <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
            <template v-for="node in data.nodeList">
              <flow-node
                  :id="node.id"
                  :key="node.id"
                  :node="node"
                  :activeElement="activeElement"
                  @changeNodeSite="changeNodeSite"
                  @nodeRightMenu="nodeRightMenu"
                  @clickNode="clickNode"
                  @deleteNode="deleteNode"
              >
              </flow-node>
            </template>
            <!-- 给画布一个默认的宽度和高度 -->
            <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
          </div>
          <div style="width: 230px;border-left: 1px solid #dce3e8;">
            <div class="node-menu-box-title">
              模型组件
            </div>
            <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
          </div>


          <!-- 右侧表单 -->
          <!--            <div style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB">-->
          <!--                <flow-node-form ref="nodeForm" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything"></flow-node-form>-->
          <!--            </div>-->
        </div>
        <div class="toolbar">
          <i
              class="command el-icon-delete"
              title="删除"
              @click="deleteElement"
              :class="this.activeElement.type?'':'disable'"
              :disabled="!this.activeElement.type"
          ></i>
          <span class="separator"></span>
          <i
              class="command el-icon-zoom-in"
              @click="zoomAdd"
              title="放大"
          ></i>
          <i
              class="command el-icon-zoom-out"
              @click="zoomSub"
              title="缩小"
          ></i>
        </div>
      </div>
    </div>
    <!-- 流程数据详情 -->
    <!--        <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>-->
    <!--        <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>-->
  </div>

</template>

<script>
import draggable from 'vuedraggable'
// import { jsPlumb } from 'jsplumb'
// 使用修改后的jsplumb
import './jsplumb'
import {easyFlowMixin} from '@/components/ef/mixins'
import flowNode from '@/components/ef/node'
import nodeMenu from '@/components/ef/node_menu'
import FlowInfo from '@/components/ef/info'
import FlowHelp from '@/components/ef/help'
import FlowNodeForm from './node_form'
import lodash from 'lodash'
import ProjectFileTree from '@/components/project/project-file-tree'
import {mapMutations, mapState} from "vuex";

export default {
  data() {
    return {
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 控制流程数据显示与隐藏
      flowInfoVisible: false,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      flowHelpVisible: false,
      // 数据
      data: {},
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined
      },
      zoom: 0.5
    }
  },
  computed: {
    ...mapState(['dataForFrame', 'nodeMap', 'host'])
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp, ProjectFileTree
  },
  directives: {
    'flowDrag': {
      // eslint-disable-next-line no-unused-vars
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          // eslint-disable-next-line no-unused-vars
          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  mounted() {
    let that = this
    // eslint-disable-next-line no-undef
    that.jsPlumb = jsPlumb.getInstance()
    that.$nextTick(() => {
      // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
      that.dataReload(that.dataForFrame)
    })
  },
  methods: {
    ...mapMutations(['saveNodeData', 'saveNodeExtra', 'deleteNodeInServer', 'deleteEdgeInServer', 'newEdgeInServer']),
    // 返回唯一标识
    getUUID() {
      return Math.random().toString(36).substr(3, 10)
    },
    jsPlumbInit() {
      let that = this
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true);
        // 初始化节点
        this.loadEasyFlow()
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        // eslint-disable-next-line no-unused-vars
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          // this.$refs.nodeForm.lineInit({
          //     from: conn.sourceId,
          //     to: conn.targetId,
          //     label: conn.getLabel()
          // })
        })
        // 连线
        this.jsPlumb.bind("connection", (evt) => {
          let from = evt.source.id
          let to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({from: from, to: to})
          }
        })

        // 删除连线回调
        this.jsPlumb.bind("connectionDetached", (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        // 改变线的连接节点
        this.jsPlumb.bind("connectionMoved", (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        // 连线右击
        this.jsPlumb.bind("contextmenu", (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          let from = evt.sourceId
          let to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环');
            return false
          }
          that.newEdgeInServer({
            project_id: that.$route.params.id,
            node1_id: from,
            node2_id: to
          })
          this.$message.success('连接成功')
          return true
        })

        // beforeDetach
        this.jsPlumb.bind("beforeDetach", (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },
    // 加载流程图
    loadEasyFlow() {
      let that = this
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(node.id, lodash.merge(this.jsplumbSourceOptions, {}))
        // // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            stop: function (el) {
              // 拖拽节点结束后的对调
              let Node = that.nodeMap.get(Number(node.id))
              Node.extra.x = el.finalPos[0]
              Node.extra.y = el.finalPos[1]
              that.saveNodeExtra(Node)
            }
          })
        }
      }
      // 初始化连线
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true
      })
    },
    // 设置连线条件
    setLineLabel(from, to, label) {
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]
      if (!label || label === '') {
        conn.removeClass('flowLabel')
        conn.addClass('emptyFlowLabel')
      } else {
        conn.addClass('flowLabel')
      }
      conn.setLabel({
        label: label,
      })
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
        }
      })

    },
    // 删除激活的元素
    deleteElement() {
      let that = this
      if (this.activeElement.type === 'node') {
        this.deleteNode(this.activeElement.nodeId)
      } else if (this.activeElement.type === 'line') {
        this.$confirm({
          title: '提示',
          content: '确定删除所点击的线吗?',
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            var conn = that.jsPlumb.getConnections({
              source: that.activeElement.sourceId,
              target: that.activeElement.targetId
            })[0]
            that.deleteEdgeInServer({
              project_id: that.$route.params.id,
              node1_id: that.activeElement.sourceId,
              node2_id: that.activeElement.targetId
            })
            that.jsPlumb.deleteConnection(conn)
          },
          onCancel() {
          },
        });
      }
    },
    // 删除线
    deleteLine(from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false
        }
        return true
      })
    },
    // 改变连线
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },
    // 改变节点的位置
    changeNodeSite(data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },
    newNodeSubmit(node_type) {
      let that = this
      return new Promise((resolve, reject) => {
        let project_id = that.$route.params.id
        let sendData = new FormData()
        sendData.append('project_id', project_id)
        sendData.append('node_type', node_type)
        that.$http.post(that.host + `/node`, sendData)
            .then(data => {
              resolve(data.data)
            })
            .catch((error) => {
              if (error.response) {
                that.$message.error(error.response.data.message)
              } else {
                that.$message.error('请求失败')
              }
              reject()
            })
      })
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    // eslint-disable-next-line no-unused-vars
    addNode(evt, nodeMenu, mousePosition) {
      let that = this
      that.newNodeSubmit(nodeMenu.type)
          .then(result => {
            let nodeId = String(result.id)
            let screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
            let efContainer = this.$refs.efContainer
            let containerRect = efContainer.getBoundingClientRect()
            let left = screenX, top = screenY
            // 计算是否拖入到容器中
            if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
              that.$message.warn("将节点拖入画布即可创建该节点")
              return
            }
            left = left - containerRect.x + efContainer.scrollLeft
            top = top - containerRect.y + efContainer.scrollTop
            // 居中
            left -= 85
            top -= 16
            let nodeName = nodeMenu.name

            let node = {
              id: nodeId,
              name: nodeName,
              type: nodeMenu.type,
              left: left + 'px',
              top: top + 'px',
              ico: nodeMenu.ico,
              state: 'error'
            }

            that.saveNodeExtra({id:nodeId, extra:{x:left, y:top}})

            that.data.nodeList.push(node)
            that.$nextTick(function () {
              that.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
              that.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
              that.jsPlumb.draggable(nodeId, {
                containment: 'parent',
                stop: function (el) {
                  let Node = that.nodeMap.get(Number(node.id))
                  Node.extra.x = el.finalPos[0]
                  Node.extra.y = el.finalPos[1]
                  that.saveNodeExtra(Node)
                }
              })
            })
          })

    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(nodeId) {
      let that = this
      this.$confirm({
        title: '提示',
        content: '确定要删除节点' + nodeId + '?',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          that.deleteNodeInServer(nodeId)
          that.data.nodeList = that.data.nodeList.filter(function (node) {
            if (node.id === nodeId) {
              // 伪删除，将节点隐藏，否则会导致位置错位
              // node.show = false
              return false
            }
            return true
          })
          that.$nextTick(function () {
            this.jsPlumb.removeAllEndpoints(nodeId);
          })
        },
        onCancel() {
        },
      });
      return true
    },
    clickNode(nodeId) {
      this.activeElement.type = 'node'
      this.activeElement.nodeId = nodeId
      // this.$refs.nodeForm.nodeInit(this.data, nodeId)
    },
    // 是否具有该线
    hasLine(from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything() {
      this.jsPlumb.repaint()
    },
    // 加载流程图
    dataReload(data) {
      let that = this
      if (data.name === undefined) {
        setTimeout(()=>{
          that.dataReload(that.dataForFrame)
        }, 100)
        return
      }
      console.log(data)
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        data = lodash.cloneDeep(data)
        this.easyFlowVisible = true
        this.data = data
        this.$nextTick(() => {
          // eslint-disable-next-line no-undef
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    zoomAdd() {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub() {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
  }
}
</script>

<style scoped>
.toolbar {
  box-sizing: border-box;
  padding: 8px 0px;
  width: 100%;
  height: 42px;
  border-top: 1px solid #dce3e8;
  display: flex;
}

.toolbar .command:nth-of-type(1) {
  margin-left: 24px;
}

.toolbar .command {
  box-sizing: border-box;
  width: 27px;
  height: 27px;
  margin: 0px 6px;
  border-radius: 2px;
  border: 1px solid rgba(2, 2, 2, 0);
  display: flex;
  justify-content: center;
  align-items: center;
}

.toolbar .command:hover {
  cursor: pointer;
  border: 1px solid #e9e9e9;
}

.toolbar .disable {
  color: rgba(0, 0, 0, 0.25);
}

.toolbar .separator {
  margin: 4px;
  border-left: 1px solid #e9e9e9;
}

.node-menu-box {
  width: 100%;
  height: 100%;
  box-shadow: 0 1px 10px rgba(0, 21, 41, .21);
}

.node-menu-box-title {
  background: #DADADA;
  width: 100%;
  height: 45px;
  text-align: center;
  line-height: 45px;
  color: black;
}
</style>

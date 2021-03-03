<template>
  <loading-box-frame v-if="loading"></loading-box-frame>
  <div v-else class="flow-menu" ref="tool">
    <div v-for="menu  in  menuList" :key="menu.id">
      <span class="ef-node-pmenu" @click="menu.open = !menu.open"><i
          :class="{'el-icon-caret-bottom': menu.open,'el-icon-caret-right': !menu.open}"></i>&nbsp;{{ menu.name }}</span>
      <ul v-show="menu.open" class="ef-node-menu-ul">
        <draggable @end="end" @start="move" v-model="menu.children" :options="draggableOptions">
          <li v-for="subMenu in menu.children" class="ef-node-menu-li" :key="subMenu.id" :type="subMenu.type" :title="subMenu.description">
            <i :class="subMenu.ico"></i> {{ subMenu.name }}
          </li>
        </draggable>
      </ul>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import {mapMutations, mapState} from "vuex";
import LoadingBoxFrame from '@/components/frame/loading-box-frame'

var mousePosition = {
  left: -1,
  top: -1
}

export default {
  components: {
    draggable,
    'loading-box-frame': LoadingBoxFrame
  },
  data() {
    return {
      activeNames: '1',
      // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
      draggableOptions: {
        preventOnFilter: false,
        sort: false,
        disabled: false,
        ghostClass: 'tt',
        // 不使用H5原生的配置
        forceFallback: true,
        // 拖拽的时候样式
        // fallbackClass: 'flow-node-draggable'
      },
      menuList: [],
      nodeMenu: {},
      nodeData: [],
      loading: false
    }
  },
  computed: {
    ...mapState(['host', 'buildGetQuery'])
  },
  methods: {
    ...mapMutations(['saveNodeType', 'buildDataForFrame', 'saveNodeType', 'saveNodeData']),
    // 根据类型获取左侧菜单对象
    getMenuByType(type) {
      for (let i = 0; i < this.menuList.length; i++) {
        let children = this.menuList[i].children;
        for (let j = 0; j < children.length; j++) {
          if (children[j].type === type) {
            return children[j]
          }
        }
      }
    },
    // 拖拽开始时触发
    // eslint-disable-next-line no-unused-vars
    move(evt, a, b, c) {
      var type = evt.item.attributes.type.nodeValue
      this.nodeMenu = this.getMenuByType(type)
    },
    // 拖拽结束时触发
    // eslint-disable-next-line no-unused-vars
    end(evt, e) {
      this.$emit('addNode', evt, this.nodeMenu, mousePosition)
    },
    // 是否是火狐浏览器
    isFirefox() {
      var userAgent = navigator.userAgent
      if (userAgent.indexOf("Firefox") > -1) {
        return true
      }
      return false
    },
    initNodeData() {
      let that = this
      let groups = new Set()
      for (let item of that.nodeData) {
        this.saveNodeType(item)
        groups.add(item.group)
      }
      that.menuList = []
      for (let group of groups) {
        let groupChildren = []
        that.nodeData.filter((node) => {
          if (node.group === group) {
            groupChildren.push({
              id: 'group-'+group+'-'+node.type,
              type: node.type,
              name: node.name,
              description: node.description,
              ico: node.icon ? node.icon : 'el-icon-question',
              style: {}
            })
          }
        })
        that.menuList.push({
          id: 'group-'+group,
          type: 'group',
          name: ''+group,
          open: true,
          children: groupChildren
        })
      }
    },
    loadProjectNodes() {
      let that = this
      let project_id = that.$route.params.id
      that.nodesLoading = true
      that.$http.get(that.host + '/node' + that.buildGetQuery({project_id: project_id}))
          .then(data => {
            let Data = data.data.nodes
            for (let item of Data) {
              that.saveNodeData(item)
            }
            this.buildDataForFrame(Data)
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(JSON.stringify(error.response.data.message))
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(()=>{
            that.nodesLoading = false
          })
    },
    getData() {
      let that = this
      that.loading = true
      that.$http.get(that.host + '/node/description')
          .then(data => {
            that.nodeData = data.data.data
            console.log(that.nodeData)
            that.initNodeData()
            that.loadProjectNodes()
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(JSON.stringify(error.response.data.message))
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.loading = false
          })
    }
  },
  created() {
    this.getData()
    if (this.isFirefox()) {
      document.body.ondrop = function (event) {
        // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
        mousePosition.left = event.layerX
        mousePosition.top = event.clientY - 50
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }
}
</script>

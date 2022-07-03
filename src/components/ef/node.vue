<template>
  <a-dropdown :trigger="['contextmenu']">
    <div
        ref="node"
        :style="nodeContainerStyle"
        @click="clickNode"
        @mouseup="changeNodeSite"
        :class="nodeContainerClass"
    >
      <!-- 最左侧的那条竖线 -->
      <div class="ef-node-left"></div>
      <!-- 节点类型的图标 -->
      <div class="ef-node-left-ico flow-node-drag">
        <i :class="nodeIcoClass"></i>
      </div>
      <!-- 节点名称 -->
      <div class="ef-node-text" :show-overflow-tooltip="true">
        {{ node.name }}
      </div>
      <!-- 节点状态图标 -->
      <div class="ef-node-right-ico">
        <i class="el-icon-circle-check el-node-state-success" v-show="node.state === 'success'"></i>
        <i class="el-icon-circle-close el-node-state-error" v-show="node.state === 'error'"></i>
        <i class="el-icon-warning-outline el-node-state-warning" v-show="node.state === 'warning'"></i>
        <i class="el-icon-loading el-node-state-running" v-show="node.state === 'running'"></i>
      </div>
      <a-modal v-model="modalVisible" title="参数设置" :maskClosable="false" okText="保存" cancelText="取消" @ok="setParamsSubmitCheck" :confirm-loading="submitting">
        <template>
          <dynamic-form :params-config="paramsConfig" v-model="paramsData"></dynamic-form>
        </template>
      </a-modal>
      <a-modal v-model="renameVisible" title="重命名节点" :maskClosable="false" okText="保存" cancelText="取消" @ok="setNewName">
        <el-input v-model="renameValue" placeholder="请输入新的节点名"  style="width: 100%" size="medium">
        </el-input>
      </a-modal>
      <a-modal v-model="nodeLogVisible" title="运行日志" :maskClosable="false" okText="确定" cancelText="取消" @ok="nodeLogVisible = false" width="1000px">
        <a-descriptions bordered>
          <a-descriptions-item label="运行状态" :span="3">
            <b v-if="nodeLogData.status === 0"><span style="color: #88898A">未运行</span></b>
            <b v-if="nodeLogData.status === 1"><span style="color: peru">正在运行</span></b>
            <b v-if="nodeLogData.status === 2"><span style="color: rgb(82,196,26)">运行完成</span></b>
            <b v-if="nodeLogData.status === 3"><span style="color: red">运行失败</span></b>
          </a-descriptions-item>
          <a-descriptions-item label="运行参数" :span="3">
            <pre>{{nodeLogData.extra}}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="运行日志" :span="3">
            <pre style="width: 100%; background: black; color: white; min-height: 100px">{{nodeLogData.log?nodeLogData.log:'(empty)'}}</pre>
          </a-descriptions-item>
        </a-descriptions>
      </a-modal>
      <a-modal v-model="csvVisible" title="查看文件" :maskClosable="false" okText="确定" cancelText="取消" @ok="csvVisible = false" width="98%">
        选择要查看的文件：
        <el-select v-model="filenameChoose" placeholder="请选择" size="medium" @change="getFile">
          <el-option
              v-for="(item, index) in filenameList"
              :key="''+item+index"
              :label="item"
              :value="item">
          </el-option>
        </el-select>
        <el-button v-if="!showSummary" style="margin-left: 10px" @click="getFile(filenameChoose, true)">查看Summary</el-button>
        <el-button v-else style="margin-left: 10px" @click="getFile(filenameChoose, false)">关闭Summary</el-button>
        <br>
        <br>
        <loading-box-frame v-if="fileLoading"></loading-box-frame>
        <div v-else :style="`max-height: ${height - 350}px;overflow: auto;`">
          <csv-show-table :value="csvData"></csv-show-table>
        </div>
      </a-modal>

      <a-modal v-model="consoleVisible" title="Console" :maskClosable="false" okText="确定" cancelText="取消" @ok="consoleVisible = false" width="50%">
        <base-console :content="consoleContent" style="height: calc(100vh - 400px)"></base-console>
      </a-modal>

      <a-modal v-model="predictVisible" title="Console" :maskClosable="false" okText="确定" cancelText="取消" @ok="predictVisible = false" width="50%" destroyOnClose>
        <predict-outcomes :outputInteger="outputInteger" :nodeId="node.id"></predict-outcomes>
      </a-modal>

    </div>
    <a-menu slot="overlay">
      <a-menu-item key="1" @click="setParamsClick">
        设置参数
      </a-menu-item>
      <a-menu-item key="2" @click="runNodeClick">
        运行节点
      </a-menu-item>
      <a-menu-item key="3" @click="showNodeLog">
        查看日志
      </a-menu-item>
      <a-menu-item key="4" @click="showFileClick">
        读取结果
      </a-menu-item>
      <a-menu-item key="7" @click="reNameNode">
        节点重命名
      </a-menu-item>
      <a-menu-item key="6" @click="showPredict" v-if="node.name.indexOf('机器学习') !== -1">
        <span style="color: blue">结果预测</span>
      </a-menu-item>
      <a-menu-item key="5" @click="deleteNode">
        <span style="color: red">删除节点</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import LoadingBoxFrame from '@/components/frame/loading-box-frame'
import CSVShowTable from '@/components/project/csv-show-table'
import DynamicForm from '@/components/frame/dynamic-form'
import BaseConsole from '@/components/frame/base-console'
import PredictOutcomes from '@/components/project/predict-outcomes'
import {mapMutations, mapState} from "vuex";
export default {
  props: {
    node: Object,
    activeElement: Object
  },
  components: {
    'loading-box-frame': LoadingBoxFrame,
    'csv-show-table': CSVShowTable,
    'dynamic-form': DynamicForm,
    'base-console': BaseConsole,
    'predict-outcomes': PredictOutcomes
  },
  data() {
    return {
      height: window.innerHeight,
      modalVisible: false,
      renameValue: '',
      renameVisible: false,
      submitting: false,
      clickedTarget: null,
      paramsConfig: [],
      paramsData: {},
      nodeLogVisible: false,
      nodeLogData: {},
      csvVisible: false,
      csvData: [],
      fileLoading: false,
      filenameList: [],
      filenameChoose: '',
      showSummary: false,
      consoleVisible: false,
      consoleContent: '',
      predictVisible: false,
      outputInteger: false
    }
  },
  computed: {
    ...mapState(['nodeMap', 'nodeType', 'nodeExtra', 'host', 'buildGetQuery']),
    nodeContainerClass() {
      return {
        'ef-node-container': true,
        'ef-node-active': this.activeElement.type == 'node' ? this.activeElement.nodeId === this.node.id : false
      }
    },
    // 节点容器样式
    nodeContainerStyle() {
      return {
        top: this.node.top,
        left: this.node.left
      }
    },
    nodeIcoClass() {
      var nodeIcoClass = {}
      nodeIcoClass[this.node.ico] = true
      // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
      nodeIcoClass['flow-node-drag'] = this.node.viewOnly ? false : true
      return nodeIcoClass
    }
  },
  methods: {
    ...mapMutations(['saveNodeExtra','saveNodeRenameExtra']),
    // 点击节点
    clickNode() {
      this.$emit('clickNode', this.node.id)
    },
    // 鼠标移动后抬起
    changeNodeSite() {
      // 避免抖动
      if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
        return;
      }
      this.$emit('changeNodeSite', {
        nodeId: this.node.id,
        left: this.$refs.node.style.left,
        top: this.$refs.node.style.top,
      })
    },
    deleteNode() {
      this.$emit('deleteNode', this.node.id)
    },
    setParamsClick() {
      let that = this
      let node = that.node
      let nodeData = this.nodeMap.get(String(node.id))
      let nodeParams = this.nodeType.get(node.type).params
      let nodeExtra = this.nodeExtra.get(String(node.id))
      console.log(nodeData)
      console.log(nodeParams)
      console.log(nodeExtra)
      this.paramsConfig = nodeParams
      this.paramsData = {}
      for(let p of nodeParams) {
        this.paramsData[p.name] = p.default
        if (nodeExtra[p.name] !== undefined) {
          this.paramsData[p.name] = nodeExtra[p.name]
        }
      }
      this.modalVisible = true
    },
    setParamsSubmitCheck() {
      let that = this
      console.log(that.paramsData)
      for (let config of this.paramsConfig) {
        if (config.required && (this.paramsData[config.name] === null || this.paramsData[config.name] === '') ) {
          this.$message.error(`${config.name} is required`)
          return
        }
      }
      this.setParamsSubmit()
    },
    setNewName(){
      this.node.name = this.renameValue
      this.renameVisible = false
      this.paramsData["newName"] = this.renameValue
      this.saveNodeRenameExtra({id: this.node.id, extra: this.paramsData, showMsg: true})
    },
    setParamsSubmit() {
      this.modalVisible = false
      this.saveNodeExtra({id: this.node.id, extra: this.paramsData, showMsg: true})
    },
    runNodeClick() {
      let that = this
      that.$http.post(that.host + `/node/${that.node.id}/run`)
          .then(() => {
            that.$message.success('任务创建成功')
            that.showNodeLog()
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
              that.consoleContent = that.$moment().format() + ': ' + error.response.data.message
              that.consoleVisible = true
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
          })
    },
    showNodeLog() {
      this.getNodeLog()
      this.nodeLogVisible = true
    },
    getNodeLog() {
      let that = this
      that.$http.get(that.host + `/node/${that.node.id}`)
          .then(data => {
            that.nodeLogData = data.data
            delete that.nodeLogData.extra.x
            delete that.nodeLogData.extra.y
            if (that.nodeLogData.status === 1) {
              setTimeout(()=>{
                that.getNodeLog()
              }, 500)
            }
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
          })
    },
    showFileClick() {
      let output_type = this.nodeType.get(this.node.type).output_type
      switch (output_type) {
        case 0: {
          this.filenameList = []
          this.$message.error('该节点无输出')
          return
        }
        case 1: {
          this.filenameList = ['x.csv', 'y.csv']
          break
        }
        case 2: {
          this.filenameList = ['x_train.csv','x_test.csv','y_train.csv','y_test.csv']
          break
        }
      }
      this.filenameChoose = this.filenameList[0]
      this.csvVisible = true
      this.getFile(this.filenameChoose)
    },
    reNameNode(){
      this.renameVisible =true
    },

    showPredict() {
      this.outputInteger = (this.node.name.indexOf('分类') !== -1)
      this.predictVisible = true
    },
    getFile(filename, showSummary) {
      let that = this
      if (showSummary) {
        that.showSummary = true
      } else {
        that.showSummary = false
      }

      let query = {filename: filename}
      if (showSummary) {
        query.summary = true
      }

      that.fileLoading = true
      that.$http.get(that.host + `/node/${that.node.id}/csv` + this.buildGetQuery(query))
          .then(data => {
            that.csvData = data.data.data.split('\n')
            console.log(that.csvData)
            for (let item in that.csvData) {
              that.csvData[item] = that.csvData[item].split(',')
            }
            console.log(that.csvData)
          })
          .catch((error) => {
            that.csvVisible = false
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.fileLoading = false
          })
    },
  },
  created() {
    let nodeExtra = this.nodeExtra.get(String(this.node.id))
    if (nodeExtra["newName"]){
      this.node.name = nodeExtra["newName"]
    }
  }
}
</script>

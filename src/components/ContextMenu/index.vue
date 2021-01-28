<template>
  <div>
    <ul class="el-scrollbar__view el-select-dropdown__list context-menu" ref="contextMenu">
      <li
        class="el-select-dropdown__item"
        v-for="menu in menus"
        :key="menu.key"
        @click="handleClick(menu)"
      >{{menu.name}}</li>
    </ul>
    <a-modal v-model="modalVisible" title="参数设置" :maskClosable="false" okText="保存" cancelText="取消" @ok="setParamsSubmitCheck" :confirm-loading="submitting">
<!--      <a-form-model :rules="{}" :model="paramsData" ref="paramsForm" v-if="modelVisible">-->
<!--        <a-form-model-item v-for="(config,index) in paramsConfig" :prop="config.name" :label="`${config.name} (${config.description})`" :key="'params'+config.name+index">-->
<!--          <a-input v-if="config.type === 'str'" v-model="paramsData[config.name]" :placeholder="config.description"/>-->
<!--          <a-select v-else-if="config.type === 'bool'" v-model="paramsData[config.name]" :placeholder="config.description">-->
<!--            <a-select-option value="true">-->
<!--              true-->
<!--            </a-select-option>-->
<!--            <a-select-option value="false">-->
<!--              false-->
<!--            </a-select-option>-->
<!--          </a-select>-->
<!--        </a-form-model-item>-->
<!--      </a-form-model>-->

      <template>
        <div v-for="(config,index) in paramsConfig" :key="'params'+config.name+index" class="params-form-item">
          <div class="params-form-item-label">
            {{`${config.name} (${config.description}):`}}
          </div>
          <a-input v-if="config.type === 'str'" v-model="paramsData[config.name]" :placeholder="config.description"/>
          <a-select v-else-if="config.type === 'bool'" v-model="paramsData.has_header" style="width: 100%">
            <a-select-option value="true">
              true
            </a-select-option>
            <a-select-option value="false">
              false
            </a-select-option>
          </a-select>
        </div>
      </template>
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
      <a-select default-value="x.csv" style="width: 120px" @change="getFile">
        <a-select-option value="x.csv">
          x.csv
        </a-select-option>
        <a-select-option value="y.csv">
          y.csv
        </a-select-option>
      </a-select>
      <br>
      <loading-box-frame v-if="fileLoading"></loading-box-frame>
      <div v-else :style="`max-height: ${height - 350}px;overflow: auto;`">
        <csv-show-table :value="csvData"></csv-show-table>
      </div>
    </a-modal>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus";
import {mapMutations, mapState} from "vuex";
import okSvg from '@/assets/icons/ok.svg'
import LoadingBoxFrame from '@/components/frame/loading-box-frame'
import CSVShowTable from '@/components/project/csv-show-table'
export default {
  components: {
    'loading-box-frame': LoadingBoxFrame,
    'csv-show-table': CSVShowTable
  },
  data() {
    return {
      height: window.innerHeight,
      page: null,
      graph: null,
      menus: [{
        key: 1,
        name: "设置参数"
      }, {
        key: 2,
        name: "运行节点"
      }, {
        key: 3,
        name: '读取结果'
      }],
      modalVisible: false,
      submitting: false,
      clickedTarget: null,
      paramsConfig: [],
      paramsData: {
        has_header: '',
        input_file: '',
        label_columns: ''
      },
      paramsRules: {},
      nodeLogVisible: false,
      nodeLogData: {},
      csvVisible: false,
      csvData: '',
      fileLoading: false
    }
  },
  computed: {
    ...mapState(['nodeMap', 'nodeType', 'nodeExtra', 'host', 'buildGetQuery'])
  },
  created() {
    this.bindEvent();
  },
  methods: {
    ...mapMutations(['saveNodeExtra']),
    init() {},
    bindEvent() {
      let that = this
      eventBus.$on("afterAddPage", page => {
        that.page = page;
        that.graph = that.page.graph;
      })
      eventBus.$on("contextmenuClick", e => {
        const menu = this.$refs.contextMenu;
        menu.style.left = e.clientX - 250 + "px";
        menu.style.top = e.clientY - 65 + "px";
        menu.style.display = "block";
        this.clickedTarget = e.item
        // console.log(e.item)
        // console.log(e.item.getModel())
      });
       eventBus.$on("mousedown", () => {
        const menu = this.$refs.contextMenu;
        menu.style.display = "none";
      });
    },
    handleClick(item) {
      switch (item.key) {
        case 1: this.setParamsClick(); break;
        case 2: this.runNodeClick();break;
        case 3: this.showFileClick();break;
      }
      const menu = this.$refs.contextMenu;
      menu.style.display = "none";
    },
    setParamsClick() {
      let model = this.clickedTarget.getModel()
      let nodeData = this.nodeMap.get(model.id)
      let nodeParams = model.params
      let nodeExtra = this.nodeExtra.get(model.id)
      console.log(nodeData)
      console.log(nodeParams)
      console.log(nodeExtra)

      this.paramsConfig = nodeParams
      // this.paramsData = {}
      this.paramsRules = {}
      for(let p of nodeParams) {
        this.paramsData[p.name] = p.default
        if (nodeExtra[p.name] !== undefined) {
          this.paramsData[p.name] = nodeExtra[p.name]
        }
        if (p.required) {
          this.paramsRules[p.name] = [{ required: true, message: `${p.name} is required`, trigger: 'blur' }]
        }
      }

      this.modalVisible = true
    },
    setParamsSubmitCheck() {
      let that = this
      console.log(that.paramsData)
      // that.$refs["paramsForm"].validate(valid => {
      //   if (valid) {
      //     that.setParamsSubmit()
      //   }
      // })
      for (let config of this.paramsConfig) {
        if (config.required && (this.paramsData[config.name] === null || this.paramsData[config.name] === '') ) {
          this.$message.error(`${config.name} is required`)
          return
        }
      }
      this.setParamsSubmit()
    },
    setParamsSubmit() {
      this.modalVisible = false
      this.saveNodeExtra({id: this.clickedTarget.getModel().id, extra: this.paramsData, showMsg: true})
      let mo = {
        stateImage: okSvg
      }
      this.graph.update(this.clickedTarget, mo)
    },
    runNodeClick() {
      let that = this
      that.$http.post(that.host + `/node/${this.clickedTarget.getModel().id}/run`)
          .then(() => {
            that.$message.success('任务创建成功')
            that.getNodeLog()
            that.nodeLogVisible = true
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
    getNodeLog() {
      let that = this
      that.$http.get(that.host + `/node/${this.clickedTarget.getModel().id}`)
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
      this.csvVisible = true
      this.getFile('x.csv')
    },
    getFile(filename) {
      let that = this
      that.fileLoading = true
      that.$http.get(that.host + `/node/${this.clickedTarget.getModel().id}/csv` + this.buildGetQuery({filename: filename}))
          .then(data => {
            that.csvData = data.data.data.split('\n')
            console.log(that.csvData)
            for (let item in that.csvData) {
              that.csvData[item] = that.csvData[item].split(',')
            }
            console.log(that.csvData)
          })
          .catch((error) => {
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

  }
};
</script>

<style>
.context-menu {
  position: absolute;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: 5px 0;
  z-index: 1;
  display: none;
}

.context-menu li {
  cursor: pointer;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
}
.context-menu li:hover {
  background-color: #f5f7fa;
}
.params-form-item{
  width: 100%;
  margin: 10px 0;
}
.params-form-item-label{
  font-size: 14px;
  margin-bottom: 10px;
}
</style>

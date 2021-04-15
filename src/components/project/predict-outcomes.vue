<template>
  <div class="admin-main-box">
    <div class="admin-title">
      <b>结果预测</b>
    </div>
    <div class="select-and-button-box">
      <a-space>
        <el-select v-model="dataSet" placeholder="请选择" size="medium" @change="getData(1)">
          <el-option label="训练集" value="1"></el-option>
          <el-option label="测试集" value="2"></el-option>
        </el-select>
        <el-button size="medium" @click="showSHAPImage">相关度分析</el-button>
      </a-space>
    </div>
    <a-table :columns="dynamicColumns" :data-source="userData" size="middle" :pagination="false" :loading="loading">

      <span v-for="index in inputSize" :key="index" :slot="'input'+index" slot-scope="cellData">
        <span style="cursor: pointer" @click="modalData = cellData ;modalVisible = true"><a-icon :type="getTypeIcon(cellData.type)" /> {{cellData.type}}</span>
      </span>

      <span v-for="index in outputSize" :key="index" :slot="'output'+index" slot-scope="cellData">
        <span style="cursor: pointer" @click="modalData = cellData ;modalVisible = true"><a-icon :type="getTypeIcon(cellData.type)" /> {{cellData.type}}</span>
      </span>

      <span slot="analysis" slot-scope="record">
        <span style="cursor: pointer" @click="getSHAPAnalysis(record)"><a-icon :type="getTypeIcon('analysis')" /></span>
      </span>

    </a-table>
    <div class="table-pagination-box">
      <a-pagination v-model="page" :total="count" :defaultPageSize="pageSize" @change="pageChange"/>
    </div>

    <a-modal v-model="modalVisible" title="数据查看" :maskClosable="false" okText="确定" cancelText="取消" @ok="modalVisible = false" width="100%" :footer="null" centered destroyOnClose>

      <div class="modal-content-box">
        <template v-if="modalData.type === 'csv'">
          <csv-show-table :value="getCSVData(modalData.data)"></csv-show-table>
        </template>
        <template v-else-if="modalData.type === 'analysis'">
          <a-tabs style="height: 100%; overflow: auto">
            <a-tab-pane key="1" tab="Waterfall">
              <img :src="modalData.data[1]" alt="">
            </a-tab-pane>
            <a-tab-pane key="2" tab="Force">
              <iframe :src="modalData.data[0]" frameborder="0" width="100%" height="500px"></iframe>
            </a-tab-pane>
          </a-tabs>
        </template>
        <template v-else-if="modalData.type === 'shap_image'">
          <a-tabs style="height: 100%">
            <a-tab-pane key="1" tab="Beeswarm">
              <img :src="modalData.data[0]" alt="" height="80%">
            </a-tab-pane>
            <a-tab-pane key="2" tab="Bar">
              <img :src="modalData.data[1]" alt="">
            </a-tab-pane>
            <a-tab-pane key="3" tab="Force">
              <iframe :src="modalData.data[2]" frameborder="0" width="80%" height="500px"></iframe>
            </a-tab-pane>
          </a-tabs>
        </template>
      </div>


    </a-modal>
  </div>
</template>

<script>
import {mapState} from "vuex";
import CSVShowTable from '@/components/project/csv-show-table'
const pageSize = 20
// const columns = [
//   {
//     title: '#',
//     dataIndex: 'id',
//     key: 'id',
//     scopedSlots: { customRender: 'id' },
//     width: '60px',
//     align: 'center'
//   },
//   {
//     title: '输入1',
//     dataIndex: 'input1',
//     key: 'input1',
//     scopedSlots: { customRender: 'input1' },
//     align: 'center'
//   },
//   {
//     title: '输入2',
//     dataIndex: 'input2',
//     key: 'input2',
//     scopedSlots: { customRender: 'input2' },
//     align: 'center'
//   },
//   {
//     title: '输出',
//     dataIndex: 'output',
//     key: 'output',
//     scopedSlots: { customRender: 'output' },
//     align: 'center'
//   },
// ];

export default {
  name: "predict-outcomes",
  components: {
    // eslint-disable-next-line vue/no-unused-components
    'csv-show-table': CSVShowTable,
  },
  props: {
    outputInteger: Boolean,
    nodeId: Number
  },
  data() {
    return {
      pageSize,
      page: 1,
      count: 0,
      dataSet: "1",
      loading: false,
      userData: [],
      modalVisible: false,
      modalData: {},
      dynamicColumns: [],
      inputSize: 0,
      outputSize: 0
    }
  },
  computed: {
    ...mapState(['user', 'host', 'buildGetQuery'])
  },
  methods: {
    getTypeIcon(type) {
      switch (type) {
        case 'csv': return 'table'
        case 'analysis': return 'project'
        default: return 'question'
      }
    },
    dynamicColumnsInit(inputSize, outputSize) {
      this.dynamicColumns = []
      this.dynamicColumns.push({
        title: '#',
        dataIndex: 'id',
        key: 'id',
        scopedSlots: { customRender: 'id' },
        width: '60px',
        align: 'center'
      })
      for (let i=1;i<=inputSize;i++) {
        this.dynamicColumns.push({
          title: '输入' + ((inputSize > 1 )? (i) : ('') ),
          dataIndex: 'input' + i,
          key: 'input1' + i,
          scopedSlots: { customRender: 'input' + i },
          align: 'center'
        })
      }
      for (let i=1;i<=outputSize;i++) {
        this.dynamicColumns.push({
          title: '输出' + ((outputSize > 1 )? (i) : ('') ),
          dataIndex: 'output' + i,
          key: 'output1' + i,
          scopedSlots: { customRender: 'output' + i },
          align: 'center'
        })
      }
      this.dynamicColumns.push({
        title: '分析',
        key: 'analysis',
        scopedSlots: { customRender: 'analysis'},
        align: 'center'
      })
    },
    dataInit(allData) {
      let that = this
      let meta = allData.meta
      that.count = meta.count
      that.page = meta.page

      let inputs = allData.input
      let outputs = allData.output
      let dataLen = outputs[0].data.length
      let idDx = (meta.page - 1) * meta.page_size

      let inputSize = inputs.length
      let outputSize = outputs.length

      that.inputSize = inputSize
      that.outputSize = outputSize

      that.dynamicColumnsInit(inputSize, outputSize)

      that.userData = []
      for (let i=0;i<dataLen;i++) {
        let item = {}
        for (let j=0;j<inputSize;j++) {
          item['input'+(j+1)] = {
            data: inputs[j].data[i],
            type: inputs[j].type
          }
        }
        for (let j=0;j<inputSize;j++) {
          item['output'+(j+1)] = {
            data: outputs[j].data[i],
            type: outputs[j].type
          }
        }
        item.id = i+idDx+1
        that.userData.push(item)
      }
      console.log(that.userData)
    },
    getData(page) {
      let that = this
      let query = {
        type: that.dataSet,
        page: page,
        pageSize: that.pageSize
      }
      that.loading = true
      that.$http.get(that.host + `/node/${that.nodeId}/predict` + that.buildGetQuery(query))
          .then(data => {
            console.log(data.data)
            that.dataInit(data.data)
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.loading = false
          })
    },
    showSHAPImage() {
      this.modalData = {
        data: [
          `${this.host}/node/${this.nodeId}/predict/list${this.buildGetQuery({type: this.dataSet, shap_type: 1})}`,
          `${this.host}/node/${this.nodeId}/predict/list${this.buildGetQuery({type: this.dataSet, shap_type: 2})}`,
          `${this.host}/node/${this.nodeId}/predict/list${this.buildGetQuery({type: this.dataSet, shap_type: 3})}`,
        ],
        type: 'shap_image'
      }
      this.modalVisible = true
    },
    getSHAPAnalysis(record) {
      this.modalData = {
        data: [
          `${this.host}/node/${this.nodeId}/predict/analysis${this.buildGetQuery({type: this.dataSet, shap_type: 1, data_id: record.id})}`,
          `${this.host}/node/${this.nodeId}/predict/analysis${this.buildGetQuery({type: this.dataSet, shap_type: 2, data_id: record.id})}`,
        ],
        type: 'analysis'
      }
      this.modalVisible = true
    },
    getCSVData(str) {
      let res = str.split('\n')
      for (let item in res) {
        res[item] = res[item].split(',')
      }
      return res
    },
    pageChange(page) {
      this.page = page
      this.getData(page)
    }
  },
  created() {
    this.getData(1)
  }
}
</script>

<style scoped>
.admin-main-box{
  position: relative;
  left: 50px;
  width: calc(100% - 100px);
}
.admin-title{
  font-size: 20px;
  margin-bottom: 30px;
}

.select-and-button-box{
  margin-bottom: 30px;
}
.modal-content-box{
  width: 98vw;
  height: 90vh;
  overflow: auto;
  /*display: flex;*/
  /*flex-direction: column;*/
  /*align-items: center;*/
}
</style>

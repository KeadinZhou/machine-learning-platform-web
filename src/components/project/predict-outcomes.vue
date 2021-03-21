<template>
  <div class="admin-main-box">
    <div class="admin-title">
      <b>结果预测</b>
    </div>
    <a-table :columns="columns" :data-source="userData" size="middle" :pagination="false" :loading="loading">
      <span slot="input1">
        <span style="cursor: pointer" @click="type = 1 ;modalVisible = true"><a-icon type="table" /> CSV</span>
      </span>
      <span slot="input2" slot-scope="input2">
        <span style="cursor: pointer" @click="type = 2 ;modalVisible = true; modalData = input2"><i class="el-icon-picture-outline"></i> IMAGE</span>
      </span>
      <span slot="output" slot-scope="output">
        <span style="cursor: pointer" @click="type = 3 ;modalVisible = true; modalData = output"><a-icon type="table" /> CSV</span>
      </span>
    </a-table>
    <div class="table-pagination-box">
      <a-pagination v-model="page" :total="count" :defaultPageSize="pageSize" @change="pageChange"/>
    </div>

    <a-modal v-model="modalVisible" title="数据查看" :maskClosable="false" okText="确定" cancelText="取消" @ok="modalVisible = false" :width="(type === 1) ? ('98%') : ( (type === 2) ? ('210px') : '200px' )">

      <div v-if="type === 1" :style="`max-height: ${height - 350}px;overflow: auto;`">
        <csv-show-table :value="getCSVData(input1data)"></csv-show-table>
      </div>
      <div v-else-if="type === 2">
        <img :src="modalData" />
      </div>
      <div v-if="type === 3" :style="`max-height: ${height - 350}px;overflow: auto;`">
        <csv-show-table :value="getCSVData(modalData)"></csv-show-table>
      </div>

    </a-modal>
  </div>
</template>

<script>
import {mapState} from "vuex";
import CSVShowTable from '@/components/project/csv-show-table'
const pageSize = 20
const columns = [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    scopedSlots: { customRender: 'id' },
    width: '60px',
    align: 'center'
  },
  {
    title: '输入1',
    dataIndex: 'input1',
    key: 'input1',
    scopedSlots: { customRender: 'input1' },
    align: 'center'
  },
  {
    title: '输入2',
    dataIndex: 'input2',
    key: 'input2',
    scopedSlots: { customRender: 'input2' },
    align: 'center'
  },
  {
    title: '输出',
    dataIndex: 'output',
    key: 'output',
    scopedSlots: { customRender: 'output' },
    align: 'center'
  },
];

export default {
  name: "predict-outcomes",
  components: {
    'csv-show-table': CSVShowTable,
  },
  data() {
    return {
      pageSize,
      columns,
      loading: false,
      userData: [],
      page: 1,
      count: 0,
      modalVisible: false,
      input1data: 'region,tenure,age,marital,address,income,ed,employ,retire,gender,reside,tollfree,equip,callcard,wireless,longmon,tollmon,equipmon,cardmon,wiremon,longten,tollten,equipten,cardten,wireten,multline,voice,pager,internet,callid,callwait,forward,confer,ebill,loglong,logtoll,logequi,logcard,logwire,lninc,custcat,churn\n' +
          '2,13,44,1,9,64.000000,4,5,0.000000,0,2,0,0,1,0,3.700000,0.000000,0.000000,7.500000,0.000000,37.450000,0.000000,0.000000,110.000000,0.000000,0,0,0,0,0,0,1,0,0,1.308333,,,2.014903,,4.158883,1,1',
      input2data: 'https://ml-api.newitd.com/captcha?k=',
      output1data: 'result\n',
      type: 1,
      modalData: ''
    }
  },
  computed: {
    ...mapState(['user', 'host', 'buildGetQuery'])
  },
  methods: {
    getData() {
      this.userData = []
      for (let i = 1; i <= 20; i++) {
        this.userData.push(
            {
              id: i,
              input1: '',
              input2: this.input2data + Math.random(),
              output: this.output1data + Math.random()
            })
      }
      this.page = 1
      this.count = 100
    },
    getCSVData(str) {
      let res = str.split('\n')
      for (let item in res) {
        res[item] = res[item].split(',')
      }
      return res
    },
    // eslint-disable-next-line no-unused-vars
    pageChange(page) {
      // this.$router.push({
      //   name: 'admin',
      //   query: {
      //     page: page
      //   }
      // })
    }
  },
  created() {
    this.getData()
  },
  watch: {
    '$route': function () {
      this.getData()
    }
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
  margin-bottom: 50px;
}
</style>

<template>
  <div class="invitation-main-box">
    <div class="invitation-title">
      {{in18Data.INVITATION_TITLE}}
    </div>

    <a-button type="primary" style="margin-bottom: 50px" :loading="newing" @click="newCode">{{in18Data.INVITATION_NEW}}</a-button>

    <a-modal v-model="newVisible" :title="in18Data.INVITATION_NEW" :maskClosable="false" :okText="in18Data.CONFIRM" :cancelText="in18Data.CANCEL" @ok="newVisible = false">
      <a-descriptions bordered :column="1">
        <a-descriptions-item :label="in18Data.ID">
          {{ newCodeData.id }}
        </a-descriptions-item>
        <a-descriptions-item :label="in18Data.INVITATION_CODE">
          {{ newCodeData.code }}  <span style="cursor: pointer" :title="in18Data.CLICK_TO_COPY" v-clipboard:copy="newCodeData.code" v-clipboard:error="copyError" v-clipboard:success="copySuccess"><a-icon type="copy" /></span>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-table :columns="columns" :data-source="allData" size="middle" :pagination="false" :loading="loading">
      <span slot="code" slot-scope="code">
        <b>{{code}}</b> <span style="cursor: pointer" :title="in18Data.CLICK_TO_COPY" v-clipboard:copy="code" v-clipboard:error="copyError" v-clipboard:success="copySuccess"><a-icon type="copy" /></span>
      </span>
      <span slot="is_used" slot-scope="is_used">
        <a-tag color="#87d068" v-if="!is_used">
          {{in18Data.INVITATION_UNUSED}}
        </a-tag>
        <a-tag color="#f50" v-else>
          {{in18Data.INVITATION_USED}}
        </a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <a-space>
          <a-button type="danger" @click="deleteCode(record.id)" ><a-icon type="delete" />{{in18Data.INVITATION_DELETE}}</a-button>
        </a-space>
      </span>
    </a-table>
    <div class="table-pagination-box">
      <a-pagination v-model="page" :total="count" :defaultPageSize="pageSize" @change="pageChange"/>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
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
    title: '邀请码',
    titleIn18Key: 'INVITATION_CODE',
    dataIndex: 'code',
    key: 'code',
    scopedSlots: { customRender: 'code' },
    align: 'center'
  },
  {
    title: '状态',
    titleIn18Key: 'ADMIN_TABLE_TITLE_STATUS',
    dataIndex: 'is_used',
    key: 'is_used',
    scopedSlots: { customRender: 'is_used' },
    width: '300px',
    align: 'center'
  },
  {
    title: '动作',
    titleIn18Key: 'ADMIN_TABLE_TITLE_ACTION',
    scopedSlots: { customRender: 'action' },
    width: '200px',
    align: 'center'
  },
];
export default {
  name: "Invitation",
  components: {
  },
  data() {
    return {
      pageSize,
      columns,
      loading: true,
      newing: false,
      allData: [],
      page: 1,
      count: 0,
      newCodeData: {},
      newVisible: false
    }
  },
  computed: {
    ...mapState(['user', 'host', 'buildGetQuery', 'in18Data'])
  },
  methods: {
    ...mapMutations(['updateCurrentPage']),
    getData() {
      let that = this
      if (!that.user) {
        setTimeout(()=>{
          that.getData()
        }, 500)
        return
      }
      let page = this.$route.query.page
      if (!page) {
        page = 1;
      }
      that.page = page
      let query = that.buildGetQuery({
        user_id: that.user.id,
        page: page,
        page_size: pageSize
      })
      that.loading = true
      that.$http.get(that.host + '/invitation_code' + query)
          .then(data => {
            let Data = data.data
            that.allData = Data.data
            that.page = Data.meta.page
            that.count = Data.meta.count
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
    newCode() {
      let that = this
      that.newing = true
      that.$http.post(that.host + '/invitation_code')
          .then(data => {
            that.newCodeData = data.data
            that.newVisible = true
            that.$message.success('创建成功')
            that.getData()
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.newing = false
          })
    },
    deleteCode(id) {
      let that = this
      that.$http.delete(that.host + '/invitation_code/' + id)
          .then(() => {
            that.$message.success('删除成功')
            that.getData()
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
    copySuccess() {
      this.$message.success('复制到粘贴板成功')
    },
    copyError() {
      this.$message.error('复制到粘贴板失败')
    },
    pageChange(page) {
      this.$router.push({
        name: 'invitation',
        query: {
          page: page
        }
      })
    },
    updateTableColumnTitle() {
      for (let item of this.columns) {
        if (item.titleIn18Key) {
          item.title = this.in18Data[item.titleIn18Key]
        }
      }
    }
  },
  created() {
    this.updateCurrentPage({
      page: 'invitation',
      icon: 'link',
      title: this.in18Data.INVITATION_PAGE_TITLE
    })
    this.getData()
    this.updateTableColumnTitle()
  },
  watch: {
    '$route': function () {
      this.getData()
    }
  }
}
</script>

<style scoped>
.invitation-main-box{
  position: absolute;
  left: 50px;
  width: calc(100% - 100px);
}
.invitation-title{
  font-size: 20px;
  margin: 50px 0;
}
</style>

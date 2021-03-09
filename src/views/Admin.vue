<template>
  <div class="admin-main-box">
    <div class="admin-title">
      用户列表
    </div>
    <a-table :columns="columns" :data-source="userData" size="middle" :pagination="false" :loading="loading">
      <span slot="username" slot-scope="username">
        <b>{{username}}</b>
      </span>
      <span slot="permission" slot-scope="permission">
        <a-tag color="#87d068" v-if="permission === 0">
          普通用户
        </a-tag>
        <a-tag color="#108ee9" v-else-if="permission === 1">
          管理员
        </a-tag>
        <a-tag color="#f50" v-else>
          禁用
        </a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <a-space>
          <a-button @click="$message.info(record.username)" type="primary">查看用户</a-button>
          <a-button @click="$message.info(record.username)" >修改密码</a-button>
          <a-button @click="$message.info(record.username)" type="danger">禁用用户</a-button>
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
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    scopedSlots: { customRender: 'username' },
    width: '300px',
    align: 'center'
  },
  {
    title: '权限',
    dataIndex: 'permission',
    key: 'permission',
    scopedSlots: { customRender: 'permission' },
    width: '150px',
    align: 'center'
  },
  {
    title: '所属机构',
    dataIndex: 'organization',
    key: 'organization',
    scopedSlots: { customRender: 'organization' },
    // width: '200px',
    align: 'center'
  },
  {
    title: '动作',
    scopedSlots: { customRender: 'action' },
    width: '200px',
    align: 'center'
  },
];
export default {
  name: "Admin",
  components: {
  },
  data() {
    return {
      pageSize,
      columns,
      loading: false,
      userData: [],
      page: 1,
      count: 0
    }
  },
  computed: {
    ...mapState(['user', 'host', 'buildGetQuery'])
  },
  methods: {
    ...mapMutations(['updateCurrentPage']),
    getData() {
      let that = this
      let page = this.$route.query.page
      if (!page) {
        page = 1;
      }
      that.page = page
      let query = that.buildGetQuery({
        page: page,
        pageSize: pageSize
      })
      that.loading = true
      that.$http.get(that.host + '/user' + query)
          .then(data => {
            let Data = data.data
            that.userData = Data.data
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
    pageChange(page) {
      this.$router.push({
        name: 'admin',
        query: {
          page: page
        }
      })
    }
  },
  created() {
    this.updateCurrentPage({
      page: 'admin',
      icon: 'deployment-unit',
      title: '用户管理'
    })
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
  position: absolute;
  left: 50px;
  width: calc(100% - 100px);
}
.admin-title{
  font-size: 20px;
  margin: 50px 0;
}
</style>

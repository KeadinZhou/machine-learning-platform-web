<template>
  <div class="admin-main-box">
    <div class="admin-title">
      {{in18Data.ADMIN_USER_LIST}}
    </div>
    <a-table :columns="columns" :data-source="userData" size="middle" :pagination="false" :loading="loading">
      <span slot="username" slot-scope="username">
        <b>{{username}}</b>
      </span>
      <span slot="permission" slot-scope="permission">
        <a-tag color="#87d068" v-if="permission === 0">
          {{in18Data.ADMIN_USER_NORMAL_USER}}
        </a-tag>
        <a-tag color="#108ee9" v-else-if="permission === 1">
          {{in18Data.ADMIN_USER_ADMIN}}
        </a-tag>
        <a-tag color="#f50" v-else>
          {{in18Data.ADMIN_USER_FORBIDDEN}}
        </a-tag>
      </span>
      <span slot="block" slot-scope="block">
        <a-tag color="#87d068" v-if="block === 0">
          {{in18Data.ADMIN_BLOCK_NORMAL}}
        </a-tag>
        <a-tag color="#f50" v-else>
          {{in18Data.ADMIN_BLOCK_FORBIDDEN}}
        </a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <a-space>
          <a-button type="primary" @click="$router.push({name: 'project', query: {user: record.id}})">{{in18Data.ADMIN_ACTION_WATCH_PROJECT}}</a-button>
          <a-button style="background: #E6A23C; color: white" @click="updateUser(record.id, {permission: 1})" v-if="record.permission === 0">{{in18Data.ADMIN_ACTION_MAKE_ADMIN}}</a-button>
          <a-button @click="updateUser(record.id, {permission: 0})" v-else>{{in18Data.ADMIN_ACTION_CANCEL_ADMIN}}</a-button>
          <a-button type="danger" @click="updateUser(record.id, {block: 1})" v-if="record.block === 0">{{in18Data.ADMIN_ACTION_BLOCK_USER}}</a-button>
          <a-button @click="updateUser(record.id, {block: 0})" v-else>{{in18Data.ADMIN_ACTION_CANCEL_BLOCK_USER}}</a-button>
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
    titleIn18Key: 'ADMIN_TABLE_TITLE_USERNAME',
    dataIndex: 'username',
    key: 'username',
    scopedSlots: { customRender: 'username' },
    width: '300px',
    align: 'center'
  },
  {
    title: '权限',
    titleIn18Key: 'ADMIN_TABLE_TITLE_PERMISSION',
    dataIndex: 'permission',
    key: 'permission',
    scopedSlots: { customRender: 'permission' },
    width: '150px',
    align: 'center'
  },
  {
    title: '状态',
    titleIn18Key: 'ADMIN_TABLE_TITLE_STATUS',
    dataIndex: 'block',
    key: 'block',
    scopedSlots: { customRender: 'block' },
    width: '150px',
    align: 'center'
  },
  {
    title: '所属机构',
    titleIn18Key: 'ADMIN_TABLE_TITLE_ORGANIZATION',
    dataIndex: 'organization',
    key: 'organization',
    scopedSlots: { customRender: 'organization' },
    // width: '200px',
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
    ...mapState(['user', 'host', 'buildGetQuery', 'in18Data'])
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
        page_size: pageSize
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
    updateUser(user_id, updateData) {
      let that = this

      let sendData = new FormData()
      for (let name in updateData) {
        sendData.append(name,  updateData[name])
      }

      that.$http.put(that.host + '/user/' + user_id, sendData)
          .then(data => {
            that.$message.success(data.data.message)
            this.getData()
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
      page: 'admin',
      icon: 'deployment-unit',
      title: this.in18Data.ADMIN_PAGE_TITLE
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

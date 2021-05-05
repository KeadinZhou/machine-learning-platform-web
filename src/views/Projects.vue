<template>
  <div class="project-main-box">
    <div class="project-title">
      <span v-if="!otherUser">{{in18Data.PROJECTS_CHOOSES_ONE}}</span>
      <span v-else>{{in18Data.PROJECTS_CHOOSES_ONE}} [<b>{{otherUsername}}</b>] </span>
    </div>
    <loading-box-frame v-if="loading"></loading-box-frame>
    <div class="project-item-box" v-else>
      <project-list-item add @toUpdate="getData" v-if="!otherUser"></project-list-item>
      <project-list-item v-for="(item,index) in projects" :key="item.name + index" :project="item" @toUpdate="getData"></project-list-item>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex"
import ProjectListItem from '@/components/projects/project-list-item'
import LoadingBoxFrame from '@/components/frame/loading-box-frame'

export default {
  name: "Projects",
  components: {
    'project-list-item': ProjectListItem,
    'loading-box-frame': LoadingBoxFrame
  },
  data() {
    return {
      loading: true,
      projects: [],
      otherUser: undefined,
      otherUsername: undefined
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
      that.loading = true
      let user_id = that.user.id
      that.otherUsername = undefined
      if (that.$route.query.user) {
        user_id = that.$route.query.user
        that.otherUser = user_id
        that.getOtherUsername()
      } else {
        that.otherUser = undefined
      }
      let query = that.buildGetQuery({user_id: user_id})
      that.$http.get(that.host + '/project' + query)
          .then(data => {
            that.projects = data.data.data
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
    getOtherUsername() {
      let that = this
      that.$http.get(that.host + '/user/' + that.otherUser)
          .then(data => {
            that.otherUsername = data.data.username
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
    }
  },
  created() {
    this.updateCurrentPage({
      page: 'project',
      icon: 'folder-open',
      title: this.in18Data.PROJECTS_PAGE_TITLE
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
  .project-main-box{
    position: absolute;
    left: 50px;
    width: calc(100% - 100px);
  }
  .project-title{
    font-size: 20px;
    margin: 50px 0;
  }
  .project-item-box{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
  }
</style>

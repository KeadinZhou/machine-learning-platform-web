<template>
  <div class="project-main-box">
    <div class="project-title">
      选择你要编辑的项目
    </div>
    <loading-box-frame v-if="loading"></loading-box-frame>
    <div class="project-item-box" v-else>
      <project-list-item add @toUpdate="getData"></project-list-item>
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
    }
  },
  computed: {
    ...mapState(['user', 'host', 'buildGetQuery'])
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
    }
  },
  created() {
    this.updateCurrentPage({
      page: 'project',
      icon: 'folder-open',
      title: '项目列表'
    })
    this.getData()
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

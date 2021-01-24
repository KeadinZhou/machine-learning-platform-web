<template>
  <div style="height: 100%">
    <project-file-tree style="width: 250px"></project-file-tree>
    <project-default-node style="width: calc(100% - 250px + 20px)"></project-default-node>
    <project-actions-bar style="width: 30px"></project-actions-bar>
  </div>
</template>

<script>
import {mapState} from "vuex"
import ProjectFileTree from '@/components/project/project-file-tree'
import ProjectDefaultNode from '@/components/project/project-default-node'
import ProjectActionsBar from '@/components/project/project-actions-bar'
export default {
  name: "Project",
  components: {
    'project-file-tree': ProjectFileTree,
    'project-default-node': ProjectDefaultNode,
    'project-actions-bar': ProjectActionsBar
  },
  data() {
    return {
      loading: false,
      projectInfoLoaded: false,
      projectInfo: {
        id: '',
        name: '',
        description: '',
        tag: ''
      }
    }
  },
  computed: {
    ...mapState(['host'])
  },
  methods: {
    getData() {
      let that = this
      let project_id = that.$route.params.id
      that.loading = true
      that.$http.get(that.host + `/project/${project_id}`)
          .then(data => {
            that.projectInfo = data.data
            that.projectInfoLoaded = true
            that.$store.commit('updateCurrentPage', {
              page: 'project_open',
              icon: 'apartment',
              title: `项目建模 - ${that.projectInfo.name}`
            })
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
    this.$store.commit('updateCurrentPage', {
      page: 'project_open',
      icon: 'apartment',
      title: '项目建模'
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

</style>

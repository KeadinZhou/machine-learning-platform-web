<template>
  <div>
    Project
  </div>
</template>

<script>
export default {
  name: "Project",
  created() {
    this.$store.commit('updateCurrentPage', {
      page: 'project',
      icon: 'folder-open',
      title: '项目列表'
    })
  }
}
</script>

<style scoped>

</style>

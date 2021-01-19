<template>
  <span></span>
</template>

<script>
export default {
  name: "Home",
  created() {
    this.$store.commit('updateUser', true)
  }
}
</script>

<style scoped>

</style>

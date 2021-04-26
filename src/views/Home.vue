<template>
  <span></span>
</template>

<script>
export default {
  name: "Home",
  created() {
    this.$store.commit('updateUser', true)
    let lang = this.$route.query.lang
    if (lang) {
      this.$store.commit('updateIn18Value', lang)
    }
  }
}
</script>

<style scoped>

</style>

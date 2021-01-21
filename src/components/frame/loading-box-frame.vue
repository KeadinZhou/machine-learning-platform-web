<template>
  <div :style="`width: ${width?width:'100%'}; height: ${height?height:'300px'};display: flex;align-items: center;justify-content: center`">
    <a-spin :size="size?size:'default'"/>
  </div>
</template>

<script>
export default {
  name: "loading-box-frame",
  props: {
    width: String,
    height: String,
    size: String
  }
}
</script>

<style scoped>

</style>

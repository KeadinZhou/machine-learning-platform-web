<template>
  <pre
      class="base-console"
      :style="`height: ${height ? height : '100%'};width: ${width ? width : '100%'}`"
  >{{content}}<span v-show="cursorVisible">▂</span></pre>
</template>

<script>
const INTERVAL = 500
export default {
  name: "base-console",
  props: {
    content: String,
    width: String,
    height: String
  },
  data() {
    return {
      INTERVAL,
      cursorVisible: true,
    }
  },
  methods: {
    changeCursorVisible() {
      let that = this
      that.cursorVisible = !that.cursorVisible
      setTimeout(()=>{
        that.changeCursorVisible()
      }, that.INTERVAL)
    }
  },
  created() {
    this.changeCursorVisible()
  }
}
</script>

<style scoped>
.base-console{
  background: black;
  color: white;
}
</style>

<template>
  <div id="app">
    <page-nav></page-nav>
    <div id="mainBox" ref="pageBox">
      <router-view/>
    </div>
  </div>
</template>

<script>
import PageNav from '@/components/page-item/page-nav'
export default {
  components: {
    'page-nav': PageNav
  },
  data() {
    return {
      clientHeight: window.innerHeight,
      clientWidth: window.innerWidth
    }
  },
  methods: {
    fixPageSize() {
      this.clientHeight = window.innerHeight
      this.clientWidth = window.innerWidth
      this.$refs.pageBox.style.minHeight = this.clientHeight - 65 + 'px'
    }
  },
  mounted() {
    this.fixPageSize()
    const that = this
    window.onresize = () => {
      return (() => {
        that.fixPageSize()
      })()
    }
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
  border: 0;
  text-decoration: none;
  list-style-type: none;
}

#app {
  font-family: "Helvetica Neue", Helvetica, "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  overflow: hidden;
  width: 100%;
  min-width: 1100px;
  /*background: rgb(237,240,242);*/
}

#mainBox{
  width: 100%;
  position: relative;
}

.ant-menu-horizontal {
  border-bottom: 0;
}

.ant-card-body{
  padding: 0;
}

.ant-card-hoverable{
  cursor: auto;
}

.table-error-row {
  background: linear-gradient(to right, rgb(253,226,226) 0%, white 15%);
}
.table-right-row {
  background: linear-gradient(to right, rgb(225,243,216) 0%, white 15%);
}
.table-pagination-box {
  margin: 20px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}
.CodeMirror{
  height: auto;
  min-height: 500px;
}
</style>

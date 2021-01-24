<template>
  <div class="project-default-node-box">
    <div class="project-default-node-box-title">
      模型组件
    </div>
    <div class="project-default-node-box-content">
      <project-node-list-box></project-node-list-box>
    </div>
  </div>
</template>

<script>
import ProjectNodeListBox from '@/components/project/project-node-list-box'
export default {
  name: "project-default-node",
  components: {
    'project-node-list-box': ProjectNodeListBox
  }
}
</script>

<style scoped>
.project-default-node-box{
  width: 100%;
  height: 180px;
  box-shadow: 0 1px 4px rgba(0,21,41,.21);
  position: absolute;
  z-index: 96;
  bottom: 0;
  right: 0;
}
.project-default-node-box-title{
  background: #DADADA;
  width: calc(100% - 20px);
  margin-left: 20px;
  height: 45px;
  text-align: center;
  line-height: 45px;
  color: black;
}
.project-default-node-box-content{
  background: white;
  margin-left: 20px;
  width: calc(100% - 20px);
  height: calc(100% - 45px);
}
</style>

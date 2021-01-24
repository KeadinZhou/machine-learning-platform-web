<template>
  <div class="project-actions-bar">
    <span class="bar-button" title="运行"><a-icon type="play-circle" /></span>
    <span class="bar-button" title="保存"><a-icon type="save" /></span>
    <span class="bar-button" title="导入"><a-icon type="cloud-upload" /></span>
  </div>
</template>

<script>
export default {
  name: "project-actions-bar"
}
</script>

<style scoped>
.project-actions-bar{
  width: 100%;
  height: 100%;
  box-shadow: 0 1px 12px rgba(0,21,41,.21);
  position: absolute;
  z-index: 94;
  bottom: 0;
  right: 0;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.bar-button{
  margin: 5px 0;
  font-size: 16px;
  line-height: 28px;
  width: 28px;
  height: 28px;
  text-align: center;
  color: rgb(89,89,89);
}
.bar-button:hover{
  cursor: pointer;
  border: 1px solid #e9e9e9;
}
</style>

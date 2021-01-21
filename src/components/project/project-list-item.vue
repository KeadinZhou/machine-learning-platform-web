<template>
  <div>
    <a-card :hoverable="true" class="project-list-item project-list-item-add" v-if="add" @click="onAddClick">
      <div>
        <a-icon type="plus" /> 创建项目
      </div>
    </a-card>
    <a-card :hoverable="true" class="project-list-item" v-else>
      <div class="project-list-item-content">
        <div style="display: flex;align-items: flex-start">
          <div class="project-list-item-content-title" :title="project.name">
            {{ project.name }}
          </div>
          <a-tag :color="'#'+crc32(project.tag)">{{ project.tag }}</a-tag>
        </div>
        <div class="project-list-item-content-description" :title="project.description">
          {{ project.description }}
        </div>
      </div>
      <template slot="actions" class="project-list-item-action">
        <a-icon key="open" type="folder-open" title="打开项目" @click="$router.push({name: 'project_open', params: {id: project.id}})"/>
        <a-icon key="run" type="play-circle" title="运行项目" />
        <a-dropdown title="更多">
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">
            <a-icon type="ellipsis" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item @click="onEditClick">
              <a-icon type="edit" />编辑项目
            </a-menu-item>
            <a-menu-item @click="onDeleteClick">
              <a-icon type="delete" style="color: red"/>删除项目
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-card>
    <a-modal v-model="addVisible" :title="addMode?'添加项目':'编辑项目'" :maskClosable="false" :okText="addMode?'创建':'修改'" cancelText="取消" @ok="addSubmitCheck" :confirm-loading="submitting">
      <a-form-model :rules="addRules" :model="addData" ref="addForm">
        <a-form-model-item prop="name" label="项目名称">
          <a-input v-model="addData.name" placeholder="项目名称"/>
        </a-form-model-item>
        <a-form-model-item prop="description" label="项目描述">
          <a-textarea v-model="addData.description" placeholder="项目描述" :auto-size="{ minRows: 3, maxRows: 5 }"/>
        </a-form-model-item>
        <a-form-model-item prop="tag" label="项目标签">
          <a-input v-model="addData.tag" placeholder="项目标签"/>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "project-list-item",
  props: {
    add: Boolean,
    project: Object
  },
  data() {
    return {
      addMode: true,
      addData: {
        name: '',
        description: '',
        tag: ''
      },
      addRules: {
        name: [{ required: true, message: '请输入项目名称', trigger: 'blur' },],
        description: [{ required: true, message: '请输入项目描述', trigger: 'blur' },],
        tag: [{ required: true, message: '请输入项目标签', trigger: 'blur' },],
      },
      addVisible: false,
      submitting: false
    }
  },
  computed: {
    ...mapState(['crc32', 'host'])
  },
  methods: {
    onAddClick() {
      this.addData = {
        name: '',
        description: '',
        tag: ''
      }
      this.addVisible = true
      this.addMode = true
    },
    onEditClick() {
      this.addData = JSON.parse(JSON.stringify(this.project))
      this.addVisible = true
      this.addMode = false
    },
    onDeleteClick() {
      let that = this
      that.$confirm({
        title: '警告',
        content: `确认要删除项目 ${that.project.name} 吗？项目删除后不可恢复`,
        cancelText: '取消',
        okText: '确认',
        icon: 'warning',
        onOk() {
          that.deleteSubmit()
        },
        onCancel() {},
      });
    },
    addSubmitCheck() {
      let that = this
      that.$refs["addForm"].validate(valid => {
        if (valid) {
          if (that.addMode) {
            that.addSubmit()
          } else {
            that.editSubmit()
          }
        }
      })
    },
    addSubmit() {
      let that = this
      let sendData = new FormData()
      sendData.append('name', that.addData.name)
      sendData.append('description', that.addData.description)
      sendData.append('tag', that.addData.tag)
      that.submitting = true
      that.$http.post(that.host + '/project', sendData)
          .then(() => {
            that.$message.success('创建成功')
            that.$emit('toUpdate')
            that.addVisible = false
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.submitting = false
          })
    },
    editSubmit() {
      let that = this
      let sendData = new FormData()
      sendData.append('name', that.addData.name)
      sendData.append('description', that.addData.description)
      sendData.append('tag', that.addData.tag)
      that.submitting = true
      that.$http.put(that.host + `/project/${that.addData.id}`, sendData)
          .then(() => {
            that.$message.success('修改成功')
            that.$emit('toUpdate')
            that.addVisible = false
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.submitting = false
          })
    },
    deleteSubmit() {
      let that = this
      that.submitting = true
      that.$http.delete(that.host + `/project/${that.project.id}`)
          .then(() => {
            that.$message.success('删除成功')
            that.$emit('toUpdate')
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
            that.submitting = false
          })
    }
  }
}
</script>

<style scoped>
  .project-list-item{
    width: 350px;
    height: 180px;
    margin-right: 12px;
    margin-bottom: 20px;
  }
  .project-list-item-content{
    height: calc(180px - 51px);
    padding: 20px 40px;
  }
  .project-list-item-add{
    border: 1px dashed #c8c8c8;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .project-list-item-content-title{
    width: calc(100% - 50px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: bolder;
    font-size: 16px;
    color: black;
  }
  .project-list-item-content-description{
    margin-top: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    color: #88898A;
    font-size: 14px;
  }
</style>

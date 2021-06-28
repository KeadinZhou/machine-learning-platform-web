<template>
  <div>
    <a-dropdown placement="bottomCenter" v-if="add">
      <a-card :hoverable="true" class="project-list-item project-list-item-add" @click="onAddClick">
        <div>
          <a-icon type="plus" /> {{in18Data.PROJECT_CREATE}}
        </div>
      </a-card>
      <a-menu slot="overlay">
        <a-menu-item @click="onAddClick">
          <a-icon type="plus" /> {{ in18Data.PROJECT_CREATE_NEW }}
        </a-menu-item>
        <a-menu-item @click="onImportByShareClick">
          <a-icon type="share-alt" /> {{ in18Data.PROJECT_IMPORT_BY_SHARE_CODE }}
        </a-menu-item>
        <a-menu-item disabled>
          <a-icon type="cloud-upload" /> {{ in18Data.PROJECT_IMPORT_BY_UPLOAD }}
        </a-menu-item>
      </a-menu>
    </a-dropdown>
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
        <a-icon key="open" type="folder-open" :title="in18Data.PROJECT_OPEN" @click="$router.push({name: 'project_open', params: {id: project.id}})"/>
        <a-icon key="run" type="play-circle" :title="in18Data.PROJECT_RUN" />
        <a-dropdown :title="in18Data.MORE">
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">
            <a-icon type="ellipsis" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item @click="onEditClick">
              <a-icon type="edit" />{{in18Data.PROJECT_EDIT}}
            </a-menu-item>
            <a-menu-item @click="onShareClick">
              <a-icon type="share-alt" />{{in18Data.PROJECT_SHARE}}
            </a-menu-item>
            <a-menu-item @click="onDeleteClick">
              <a-icon type="delete" style="color: red"/>{{in18Data.PROJECT_DELETE}}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-card>
    <a-modal v-model="addVisible" :title="addMode?in18Data.PROJECT_CREATE:in18Data.PROJECT_EDIT" :maskClosable="false" :okText="addMode?in18Data.CREATE:in18Data.SAVE" :cancelText="in18Data.CANCEL" @ok="addSubmitCheck" :confirm-loading="submitting">
      <a-form-model :rules="addRules" :model="addData" ref="addForm">
        <a-form-model-item prop="name" :label="in18Data.PROJECT_NAME">
          <a-input v-model="addData.name" :placeholder="in18Data.PROJECT_NAME"/>
        </a-form-model-item>
        <a-form-model-item prop="description" :label="in18Data.PROJECT_DESCRIPTION">
          <a-textarea v-model="addData.description" :placeholder="in18Data.PROJECT_DESCRIPTION" :auto-size="{ minRows: 3, maxRows: 5 }"/>
        </a-form-model-item>
        <a-form-model-item prop="tag" :label="in18Data.PROJECT_TAG">
          <a-input v-model="addData.tag" :placeholder="in18Data.PROJECT_TAG"/>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal v-model="shareVisible" :title="in18Data.PROJECT_SHARE" :maskClosable="false" @ok="shareVisible = false" :footer="null">
      <a-spin v-if="sharing">
        <a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
      </a-spin>
      <a-descriptions bordered :column="1" v-else>
        <a-descriptions-item :label="in18Data.PROJECT_SHARE_CODE">
          {{ shareCode }}  <span style="cursor: pointer" :title="in18Data.CLICK_TO_COPY" v-clipboard:copy="shareCode" v-clipboard:error="copyError" v-clipboard:success="copySuccess"><a-icon type="copy" /></span>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
    <a-modal v-model="importByShareVisible" :title="in18Data.PROJECT_IMPORT_BY_SHARE_CODE" :maskClosable="false" :okText="in18Data.IMPORT" :cancelText="in18Data.CANCEL" @ok="importByShareSubmit" :confirm-loading="importingByShare">
      <a-input v-model="shareCodeInput" :placeholder="in18Data.PROJECT_SHARE_CODE"/>
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
        name: [{ required: true, message: '', trigger: 'blur' },],
        description: [{ required: true, message: '', trigger: 'blur' },],
        tag: [{ required: true, message: '', trigger: 'blur' },],
      },
      addVisible: false,
      submitting: false,
      shareVisible: false,
      sharing: false,
      shareCode: '9crTpI6LHbhzxSBC7o5mJnPqUg2FZjiX',
      importByShareVisible: false,
      importingByShare: false,
      shareCodeInput: '',
    }
  },
  computed: {
    ...mapState(['crc32', 'host', 'in18Data'])
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
    onImportByShareClick() {
      let that = this
      that.importByShareVisible = true
    },
    onEditClick() {
      this.addData = JSON.parse(JSON.stringify(this.project))
      this.addVisible = true
      this.addMode = false
    },
    onShareClick() {
      let that = this
      that.shareVisible = true

      // share
      that.sharing = true
      setTimeout(() => {
        that.sharing = false
        that.$message.success('获取分享码成功')
      }, 1000)

    },
    onDeleteClick() {
      let that = this
      that.$confirm({
        title: that.in18Data.WARNING,
        content: `确认要删除项目 ${that.project.name} 吗？项目删除后不可恢复`,
        cancelText: that.in18Data.CANCEL,
        okText: that.in18Data.CONFIRM,
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
    },
    importByShareSubmit() {
      let that = this

      if (!that.shareCodeInput) {
        that.$message.error('不能为空')
        return
      }

      that.importingByShare = true
      setTimeout(() => {
        that.importByShareVisible = false
        that.importingByShare = false
        that.$message.success('导入成功')
        that.$emit('toUpdate')
      }, 1000)
    },
    copySuccess() {
      this.$message.success('复制到粘贴板成功')
    },
    copyError() {
      this.$message.error('复制到粘贴板失败')
    },
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

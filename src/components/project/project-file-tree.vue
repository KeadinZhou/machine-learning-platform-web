<template>
  <div class="project-file-tree-box">
    <div class="project-file-tree-box-title">
      项目文件
    </div>
    <div class="project-file-tree-box-content">
      <a-directory-tree @select="onSelect" @expand="onExpand" :expandedKeys="expanded" expandAction="dblclick" :treeData="treeData" :load-data="onLoadData" v-if="treeShow"/>
    </div>
    <div class="project-file-tree-edit-box">
      <span class="project-file-tree-edit-edit" title="刷新" @click="initLoad"><a-icon type="redo"/></span>
      <span v-if="buttonShow.upload" class="project-file-tree-edit-upload" title="上传文件" @click="uploadClick"><a-icon type="upload"/></span>
      <span v-if="buttonShow.edit" class="project-file-tree-edit-edit" title="重命名" @click="editClick"><a-icon type="edit"/></span>
      <span v-if="buttonShow.add" class="project-file-tree-edit-add" title="新建目录" @click="addClick"><a-icon type="folder-add"/></span>
      <span v-if="buttonShow.del" class="project-file-tree-edit-delete" title="删除" @click="deleteClick"><a-icon type="delete"/></span>
    </div>
    <input type="file" style="display: none" id="upload" @change="uploadSubmit"/>
    <a-modal v-model="editModalVisible" title="重命名" :maskClosable="false" okText="确认" cancelText="取消" @ok="editSubmit" :confirm-loading="editing">
      <a-form-model :rules="editRules" :model="editData" ref="editForm">
        <a-form-model-item prop="old_filename" label="旧文件名">
          <a-input v-model="editData.old_filename" placeholder="旧文件名" readOnly/>
        </a-form-model-item>
        <a-form-model-item prop="new_filename" label="新文件名">
          <a-input v-model="editData.new_filename" placeholder="新文件名"/>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal v-model="addModalVisible" title="新建文件夹" :maskClosable="false" okText="确认" cancelText="取消" @ok="addSubmit" :confirm-loading="adding">
      <a-form-model :model="addData" ref="editForm">
        <a-form-model-item prop="dir" label="文件夹名称">
          <a-input v-model="addData.dir" placeholder="文件夹名称"/>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "project-file-tree",
  data() {
    return {
      treeShow: false,
      treeData: [],
      selected: [],
      expanded: [],
      selectedComponent: null,
      selectedFatherComponent: null,
      buttonShow: {
        upload: true,
        edit: false,
        add: true,
        del: false
      },
      editModalVisible: false,
      editData: {
        old_filename: '',
        new_filename: ''
      },
      editRules: {
        old_filename: [{ required: true, message: '请输入文件名', trigger: 'change' },],
        new_filename: [{ required: true, message: '请输入文件名', trigger: 'change' },],
      },
      editing: false,
      addModalVisible: false,
      addData: {
        dir: ''
      },
      adding: false
    }
  },
  computed: {
    ...mapState(['host','buildGetQuery'])
  },
  methods: {
    buttonShowSwitch(k) {
      if (k.length === 0) {
        this.buttonShow = {upload: true, edit: false, add: true, del: false}
      } else {
        let key = k[0]
        if (key === '/') {
          this.buttonShow = {upload: true, edit: false, add: true, del: false}
        } else {
          if (key.endsWith('/')) {
            this.buttonShow = {upload: true, edit: true, add: true, del: true}
          } else {
            this.buttonShow = {upload: false, edit: true, add: false, del: true}
          }
        }
      }
    },
    onSelect(k, e) {
      this.selected = k
      this.selectedComponent = e.node
      this.selectedFatherComponent = e.node.$parent
      this.buttonShowSwitch(k)
    },
    onExpand(k) {
      this.expanded = k
    },
    onLoadData(treeNode) {
      let that = this
      return new Promise(resolve => {
        that.getData(treeNode.eventKey)
            .then(data => {
              treeNode.dataRef.children = data
              that.treeData = [...that.treeData];
              resolve()
            })
            .catch(() => resolve())
      });
    },
    getData(path) {
      let that = this
      return new Promise((resolve, reject) => {
        let project_id = that.$route.params.id
        let query = that.buildGetQuery({project_id: project_id, dir: path})
        that.$http.get(that.host + `/file` + query)
            .then(data => {
              let result = []
              for (let item of data.data.data) {
                result.push({
                  key: `${path}${item.name}${(item.type=== 'dir')?'/':''}`,
                  title: item.name,
                  isLeaf: item.type !== 'dir'
                })
              }
              resolve(result)
            })
            .catch((error) => {
              if (error.response) {
                that.$message.error(error.response.data.message)
              } else {
                that.$message.error('请求失败')
              }
              reject()
            })
      })
    },
    deleteClick() {
      let that = this
      if (that.selected.length < 1) {
        return
      }
      let item = that.selected[0]
      that.$confirm({
        title: '警告',
        content: `确认要删除文件${item.endsWith('/')?'夹':''} ${that.selected[0]} 吗？删除后不可恢复`,
        cancelText: '取消',
        okText: '确认',
        icon: 'warning',
        onOk() {
          that.deleteSubmit(item)
        },
        onCancel() {},
      });
    },
    uploadClick() {
      document.getElementById('upload').click()
    },
    editClick() {
      this.editData.old_filename = this.selected[0]
      this.editData.new_filename = this.selected[0]
      this.editModalVisible = true
    },
    addClick() {
      this.addData.dir = ''
      this.addModalVisible = true
    },
    deleteSubmit() {
      let that = this
      let project_id = that.$route.params.id
      let filename = that.selected[0]
      let query = {
        project_id: project_id,
        dir: filename,
        filename: filename
      }
      that.$http.delete(that.host + `/file${filename.endsWith('/')?`/directory`:''}` + that.buildGetQuery(query))
          .then(() => {
            that.$message.success('删除成功')
            that.onLoadData(that.selectedFatherComponent)
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(JSON.stringify(error.response.data.message))
            } else {
              that.$message.error('请求失败')
            }
          })
    },
    uploadSubmit(e) {
      let that = this
      let project_id = that.$route.params.id
      let file = e.target.files[0]
      let dir = (that.selected.length < 1) ? '/' : that.selected[0]
      let sendData = new FormData()
      let key = 'uploading-key'
      that.$message.loading({ content: '上传中...', key })
      sendData.append('file', file)
      sendData.append('project_id', project_id)
      sendData.append('dir', dir)
      that.$http.post(that.host + `/file`, sendData)
          .then(() => {
            that.$message.success({ content: '上传成功', key })
            if (that.selectedComponent) {
              that.onLoadData(that.selectedComponent)
            } else {
              that.initLoad()
            }
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error({ content: JSON.stringify(error.response.data.message), key })
            } else {
              that.$message.error({ content: '请求失败', key })
            }
          })
          .finally(()=>{
            document.getElementById('upload').value = ''
          })
    },
    editSubmit() {
      let that = this
      if (that.editData.new_filename === '') {
        that.$message.error('请填写文件名')
        return
      }
      let project_id = that.$route.params.id
      let query = {
        project_id: project_id,
        old_filename: that.editData.old_filename,
        new_filename: that.editData.new_filename
      }
      that.editing = true
      that.$http.put(that.host + `/file${that.editData.old_filename.endsWith('/')?``:''}` + that.buildGetQuery(query))
        .then(() => {
          that.$message.success('修改成功')
          that.onLoadData(that.selectedFatherComponent)
          that.editModalVisible = false
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(JSON.stringify(error.response.data.message))
          } else {
            that.$message.error('请求失败')
          }
        })
        .finally(()=>{
          that.editing = false
        })
    },
    addSubmit() {
      let that = this
      if (that.addData.dir === '') {
        that.$message.error('请填写文件名')
        return
      }
      let project_id = that.$route.params.id
      let dir = (that.selected.length < 1) ? '/' : that.selected[0]
      let sendData = new FormData()
      sendData.append('project_id', project_id)
      sendData.append('dir', dir + that.addData.dir)
      that.adding = true
      that.$http.post(that.host + `/file/directory`, sendData)
          .then(() => {
            that.$message.success('新建成功')
            that.addModalVisible = false
            if (that.selectedComponent) {
              that.onLoadData(that.selectedComponent)
            } else {
              that.initLoad()
            }
          })
          .catch((error) => {
            if (error.response) {
              that.$message.error(JSON.stringify(error.response.data.message))
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(()=>{
            that.adding = false
          })
    },
    initLoad() {
      this.treeShow = false
      this.treeData = [{key: '/', title: '/'}]
      this.expanded = ['/']
      this.selectedComponent = null
      this.selectedFatherComponent = null
      this.buttonShow = {
        upload: true,
        edit: false,
        add: true,
        del: false
      }
      this.$nextTick(()=>{
        this.treeShow = true
      })
    }
  },
  created() {
    this.initLoad()
  }
}
</script>

<style scoped>
.project-file-tree-box{
  width: 100%;
  height: 100%;
  box-shadow: 0 1px 10px rgba(0,21,41,.21);
  position: absolute;
  z-index: 98;
  left: 0;
  bottom: 0;
}
.project-file-tree-box-title{
  background: #DADADA;
  width: 100%;
  height: 45px;
  text-align: center;
  line-height: 45px;
  color: black;
}
.project-file-tree-box-content{
  height: calc(100% - 45px - 32px);
  overflow: auto;
  background: white;
}
.project-file-tree-edit-box{
  height: 32px;
  width: 100%;
  background: rgb(242,242,242);
  display: flex;
  font-size: 18px;
  justify-content: space-around;
  align-items: center;
}
.project-file-tree-edit-upload,.project-file-tree-edit-add,.project-file-tree-edit-edit{
  cursor: pointer;
}
.project-file-tree-edit-upload:hover,.project-file-tree-edit-add:hover,.project-file-tree-edit-edit:hover{
  color: black;
}
.project-file-tree-edit-delete{
  color: #ff3300;
  cursor: pointer;
}
.project-file-tree-edit-delete:hover{
  color: red;
}
</style>

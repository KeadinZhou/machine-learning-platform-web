<template>
  <div>
    <template v-if="defaultValue">
      <el-tooltip class="item" effect="dark" content="模型参数说明" placement="top">
        <a style="cursor: pointer" :href="defaultValue.doc_url" target="_blank"><i class="el-icon-question"></i></a>
      </el-tooltip>
    </template>
    <pre v-if="!edit">{{value}}</pre>
    <div v-else>
      { <br>
      <div class="dict-item-box" v-for="(item, index) in arrayData" :key="item+index">
        <el-input class="dict-item-input" v-model="item.name"></el-input> <b style="margin: 5px">:</b> <el-input class="dict-item-input" v-model="item.value"></el-input> <b style="margin: 5px">,</b>
        <el-button style="margin: 5px 10px"  type="danger" icon="el-icon-minus" size="mini" @click="delDictItem(index)"></el-button>
      </div>
      <div>
        <el-button style="margin: 5px 10px" icon="el-icon-plus" size="mini" @click="addDictItem"></el-button>
      </div>
      } <br><br>
    </div>

    <a-space>
      <el-button v-if="!edit" icon="el-icon-edit" size="mini" @click="editClick">编辑Dict</el-button>
      <el-button v-else type="primary" icon="el-icon-check" size="mini" @click="saveClick">保存Dict</el-button>
      <template v-if="defaultValue && !edit">
        <el-button icon="el-icon-copy-document" size="mini" @click="modalVisible = true">使用默认参数</el-button>
      </template>
    </a-space>

    <a-modal v-model="modalVisible" title="使用默认参数确认" :maskClosable="false" okText="确认" cancelText="取消" @ok="useDefault">
      <p>确认要使用以下默认参数吗？使用后会覆盖原有的参数设置</p>
      <pre style="background: black; color: white">{{defaultValueToObject}}</pre>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: "dict-input",
  props: {
    value: Object,
    defaultValue: Object
  },
  data() {
    return {
      edit: false,
      nowValue: null,
      arrayData: [],
      modalVisible: false
    }
  },
  computed: {
    defaultValueToObject: function (){
      let res = []
      for (let item of this.defaultValue.defaultValue) {
        res.push({
          param: item[0],
          defaultValue: item[2],
          description: item[1]
        })
      }
      return res
    }
  },
  methods: {
    editClick() {
      this.objectToArray()
      this.edit = true
    },
    saveClick() {
      if (this.arrayToObject()) {
        this.edit = false
      }
    },
    delDictItem(index) {
      this.arrayData.splice(index, 1)
    },
    addDictItem() {
      this.arrayData.push({
        name: '',
        value: ''
      })
    },
    objectToArray() {
      this.arrayData = []
      if (this.value === null) {
        return
      }
      for (let name in this.value) {
        this.arrayData.push({
          name: name,
          value: this.value[name]
        })
      }
    },
    arrayToObject() {
      this.nowValue = {}
      let keyMap = new Map()
      for (let item of this.arrayData) {
        if (item.name === '') {
          this.$message.error('Key 不能为空')
          return false
        }
        if (keyMap.has(item.name)) {
          this.$message.error('Key 不能重复')
          return false
        }
        keyMap.set(item.name, item.value)
        this.nowValue[item.name] = item.value
      }
      this.$emit('input', this.nowValue)
      return true
    },
    useDefault() {
      this.arrayData = []
      for (let item of this.defaultValue.defaultValue) {
        this.arrayData.push({
          name: item[0],
          value: item[2],
        })
      }
      this.arrayToObject()
      this.modalVisible = false
      this.$message.success('使用成功')
    },
  },
}
</script>

<style scoped>
.dict-item-box {
  display: flex;
}
.dict-item-input{
  width: 40%;
  margin: 5px 10px;
}
</style>

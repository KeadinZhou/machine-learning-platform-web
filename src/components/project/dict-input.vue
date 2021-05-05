<template>
  <div>
    <template v-if="defaultValue">
      <el-tooltip class="item" effect="dark" :content="in18Data.DICT_INPUT_ABOUT" placement="top">
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
      <el-button v-if="!edit" icon="el-icon-edit" size="mini" @click="editClick">{{in18Data.DICT_INPUT_EDIT}}</el-button>
      <el-button v-else type="primary" icon="el-icon-check" size="mini" @click="saveClick">{{in18Data.DICT_INPUT_SAVE}}</el-button>
      <template v-if="defaultValue && !edit">
        <el-button icon="el-icon-copy-document" size="mini" @click="modalVisible = true">{{in18Data.DICT_INPUT_USES_DEFAULT}}</el-button>
      </template>
    </a-space>

    <a-modal v-model="modalVisible" :title="in18Data.DICT_INPUT_USES_DEFAULT" :maskClosable="false" :okText="in18Data.CONFIRM" :cancelText="in18Data.CANCEL" @ok="useDefault">
      <p>{{in18Data.DICT_INPUT_USE_DEFAULT_WARNING}}</p>
      <pre style="background: black; color: white">{{defaultValueToObject}}</pre>
    </a-modal>
  </div>
</template>

<script>
import {mapState} from "vuex";

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
    ...mapState(['in18Data']),
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

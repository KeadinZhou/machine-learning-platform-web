<template>
  <div>
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
    <el-button v-if="!edit" icon="el-icon-edit" size="mini" @click="editClick">编辑Dict</el-button>
    <el-button v-else type="primary" icon="el-icon-check" size="mini" @click="saveClick">保存Dict</el-button>
  </div>
</template>

<script>
export default {
  name: "dict-input",
  props: {
    value: Object
  },
  data() {
    return {
      edit: false,
      nowValue: null,
      arrayData: []
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
    }
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

<template>
  <div class="dynamic-form">
    <div v-for="(config,index) in paramsConfig" :key="'params'+config.name+index" class="dynamic-form-item">
      <div class="dynamic-form-item-label">
        <b>{{`${config.name}:`}}</b>
      </div>
      <div class="dynamic-form-item-description">
        {{`${config.description}`}}
      </div>

      <div v-if="config.type === 'bool'" class="dynamic-form-item-input">
        <el-select v-model="nowValue[config.name]" placeholder="请选择" style="width: 100%" size="medium">
          <el-option label="true" :value="true"></el-option>
          <el-option label="false" :value="false"></el-option>
        </el-select>
      </div>
      <div v-if="config.enum.length > 0" class="dynamic-form-item-input">
        <el-select v-model="nowValue[config.name]" placeholder="请选择" style="width: 100%" size="medium" popper-class="my-el-select-dropdown">
          <el-option
              style="width: 100%"
              v-for="(item, index) in config.enum"
              :key="''+item+index"
              :value="item[0]">
            <span style="float: left">{{ item[0] }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item[1] }}</span>
          </el-option>
        </el-select>
      </div>
      <div v-else-if="config.type === 'str' && config.name !== 'code'" class="dynamic-form-item-input">
        <el-input v-model="nowValue[config.name]" :placeholder="`请输入(${config.type}${config.range.length ? ` [${config.range}]` : ''})`"  style="width: 100%" size="medium">
        </el-input>
      </div>
      <div v-else-if="config.type === 'str' && config.name === 'code'" class="dynamic-form-item-input">
        <el-input v-model="nowValue[config.name]" :placeholder="`请输入代码`" type="textarea" style="width: 100%" size="medium" :autosize="{ minRows: 15, maxRows: 20 }">
        </el-input>
      </div>
      <div v-else-if="config.type === 'float'" class="dynamic-form-item-input">
        <el-input v-model="nowValue[config.name]" :placeholder="`请输入(${config.type}${config.range.length ? ` [${config.range}]` : ''})`" style="width: 100%" size="medium">
        </el-input>
      </div>
      <div v-else-if="config.type === 'int'" class="dynamic-form-item-input">
        <el-input v-model="nowValue[config.name]" :placeholder="`请输入(${config.type}${config.range.length ? ` [${config.range}]` : ''})`" style="width: 100%" size="medium">
        </el-input>
      </div>
      <div v-else-if="config.type === 'dict' && config.name === 'model_kwargs'" class="dynamic-form-item-input">
        <dict-input v-model="nowValue[config.name]" :defaultValue="getDefaultValueFromModel(nowValue.model)" style="width: 100%">
        </dict-input>
      </div>
      <div v-else-if="config.type === 'dict'" class="dynamic-form-item-input">
        <dict-input v-model="nowValue[config.name]"  style="width: 100%">
        </dict-input>
      </div>

    </div>
  </div>
</template>

<script>
import DictInput from '@/components/project/dict-input'
export default {
  name: "dynamic-form",
  props: {
    paramsConfig: Array,
    value: Object
  },
  components: {
    'dict-input': DictInput
  },
  data() {
    return {
      nowValue: {}
    }
  },
  methods: {
    getDefaultValueFromModel(modelName) {
      for (let config of this.paramsConfig) {
        if (config.name === 'model') {
          for (let item of config.enum) {
            if (item[0] === modelName) {
              return {
                name: item[0],
                name_zh: item[1],
                doc_url: item[2],
                defaultValue: item[3]
              }
            }
          }
        }
      }
      return null
    }
  },
  created() {
    this.nowValue = JSON.parse(JSON.stringify(this.value))
  },
  watch: {
    nowValue: {
      handler(new_value) {
        this.$emit('input', new_value)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.dynamic-form{

}
.dynamic-form-item-label {
  font-size: 15px;
  color: black;
}
.dynamic-form-item-description {
  font-size: 12px;
}
.dynamic-form-item {
  margin-bottom: 10px;
}
.dynamic-form-item-input{
  margin: 5px 0;
}
</style>

<style>
.my-el-select-dropdown{
  width: 472px;
}
</style>

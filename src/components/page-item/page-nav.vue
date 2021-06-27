<template>
  <div class="page-nav" v-if="current_page.page !== 'login' && current_page.page !== 'register'">
    <div class="page-nav-title-icon">
      <div class="page-nav-icon" :title="in18Data.NAV_BACK_TO_PROJECTS" @click="$router.push({name: 'project'})">
        <a-icon :type="current_page.icon" />
      </div>
      <div class="page-nav-title">
        <span>{{current_page.title}}</span>
      </div>
    </div>
    <a-space class="page-nav-user-box" align="center" v-if="user">
      <a-dropdown>
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          <a-icon type="user" /> {{user.username}} <a-icon type="down" />
        </a>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="changePasswordClick">{{in18Data.NAV_PASSWORD}}</a-menu-item>
          <a-menu-item key="2" v-if="user.permission === 1" @click="$router.push({name:'admin'})">{{in18Data.NAV_USER}}</a-menu-item>
          <a-menu-item key="4" v-if="user.permission === 1" @click="$router.push({name:'invitation'})">{{in18Data.NAV_INVITATION}}</a-menu-item>
          <a-menu-item key="3" @click="logout">{{in18Data.NAV_LOGOUT}}</a-menu-item>
        </a-menu>
      </a-dropdown>
    </a-space>
    <a-modal
        title="修改密码"
        :visible="modalVisible"
        :confirm-loading="submitting"
        @ok="changePasswordCheck"
        @cancel="modalVisible = false"
    >
      <a-form-model :rules="rules" :model="form" ref="passwordForm">
        <a-form-model-item prop="oldPassword">
          <a-input v-model="form.oldPassword" :placeholder="in18Data.OLD_PASSWORD" type="password" size="large" @pressEnter="changePasswordCheck">
            <a-icon slot="prefix" type="lock" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password">
          <a-input v-model="form.password" :placeholder="in18Data.NEW_PASSWORD" type="password" size="large" @pressEnter="changePasswordCheck">
            <a-icon slot="prefix" type="lock" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password2">
          <a-input v-model="form.password2" :placeholder="in18Data.CONFIRM_PASSWORD" type="password" size="large" @pressEnter="changePasswordCheck">
            <a-icon slot="prefix" type="lock" />
          </a-input>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import passer from "@/util/Passer";
export default {
  name: "page-nav",
  data() {
    return {
      modalVisible: false,
      submitting: false,
      rules: {
        oldPassword: [{ required: true, message: '', trigger: 'blur' }],
        password: [{ required: true, message: '', trigger: 'blur' }, { validator: this.weakPasswordCheck, trigger: 'change' }],
        password2: [{ required: true, message: '', trigger: 'blur' }, { validator: this.password2check, trigger: 'change' }],
      },
      form: {
        oldPassword: '',
        password: '',
        password2: ''
      }
    }
  },
  computed: {
    ...mapState(['user', 'current_page', 'in18Data', 'host'])
  },
  methods: {
    ...mapMutations(['logout']),
    password2check(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error(this.in18Data.ENTERED_PASSWORDS_DIFFER))
      } else {
        callback()
      }
    },
    weakPasswordCheck(rule, value, callback) {
      if (!passer.checkPasswordLength(value)) {
        callback(new Error(this.in18Data.WRONG_PASSWORD_LENGTH))
      }
      if (!passer.checkPasswordStrength(value)) {
        callback(new Error(this.in18Data.WEAK_PASSWORD))
      }
      callback()
    },
    changePasswordClick() {
      let that = this
      that.modalVisible = true
    },
    changePasswordCheck() {
      let that = this
      that.$refs["passwordForm"].validate(valid => {
        if (valid) {
          that.changePasswordSubmit()
        }
      })
    },
    changePasswordSubmit() {
      let that = this

      if (!that.form.oldPassword || !that.form.password) return

      that.submitting = true

      let user_id = that.user.id
      let sendData = new FormData()
      sendData.append('old_password', that.form.oldPassword)
      sendData.append('password', that.form.password)

      that.$http.put(that.host + '/user/' + user_id, sendData)
          .then(data => {
            that.$message.success(data.data.message)
            that.modalVisible = false
            that.form = {
              oldPassword: '',
              password: '',
              password2: ''
            }
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
  .page-nav{
    width: 100%;
    height: 65px;
    background: white;
    box-shadow: 0 8px 12px 0 rgba(0, 52, 107, 0.04);
    display: flex;
    justify-content: space-between;
    z-index: 100;
    position: absolute;
  }
  .page-nav-title-icon{
    display: flex;
  }
  .page-nav-icon{
    width: 65px;
    height: 65px;
    font-size: 24px;
    color: black;
    background: #ebebeb;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .page-nav-user-box{
    height: 65px;
    margin-right: 20px;
  }
  .page-nav-title {
    height: 65px;
    line-height: 65px;
    display: inline-block;
    position: relative;
    margin-left: 20px;
  }
</style>

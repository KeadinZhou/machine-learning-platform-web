<template>
  <div>
    <a-card class="register-box" :hoverable="true">
      <div class="register-title">
        <h1><b>{{configuration[`${in18Value}-title`]}}</b></h1>
        <h2>{{in18Data.USER_REGISTER}}</h2>
      </div>
      <div class="register-form-box">
        <a-form-model :rules="rules" :model="user" ref="registerForm">
          <a-form-model-item prop="username">
            <a-input v-model="user.username" :placeholder="in18Data.USERNAME" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="password">
            <a-input v-model="user.password" :placeholder="in18Data.PASSWORD" type="password" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="password2">
            <a-input v-model="user.password2" :placeholder="in18Data.CONFIRM_PASSWORD" type="password" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="organization">
            <a-input v-model="user.organization" :placeholder="in18Data.ORGANIZATION" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="home" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="code">
            <a-input v-model="user.code" :placeholder="in18Data.INVITATION_CODE" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="idcard" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="captcha">
            <a-input v-model="user.captcha" :placeholder="in18Data.CAPTCHA" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="safety-certificate" />
              <a-tooltip slot="suffix" :title="in18Data.CAPTCHA_CLICK_TO_CHANGE">
                <img height="34px" :src="captchaUrl" :alt="in18Data.CAPTCHA_CLICK_TO_CHANGE" @click="captchaUrl = $store.state.host + '/captcha?k=' + Math.random()">
              </a-tooltip>
            </a-input>
          </a-form-model-item>
        </a-form-model>
        <a-button type="primary" style="width: 100%" @click="register">{{ in18Data.REGISTER }}</a-button>
        <div class="register-reg-switch" @click="$router.push({name: 'login'})">{{ in18Data.CLICK_TO_LOGIN }}</div>
      </div>
    </a-card>
    <div>
      <el-image
          class="login-page-image"
          :src="configuration[`${in18Value}-image`]"
          fit="contain"></el-image>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "Register",
  data() {
    return {
      captchaUrl: this.$store.state.host + '/captcha?k=' + Math.random(),
      user: {
        username: '',
        password: '',
        password2: '',
        captcha: '',
        organization: '',
        code: ''
      },
      rules: {
        username: [{ required: true, message: '', trigger: 'blur' },],
        password: [{ required: true, message: '', trigger: 'blur' },],
        password2: [{ required: true, message: '', trigger: 'blur' }, { validator: this.password2check, trigger: 'change' }],
        captcha: [{ required: true, message: '', trigger: 'blur' },],
        organization : [{ required: true, message: '', trigger: 'blur' },],
        code : [{ required: true, message: '', trigger: 'blur' },],
      }
    }
  },
  computed: {
    ...mapState(['host', 'buildGetQuery', 'in18Value', 'configuration', 'in18Data'])
  },
  methods: {
    password2check(rule, value, callback) {
      if (value !== this.user.password) {
        callback(new Error(this.in18Data.ENTERED_PASSWORDS_DIFFER))
      } else {
        callback()
      }
    },
    register() {
      let that = this
      that.$refs["registerForm"].validate(valid => {
        if (valid) {
          that.registerSubmit()
        }
      })
    },
    registerSubmit() {
      let that = this
      let sendData = new FormData()
      sendData.append('username', that.user.username)
      sendData.append('password', that.user.password)
      sendData.append('captcha', that.user.captcha)
      sendData.append('organization', that.user.organization)
      sendData.append('code', that.user.code)
      that.$http.post(this.$store.state.host + '/user', sendData)
          .then(() => {
            that.$message.success('注册成功')
            that.$store.commit('login', that.user)
          })
          .catch((error) => {
            if (error.response) {
              console.log(error.response.data.message)
              that.$message.error(error.response.data.message)
            } else {
              that.$message.error('请求失败')
            }
          })
          .finally(() => {
          })
    }
  },
  created() {
    this.$store.commit('updateCurrentPage', {
      page: 'register'
    })
  }
}
</script>

<style scoped>
.register-box{
  width: 400px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-130%, -50%);
  z-index: 1;
  background-color: rgba(255,255,255,.8);
}
.register-title{
  width: 100%;
  text-align: center;
  margin: 30px 0;
}
.register-form-box{
  margin: 30px;
}
.register-reg-switch{
  font-size: 12px;
  color: gray;
  text-align: center;
  margin-top: 10px;
  width: 100%;
  cursor: pointer;
  font-style: oblique;
}
.register-reg-switch:hover{
  text-decoration:underline;
}
.login-page-image{
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 0;
}
</style>

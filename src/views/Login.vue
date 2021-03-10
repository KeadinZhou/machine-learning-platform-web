<template>
  <div>
    <a-card class="login-box" :hoverable="true">
      <div class="login-title">
        <h1><b>人工智能可视化建模平台</b></h1>
        <h2>用户登录</h2>
      </div>
      <div class="login-form-box">
        <a-form-model :rules="rules" :model="user" ref="loginForm">
          <a-form-model-item prop="username">
            <a-input v-model="user.username" placeholder="用户名" size="large" @pressEnter="login">
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="password">
            <a-input v-model="user.password" placeholder="密码" type="password" size="large" @pressEnter="login">
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="captcha">
            <a-input v-model="user.captcha" placeholder="验证码" size="large" @pressEnter="login">
              <a-icon slot="prefix" type="safety-certificate" />
              <a-tooltip slot="suffix" title="看不清?点击更换图片">
                <img height="34px" :src="captchaUrl" alt="看不清？点击更换图片" @click="captchaUrl = $store.state.host + '/captcha?k=' + Math.random()">
              </a-tooltip>
            </a-input>
          </a-form-model-item>
        </a-form-model>
        <a-button type="primary" style="width: 100%" @click="login">登录</a-button>
        <div class="login-reg-switch" @click="$router.push({name: 'register'})">还没账号? 点此注册</div>
      </div>
    </a-card>
    <div>
      <el-image
          class="login-page-image"
          src="login.jpg"
          fit="contain"></el-image>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      captchaUrl: this.$store.state.host + '/captcha?k=' + Math.random(),
      user: {
        username: '',
        password: '',
        captcha: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },],
        captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' },],
      }
    }
  },
  methods: {
    login() {
      let that = this
      that.$refs["loginForm"].validate(valid => {
        if (valid) {
          that.$store.commit('login', this.user)
        }
      })
    }
  },
  created() {
    this.$store.commit('updateCurrentPage', {
      page: 'login'
    })
  }
}
</script>

<style scoped>
.login-box{
  width: 400px;
  position: fixed;
  z-index: 1;
  left: 50%;
  top: 50%;
  transform: translate(-130%, -50%);
  background-color: rgba(255,255,255,.8);
}
.login-title{
  width: 100%;
  text-align: center;
  margin: 30px 0;
}
.login-form-box{
  margin: 30px;
}
.login-reg-switch{
  font-size: 12px;
  color: gray;
  text-align: center;
  margin-top: 10px;
  width: 100%;
  cursor: pointer;
  font-style: oblique;
}
.login-reg-switch:hover{
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

<template>
  <a-card class="login-box" :hoverable="true">
    <div class="login-title">
      <h1><b>人工智能可视化建模平台</b></h1>
      <h2>用户登录</h2>
    </div>
    <div class="login-form-box">
      <a-form-model :rules="rules" :model="user" ref="loginForm">
        <a-form-model-item prop="username">
          <a-input v-model="user.username" placeholder="用户名" size="large">
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password">
          <a-input v-model="user.password" placeholder="密码" type="password" size="large" @pressEnter="login">
            <a-icon slot="prefix" type="lock" />
          </a-input>
        </a-form-model-item>
      </a-form-model>
      <a-button type="primary" style="width: 100%" @click="login">登录</a-button>
      <div class="login-reg-switch" @click="$router.push({name: 'register'})">还没账号? 点此注册</div>
    </div>
  </a-card>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      user: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },],
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
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
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
</style>

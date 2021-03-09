<template>
  <div>
    <a-card class="register-box" :hoverable="true">
      <div class="register-title">
        <h1><b>人工智能可视化建模平台</b></h1>
        <h2>用户注册</h2>
      </div>
      <div class="register-form-box">
        <a-form-model :rules="rules" :model="user" ref="registerForm">
          <a-form-model-item prop="username">
            <a-input v-model="user.username" placeholder="用户名" size="large">
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="password">
            <a-input v-model="user.password" placeholder="密码" type="password" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-model-item>
          <a-form-model-item prop="password2">
            <a-input v-model="user.password2" placeholder="再次确认密码" type="password" size="large" @pressEnter="register">
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-model-item>
        </a-form-model>
        <a-button type="primary" style="width: 100%" @click="register">注册</a-button>
        <div class="register-reg-switch" @click="$router.push({name: 'login'})">已有账号? 点此登录</div>
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
  name: "Register",
  data() {
    return {
      user: {
        username: '',
        password: '',
        password2: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },],
        password2: [{ required: true, message: '请再次输入密码', trigger: 'blur' }, { validator: this.password2check, trigger: 'change' }],
      }
    }
  },
  methods: {
    password2check(rule, value, callback) {
      if (value !== this.user.password) {
        callback(new Error('两次密码不一致'))
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
      that.$http.post(this.$store.state.host + '/user', sendData)
          .then(() => {
            that.$message.success('注册成功')
            that.$store.commit('login', that.user)
          })
          .catch((error) => {
            if (error.response) {
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

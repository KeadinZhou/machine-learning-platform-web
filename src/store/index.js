import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router'

Vue.use(Vuex)

const host = 'http://47.111.25.1:5555'

export default new Vuex.Store({
  state: {
    host,
    current_page: {},
    user: null
  },
  mutations: {
    updateCurrentPage(state, data) {
      state.current_page = data
    },
    updateUserInfo(state, data) {
      state.user = data
    },
    updateUser(state, showMsg) {
      let that = this._vm
      that.$http.get(state.host + '/session')
        .then(data => {
          let Data = data.data
          state.user = Data
          if (showMsg) {
            that.$message.success('欢迎你, ' + Data.username)
            router.replace({name: 'project'})
          }
        })
        .catch((error) => {
          router.replace({name: 'login'})
          if (showMsg) {
            if (error.response) {
              if (error.response.status === 401) {
                that.$message.error('请先登录')
              } else {
                that.$message.error(error.response.data.message)
              }
            } else {
              that.$message.error('请求失败')
            }
          }
        })
        .finally(() => {
        })
    },
    login(state, user) {
      let that = this._vm
      let sendData = new FormData()
      sendData.append('username', user.username)
      sendData.append('password', user.password)
      that.$http.post(state.host + '/session', sendData)
        .then(() => {
          this.commit('updateUser', true)
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
    },
    logout(state) {
      let that = this._vm
      that.$http.delete(state.host + '/session')
        .then(() => {
          that.$message.success('登出成功')
          state.user = null
          router.replace({name:'login'})
        })
        .catch((error) => {
          if (error.response) {
            that.$message.error(error.response.data.message)
          } else {
            that.$message.error('登出失败')
          }
        })
        .finally(() => {
        })
    },
  },
  actions: {
  },
  modules: {
  }
})

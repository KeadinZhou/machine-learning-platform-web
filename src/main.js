import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Antd from 'ant-design-vue'
import router from './router'
import store from './store'
import axios from 'axios'
import 'ant-design-vue/dist/antd.css'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(ElementUI,{size:'mini'})
Vue.use(Antd)

axios.defaults.withCredentials = true
Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    store.commit('updateUser')
  }
}).$mount('#app')

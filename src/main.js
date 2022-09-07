import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Antd from 'ant-design-vue'
import router from './router'
import store from './store'
import axios from 'axios'
import 'ant-design-vue/dist/antd.css'
import '@/components/ef/index.css'
import moment from 'moment'
import VueClipboard  from 'vue-clipboard2'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(ElementUI,{size:'mini'})
Vue.use(Antd)
Vue.use(VueClipboard)

axios.defaults.withCredentials = true
Vue.prototype.$http = axios

// Vue.prototype.$http = axios.create({
//   timeout: 15000,
//   headers: {
//     'Content-Type': "application/json; charset=utf-8"
//   }
// })

Vue.prototype.$moment = moment

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    store.commit('updateUser')
    store.commit('updateConfiguration')
    store.commit('loadIn18Config')
  }
}).$mount('#app')

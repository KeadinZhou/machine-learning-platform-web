<template>
  <div class="page-nav" v-if="current_page.page !== 'login' && current_page.page !== 'register'">
    <div class="page-nav-title-icon">
      <div class="page-nav-icon" title="点击返回项目首页" @click="$router.push({name: 'project'})">
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
          <a-menu-item key="1">修改密码</a-menu-item>
          <a-menu-item key="2" v-if="user.permission === 1" @click="$router.push({name:'admin'})">用户管理</a-menu-item>
          <a-menu-item key="4" v-if="user.permission === 1" @click="$router.push({name:'invitation'})">邀请用户</a-menu-item>
          <a-menu-item key="3" @click="logout">退出登录</a-menu-item>
        </a-menu>
      </a-dropdown>
    </a-space>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: "page-nav",
  computed: {
    ...mapState(['user', 'current_page'])
  },
  methods: {
    ...mapMutations(['logout'])
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

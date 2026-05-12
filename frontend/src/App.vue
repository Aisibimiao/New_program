<template>
  <div class="app">
    <div class="navbar" v-if="showNavbar">
      <div class="logo">
        <span class="logo-icon"></span>
        重庆电子科技职业大学校园交易平台
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/publish" v-if="userStore.isLoggedIn" class="nav-link">发布物品</router-link>
        <router-link to="/orders" v-if="userStore.isLoggedIn" class="nav-link">我的订单</router-link>
        <router-link to="/profile" v-if="userStore.isLoggedIn" class="nav-link">个人中心</router-link>
        <router-link to="/admin" v-if="userStore.isLoggedIn && userStore.userInfo.role === 'ADMIN'" class="nav-link">管理后台</router-link>
        <template v-if="userStore.isLoggedIn">
          <button class="nav-btn-outline" @click="handleLogout">退出</button>
        </template>
        <router-link to="/login" v-else class="nav-link">登录/注册</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './stores/userStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const showNavbar = computed(() => {
  const hidePaths = ['/login', '/register', '/forget'];
  return !hidePaths.includes(route.path);
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  /* ========== 背景图设置（新增） ========== */
  /* 方式一：使用网络图片 */
  background-image: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920');
  
  /* 方式二：使用本地图片（将图片放入 public 目录，例如 public/bg.jpg） */
  /* background-image: url('/bg.jpg'); */
  
  /* 方式三：使用渐变色（如果图片加载慢，可作为 fallback） */
  /* background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  min-height: 100vh;
}

/* 半透明白色遮罩层，让内容更易阅读 */
.app {
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(2px);
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 1.35rem;
  font-weight: 600;
  background: linear-gradient(135deg, #1e2a3a 0%, #2c3e50 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 1.6rem;
  background: none;
  color: #3b82f6;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  padding: 6px 0;
  position: relative;
}

.nav-link:hover {
  color: #3b82f6;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.25s ease;
  border-radius: 2px;
}

.nav-link:hover::after {
  width: 100%;
}

.router-link-active {
  color: #3b82f6;
}

.router-link-active::after {
  width: 100%;
}

.nav-btn-outline {
  background: transparent;
  border: 1.5px solid #e2e8f0;
  padding: 6px 18px;
  border-radius: 40px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
  transform: translateY(-1px);
}
</style>
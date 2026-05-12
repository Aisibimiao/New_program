<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>重庆电子科技职业大学校园 交易平台</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="account">
          <el-input v-model="form.account" placeholder="手机号 / 邮箱" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">登录</el-button>
        </el-form-item>
        <div class="footer">
          <router-link to="/register">注册账号</router-link>
          <router-link to="/forget">忘记密码？</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '../api/auth';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const form = reactive({ account: '', password: '' });
const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};
const formRef = ref(null);
const loading = ref(false);

const handleLogin = async () => {
  await formRef.value.validate();
  loading.value = true;
  try {
    const res = await login({ account: form.account, password: form.password });
    userStore.setToken(res.token);
    userStore.setUserInfo(res.user);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (err) {
    ElMessage.error(err.msg || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 20px;
  border-radius: 12px;
}
h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}
.footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
</style>
<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>注册账号</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="11位手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="接收验证码" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div style="display: flex; gap: 10px;">
            <el-input v-model="form.code" placeholder="验证码" />
            <el-button :disabled="codeSending" @click="sendCode">{{ codeText }}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="选填" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="选填" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">注册</el-button>
        </el-form-item>
        <div class="footer">
          <router-link to="/login">已有账号？去登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { sendRegisterCode, register } from '../api/auth';

const router = useRouter();
const form = reactive({
  phone: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  name: '',
  studentId: ''
});
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次输入密码不一致'));
        else callback();
      }, trigger: 'blur'
    }
  ]
};
const formRef = ref(null);
const loading = ref(false);
const codeSending = ref(false);
const countdown = ref(0);
const codeText = computed(() => countdown.value > 0 ? `${countdown.value}秒后重试` : '获取验证码');

const sendCode = async () => {
  if (countdown.value > 0) return;
  if (!form.email) {
    ElMessage.warning('请先填写邮箱');
    return;
  }
  codeSending.value = true;
  try {
    await sendRegisterCode({ email: form.email, phone: form.phone });
    ElMessage.success('验证码已发送');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (err) {
    ElMessage.error(err.msg || '发送失败');
  } finally {
    codeSending.value = false;
  }
};

const handleRegister = async () => {
  await formRef.value.validate();
  loading.value = true;
  try {
    await register({
      email: form.email,
      phone: form.phone,
      password: form.password,
      code: form.code,
      name: form.name,
      studentId: form.studentId
    });
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (err) {
    ElMessage.error(err.msg || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
.register-card {
  width: 500px;
  border-radius: 12px;
}
h2 {
  text-align: center;
  margin-bottom: 24px;
}
.footer {
  text-align: center;
  margin-top: 16px;
}
</style>
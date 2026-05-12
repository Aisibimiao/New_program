<template>
  <div class="forget-container">
    <el-card class="forget-card">
      <h2>重置密码</h2>
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="验证身份" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>

      <div class="step-content" v-if="activeStep === 0">
        <el-form :model="step1Form" :rules="step1Rules" ref="step1FormRef" label-width="80px">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="step1Form.email" placeholder="注册时使用的邮箱" />
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <div style="display: flex; gap: 10px;">
              <el-input v-model="step1Form.code" placeholder="验证码" />
              <el-button :disabled="codeSending" @click="sendCode">{{ codeText }}</el-button>
            </div>
          </el-form-item>
        </el-form>
        <div class="steps-action">
          <el-button type="primary" @click="verifyCode">下一步</el-button>
        </div>
      </div>

      <div class="step-content" v-if="activeStep === 1">
        <el-form :model="step2Form" :rules="step2Rules" ref="step2FormRef" label-width="80px">
          <el-form-item label="新密码" prop="password">
            <el-input v-model="step2Form.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="step2Form.confirmPassword" type="password" show-password />
          </el-form-item>
        </el-form>
        <div class="steps-action">
          <el-button @click="activeStep = 0">上一步</el-button>
          <el-button type="primary" @click="resetPassword">确认重置</el-button>
        </div>
      </div>

      <div class="step-content" v-if="activeStep === 2">
        <el-result icon="success" title="重置成功" sub-title="请使用新密码登录">
          <template #extra>
            <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { sendResetCode, resetPassword as apiResetPassword } from '../api/auth';

const activeStep = ref(0);
const step1Form = reactive({ email: '', code: '' });
const step2Form = reactive({ password: '', confirmPassword: '' });
const step1FormRef = ref(null);
const step2FormRef = ref(null);
const codeSending = ref(false);
const countdown = ref(0);
const emailForReset = ref('');

const codeText = computed(() => countdown.value > 0 ? `${countdown.value}秒后重试` : '获取验证码');

const step1Rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

const step2Rules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== step2Form.password) callback(new Error('两次输入密码不一致'));
        else callback();
      }, trigger: 'blur'
    }
  ]
};

const sendCode = async () => {
  if (countdown.value > 0) return;
  await step1FormRef.value.validateField('email');
  codeSending.value = true;
  try {
    await sendResetCode({ email: step1Form.email });
    ElMessage.success('验证码已发送（请在邮箱或后端控制台查看）');
    emailForReset.value = step1Form.email;
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

const verifyCode = async () => {
  await step1FormRef.value.validate();
  activeStep.value = 1;
};

const resetPassword = async () => {
  await step2FormRef.value.validate();
  try {
    await apiResetPassword({
      email: emailForReset.value,
      code: step1Form.code,
      newPassword: step2Form.password
    });
    activeStep.value = 2;
  } catch (err) {
    ElMessage.error(err.msg || '重置失败');
  }
};
</script>

<style scoped>
.forget-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.forget-card {
  width: 500px;
  border-radius: 16px;
  padding: 20px;
}
h2 {
  text-align: center;
  margin-bottom: 24px;
}
.step-content {
  margin-top: 30px;
}
.steps-action {
  margin-top: 30px;
  text-align: center;
}
</style>
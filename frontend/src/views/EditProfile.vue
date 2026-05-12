<template>
  <div class="edit-profile-page">
    <div class="edit-container">
      <div class="edit-header">
        <h1 class="edit-title">编辑个人信息</h1>
        <p class="edit-subtitle">完善资料，让更多人认识你</p>
      </div>

      <div class="edit-form-wrapper">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
          
          <!-- 头像上传 -->
          <el-form-item label="头像">
            <div class="avatar-section">
              <div class="avatar-preview" @click="triggerUpload">
                <el-image 
                  v-if="form.avatar && getFullImageUrl(form.avatar)" 
                  :src="getFullImageUrl(form.avatar)" 
                  fit="cover" 
                  class="avatar-img"
                  :preview-src-list="[getFullImageUrl(form.avatar)]"
                >
                  <template #error>
                    <div class="image-slot">
                      <span class="placeholder-icon">📷</span>
                      <span>加载失败</span>
                      <span style="font-size: 10px;">点击重试</span>
                    </div>
                  </template>
                </el-image>
                <div v-else class="avatar-placeholder">
                  <span class="placeholder-icon">📷</span>
                  <span>点击上传头像</span>
                </div>
                <div class="avatar-edit-hint">点击修改</div>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                style="display: none" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                @change="handleAvatarChange"
              />
              <div class="avatar-tip">建议使用正方形图片，大小不超过2MB</div>
            </div>
          </el-form-item>

          <!-- 昵称 -->
          <el-form-item label="昵称" prop="nickname">
            <el-input 
              v-model="form.nickname" 
              placeholder="给自己起个好听的名字"
              class="modern-input"
            />
          </el-form-item>

          <!-- 真实姓名 -->
          <el-form-item label="姓氏" prop="name">
            <el-input 
              v-model="form.name" 
              placeholder="选填，用于学号认证"
              class="modern-input"
            />
          </el-form-item>

          <!-- 学号认证 -->
          <el-form-item label="学号认证" prop="studentId">
            <el-input 
              v-model="form.studentId" 
              placeholder="输入学号进行认证"
              class="modern-input"
            />
            <div class="form-tip">认证后可获得更多信任，提高交易成功率</div>
          </el-form-item>

          <!-- 手机号（只读） -->
          <el-form-item label="手机号">
            <el-input :value="form.phone" disabled class="readonly-input" />
          </el-form-item>

          <!-- 邮箱（只读） -->
          <el-form-item label="邮箱">
            <el-input :value="form.email" disabled class="readonly-input" />
          </el-form-item>

          <!-- 按钮 -->
          <div class="form-actions">
            <el-button class="btn-cancel" @click="$router.back()">取消</el-button>
            <el-button type="primary" class="btn-submit" @click="submitUpdate" :loading="submitting">
              保存修改
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getProfile, updateProfile, uploadAvatar } from '../api/auth';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const submitting = ref(false);
const fileInput = ref(null);

const form = reactive({
  nickname: '',
  name: '',
  studentId: '',
  phone: '',
  email: '',
  avatar: ''
});

const rules = {
  nickname: [
    { min: 2, max: 20, message: '昵称长度2-20个字符', trigger: 'blur' }
  ]
};

// 获取图片完整URL
const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}?t=${Date.now()}`;
};

// 触发文件选择
const triggerUpload = () => {
  fileInput.value.click();
};

// 处理头像上传
const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG、GIF、WEBP 格式的图片');
    return;
  }
  
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB');
    return;
  }
  
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const res = await uploadAvatar(formData);
    form.avatar = res.avatar;
    userStore.setUserInfo({ ...userStore.userInfo, avatar: res.avatar });
    ElMessage.success('头像上传成功');
    await nextTick();
  } catch (err) {
    console.error('上传失败:', err);
    ElMessage.error(err.msg || '上传失败，请重试');
  }
};

// 获取用户信息
const fetchProfile = async () => {
  try {
    const res = await getProfile();
    form.nickname = res.nickname || '';
    form.name = res.name || '';
    form.studentId = res.studentId || '';
    form.phone = res.phone;
    form.email = res.email;
    form.avatar = res.avatar;
  } catch (err) {
    ElMessage.error('加载信息失败');
  }
};

// 提交更新
const submitUpdate = async () => {
  await formRef.value.validate();
  submitting.value = true;
  try {
    const res = await updateProfile({
      nickname: form.nickname,
      name: form.name,
      studentId: form.studentId
    });
    userStore.setUserInfo(res.user);
    ElMessage.success('保存成功');
    router.back();
  } catch (err) {
    ElMessage.error(err.msg || '保存失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
  padding: 40px 20px;
}

.edit-container {
  max-width: 700px;
  margin: 0 auto;
}

.edit-header {
  text-align: center;
  margin-bottom: 32px;
}

.edit-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e2a3a 0%, #2c3e50 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}

.edit-subtitle {
  color: #6c757d;
  font-size: 0.9rem;
}

.edit-form-wrapper {
  background: white;
  border-radius: 28px;
  padding: 40px 48px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
}

.modern-input :deep(.el-input__wrapper) {
  border-radius: 14px;
  padding: 10px 16px;
  box-shadow: 0 0 0 1px #e2e8f0;
  transition: all 0.2s;
}

.modern-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #3b82f6;
}

.readonly-input :deep(.el-input__wrapper) {
  background: #f8fafc;
  border-radius: 14px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px dashed #cbd5e1;
}

.avatar-preview:hover {
  border-color: #3b82f6;
  transform: scale(1.02);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}

.placeholder-icon {
  font-size: 32px;
}

.avatar-edit-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-preview:hover .avatar-edit-hint {
  opacity: 1;
}

.avatar-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
}

.form-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #eef2f6;
}

.btn-cancel {
  padding: 10px 28px;
  border-radius: 40px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #6c757d;
}

.btn-cancel:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-submit {
  padding: 10px 36px;
  border-radius: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}
</style>
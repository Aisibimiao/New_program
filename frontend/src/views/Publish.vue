<template>
  <div class="publish-page">
    <div class="publish-container">
      <!-- 头部 -->
      <div class="publish-header">
        <h1 class="publish-title">发布物品</h1>
        <p class="publish-subtitle">填写物品信息，让更多校友看到</p>
      </div>

      <!-- 表单区域 -->
      <div class="publish-form-wrapper">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="publish-form">
          
          <!-- 标题 -->
          <el-form-item label="标题" prop="title">
            <el-input 
              v-model="form.title" 
              placeholder="简洁清晰的标题，例如：九成新《高等数学》上册"
              class="modern-input"
            />
          </el-form-item>

          <!-- 第一行：分类 + 价格 -->
          <div class="form-row">
            <el-form-item label="分类" prop="category" class="form-col">
              <el-select v-model="form.category" class="modern-select" popper-class="modern-popper">
                <el-option label="生活用品" value="LIFE" />
                <el-option label="电子产品" value="ELECTRONICS" />
                <el-option label="教材/书籍" value="BOOK" />
                <el-option label="服饰穿戴" value="CLOTHING" />
                <el-option label="运动户外" value="SPORTS" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>

            <el-form-item label="价格" prop="price" class="form-col">
              <el-input-number 
                v-model="form.price" 
                :min="0" 
                :precision="2" 
                :controls="true"
                class="modern-number"
              />
              <span class="price-unit">元</span>
            </el-form-item>
          </div>

          <!-- 交易地点 -->
          <el-form-item label="交易地点" prop="location">
            <el-input 
              v-model="form.location" 
              placeholder="如：北区足球场 / 图书馆门口"
              class="modern-input"
            />
          </el-form-item>

          <!-- 描述 -->
          <el-form-item label="描述" prop="description">
            <el-input 
              type="textarea" 
              v-model="form.description" 
              rows="4"
              placeholder="描述物品的成色、使用情况、购买年份等信息..."
              class="modern-textarea"
            />
          </el-form-item>

          <!-- 联系方式 -->
          <el-form-item label="联系方式" prop="contact" required>
            <el-input 
              v-model="form.contact" 
              placeholder="手机号 / QQ / 微信"
              class="modern-input"
            />
            <div class="form-tip">展示在物品详情页，方便买家联系您</div>
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="物品图片" prop="images">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleRemove"
              multiple
              :limit="6"
              class="modern-upload"
            >
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">上传图片</div>
            </el-upload>
            <div class="form-tip">最多上传6张，支持 jpg/png 格式，单张不超过5MB</div>
          </el-form-item>

          <!-- 按钮区域 -->
          <div class="form-actions">
            <el-button class="btn-cancel" @click="router.back()">取消</el-button>
            <el-button type="primary" class="btn-submit" @click="submitPublish" :loading="submitting">
              发布物品
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { createGoods } from '../api/goods';

const router = useRouter();
const form = reactive({
  title: '',
  category: 'BOOK',
  price: 0,
  location: '',
  description: '',
  contact: ''
});
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  contact: [{ required: true, message: '请填写联系方式', trigger: 'blur' }]
};
const formRef = ref(null);
const fileList = ref([]);
const submitting = ref(false);

const handleFileChange = (file, fileListNew) => {
  fileList.value = fileListNew;
};
const handleRemove = (file, fileListNew) => {
  fileList.value = fileListNew;
};

const submitPublish = async () => {
  await formRef.value.validate();
  if (fileList.value.length === 0) {
    ElMessage.warning('请至少上传一张图片');
    return;
  }
  submitting.value = true;
  const formData = new FormData();
  formData.append('title', form.title);
  formData.append('category', form.category);
  formData.append('price', form.price);
  formData.append('location', form.location);
  formData.append('description', form.description);
  formData.append('contact', form.contact);
  fileList.value.forEach(file => {
    formData.append('images', file.raw);
  });
  try {
    await createGoods(formData);
    ElMessage.success('发布成功');
    router.push('/');
  } catch (err) {
    ElMessage.error(err.msg || '发布失败');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
  padding: 40px 20px;
}

.publish-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 头部 */
.publish-header {
  text-align: center;
  margin-bottom: 40px;
}

.publish-title {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e2a3a 0%, #2c3e50 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.publish-subtitle {
  color: #6c757d;
  font-size: 0.95rem;
}

/* 表单卡片 */
.publish-form-wrapper {
  background: white;
  border-radius: 32px;
  padding: 40px 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.publish-form-wrapper:hover {
  transform: translateY(-2px);
}

.publish-form {
  margin: 0;
}

/* 表单项样式 */
:deep(.el-form-item) {
  margin-bottom: 28px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
  padding-bottom: 6px;
}

.modern-input :deep(.el-input__wrapper) {
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 0 0 1px #e2e8f0;
  transition: all 0.2s ease;
}

.modern-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #3b82f6;
}

.modern-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 0 0 1px #3b82f6;
}

.modern-textarea :deep(.el-textarea__inner) {
  border-radius: 16px;
  padding: 14px 16px;
  font-family: inherit;
  border-color: #e2e8f0;
  transition: all 0.2s ease;
}

.modern-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 两列布局 */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 0;
}

.form-col {
  flex: 1;
  margin-bottom: 0;
}

.modern-select {
  width: 100%;
}

.modern-select :deep(.el-input__wrapper) {
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.modern-number :deep(.el-input__wrapper) {
  border-radius: 16px;
  padding: 6px 8px;
  box-shadow: 0 0 0 1px #e2e8f0;
  width: 160px;
}

.price-unit {
  margin-left: 12px;
  color: #6c757d;
  font-size: 0.9rem;
}

/* 提示文字 */
.form-tip {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 6px;
  line-height: 1.4;
}

/* 上传组件 */
.modern-upload :deep(.el-upload--picture-card) {
  border-radius: 20px;
  border: 1.5px dashed #cbd5e1;
  background: #fafbfc;
  transition: all 0.2s ease;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.modern-upload :deep(.el-upload--picture-card:hover) {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 24px;
  color: #94a3b8;
}

.upload-text {
  font-size: 12px;
  color: #94a3b8;
}

:deep(.el-upload-list__item) {
  border-radius: 16px;
}

/* 按钮区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #eef2f6;
}

.btn-cancel {
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: 500;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #6c757d;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
  transform: translateY(-1px);
}

.btn-submit {
  padding: 12px 36px;
  border-radius: 40px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}
</style>
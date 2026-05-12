<template>
  <div class="edit-goods-container">
    <el-card class="edit-card">
      <h2>编辑物品</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="物品标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category">
            <el-option label="生活用品" value="LIFE" />
            <el-option label="电子产品" value="ELECTRONICS" />
            <el-option label="书籍" value="BOOK" />
            <el-option label="服饰穿戴" value="CLOTHING" />
            <el-option label="运动户外" value="SPORTS" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="交易地点" prop="location">
          <el-input v-model="form.location" placeholder="如：东区食堂" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="form.contact" placeholder="手机号/QQ/微信" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" rows="4" placeholder="描述物品详情..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUpdate" :loading="submitting">保存修改</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '../api/request';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const submitting = ref(false);

const form = ref({
  title: '',
  category: 'LIFE',
  price: 0,
  location: '',
  contact: '',
  description: ''
});

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
};

const fetchGoods = async () => {
  const id = route.params.id;
  try {
    const res = await request.get(`/goods/${id}`);
    form.value = {
      title: res.title,
      category: res.category,
      price: res.price,
      location: res.location || '',
      contact: res.contact || '',
      description: res.description || ''
    };
  } catch (err) {
    ElMessage.error('加载失败');
    router.back();
  }
};

const submitUpdate = async () => {
  await formRef.value.validate();
  submitting.value = true;
  try {
    const id = route.params.id;
    await request.put(`/goods/${id}`, form.value);
    ElMessage.success('修改成功');
    setTimeout(() => {
      router.push(`/goods/${id}`);
    }, 1500);
  } catch (err) {
    ElMessage.error(err.msg || '修改失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchGoods();
});
</script>

<style scoped>
.edit-goods-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.edit-card {
  border-radius: 20px;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
}
</style>
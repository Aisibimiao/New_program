<template>
  <div class="profile-container">
    <el-card class="info-card">
      <div class="profile-header">
        <div class="avatar-large" @click="$router.push('/edit-profile')">
          <el-image 
            v-if="userStore.userInfo.avatar" 
            :src="getFullImageUrl(userStore.userInfo.avatar)" 
            fit="cover" 
            class="avatar-img-large"
          />
          <div v-else class="avatar-placeholder-large">
            <span class="placeholder-icon-large">👤</span>
          </div>
          <div class="avatar-edit-hint">点击修改头像</div>
        </div>
        <div class="profile-info">
          <h2>{{ userStore.userInfo.nickname || userStore.userInfo.phone || '未设置昵称' }}</h2>
          <p class="user-role">{{ userStore.userInfo.role === 'ADMIN' ? '管理员' : '普通用户' }}</p>
        </div>
      </div>
      <el-divider />
      <div class="info-list">
        <div class="info-item">
          <span class="info-label">手机号：</span>
          <span>{{ userStore.userInfo.phone }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱：</span>
          <span>{{ userStore.userInfo.email || '未绑定' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">真实姓名：</span>
          <span>{{ userStore.userInfo.name || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">学号：</span>
          <span>{{ userStore.userInfo.studentId || '未认证' }}</span>
          <el-tag v-if="userStore.userInfo.studentId" type="success" size="small" class="cert-badge">已认证</el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">昵称：</span>
          <span>{{ userStore.userInfo.nickname || '未设置' }}</span>
        </div>
      </div>
      <div class="profile-actions">
        <el-button type="primary" plain @click="$router.push('/edit-profile')">编辑资料</el-button>
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </div>
    </el-card>

    <el-card class="goods-card">
      <h2>我的发布</h2>
      <el-table :data="myGoods" stripe v-loading="loading">
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            {{ categoryMap[row.category] }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '上架中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/goods/${row.id}`)">查看</el-button>
            <!-- 删除按钮放在标记已售前面 -->
            <el-button 
              size="small" 
              type="danger" 
              plain 
              @click="deleteGoods(row.id)"
            >
              删除
            </el-button>
            <el-button 
              v-if="row.status === 'ACTIVE'" 
              size="small" 
              type="success" 
              @click="markAsSold(row.id)"
            >
              标记已售
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && myGoods.length === 0" class="empty-goods">
        <el-empty description="暂无发布，去发布一个吧～" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '../stores/userStore';
import { getMyGoods } from '../api/goods';
import request from '../api/request';

const router = useRouter();
const userStore = useUserStore();
const myGoods = ref([]);
const loading = ref(false);

const categoryMap = {
  LIFE: '生活用品',
  ELECTRONICS: '电子产品',
  BOOK: '书籍',
  CLOTHING: '服饰穿戴',
  SPORTS: '运动户外',
  OTHER: '其他'
};

const getFullImageUrl = (path) => {
  if (!path) return '';
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  return baseUrl + path;
};

const fetchMyGoods = async () => {
  loading.value = true;
  try {
    const res = await getMyGoods();
    myGoods.value = res;
  } catch (err) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
};

// 标记已售
const markAsSold = async (id) => {
  try {
    await ElMessageBox.confirm('确认该物品已售出吗？标记后物品将下架', '提示', { type: 'warning' });
    await request.put(`/goods/${id}/sold`);
    ElMessage.success('已标记为售出');
    fetchMyGoods();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('操作失败');
  }
};

// 物理删除物品
const deleteGoods = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此物品吗？删除后不可恢复', '警告', { type: 'error' });
    await request.delete(`/goods/${id}`);
    ElMessage.success('删除成功');
    fetchMyGoods();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败');
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchMyGoods();
});
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
}

.info-card, .goods-card {
  border-radius: 20px;
  padding: 24px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-large {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: #f1f5f9;
}

.avatar-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #94a3b8;
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

.avatar-large:hover .avatar-edit-hint {
  opacity: 1;
}

.profile-info h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.user-role {
  color: #6c757d;
  font-size: 0.85rem;
}

.info-list {
  margin: 16px 0;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #4a5568;
  width: 80px;
}

.cert-badge {
  margin-left: 8px;
}

.profile-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

h2 {
  margin-bottom: 16px;
  font-size: 1.25rem;
}

.empty-goods {
  padding: 20px 0;
}
</style>
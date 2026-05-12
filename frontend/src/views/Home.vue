<template>
  <div class="home">
    <!-- 顶部 Hero 区域 -->
    <div class="hero-section">
      <h1 class="hero-title">发现校园好物</h1>
      <p class="hero-subtitle">闲置流转 · 绿色生活 · 校友交易</p>
      <div class="search-wrapper">
        <div class="search-bar">
          <el-input v-model="keyword" placeholder="搜索物品名称..." clearable @keyup.enter="search" class="search-input">
            <template #prefix>
              <span class="search-icon">🔍</span>
            </template>
          </el-input>
          <el-select v-model="category" placeholder="分类" clearable @change="search" class="category-select">
            <el-option label="全部" value="ALL" />
            <el-option label="生活用品" value="LIFE" />
            <el-option label="电子产品" value="ELECTRONICS" />
            <el-option label="书籍" value="BOOK" />
            <el-option label="服饰穿戴" value="CLOTHING" />
            <el-option label="运动户外" value="SPORTS" />
            <el-option label="其他" value="OTHER" />
          </el-select>
          <el-button type="primary" @click="search" class="search-btn">搜索</el-button>
        </div>
      </div>
    </div>

    <!-- 物品网格 -->
    <div class="goods-grid" v-loading="loading">
      <div v-for="item in goodsList" :key="item.id" class="goods-card" @click="goDetail(item.id)">
        <div class="card-image-wrapper">
          <el-image :src="item.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'" fit="cover" class="goods-image" />
          <div class="card-overlay">
            <span class="view-detail">查看详情 →</span>
          </div>
        </div>
        <div class="goods-info">
          <h3 class="goods-title">{{ item.title }}</h3>
          <p class="price">¥{{ item.price }}</p>
          <div class="seller">
            <!-- 卖家头像 -->
            <el-image 
              v-if="item.seller?.avatar" 
              :src="getFullImageUrl(item.seller.avatar)" 
              fit="cover" 
              class="seller-avatar"
            />
            <span v-else class="seller-avatar-default">👤</span>
            <!-- 卖家名称（优先昵称 -> 真实姓名 -> 手机号 -> 匿名） -->
            <span class="seller-name">{{ getSellerName(item.seller) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && goodsList.length === 0" class="empty-state">
      <span class="empty-icon">📦</span>
      <p>暂无物品，快来发布第一个吧～</p>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="limit"
        v-model:current-page="page"
        @current-change="fetchGoods"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getGoods } from '../api/goods';

const router = useRouter();
const goodsList = ref([]);
const loading = ref(false);
const keyword = ref('');
const category = ref('ALL');
const page = ref(1);
const total = ref(0);
const limit = 20;

// 获取图片完整URL（拼接后端地址）
const getFullImageUrl = (path) => {
  if (!path) return '';
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  return baseUrl + path;
};

// 获取卖家显示名称（优先昵称 -> 真实姓名 -> 手机号 -> 匿名）
const getSellerName = (seller) => {
  if (!seller) return '匿名';
  if (seller.nickname) return seller.nickname;
  if (seller.name) return seller.name;
  if (seller.phone) return seller.phone.slice(0, 3) + '****' + seller.phone.slice(-4);
  return '匿名';
};

const fetchGoods = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      limit,
      keyword: keyword.value || undefined,
      category: category.value === 'ALL' ? undefined : category.value
    };
    const res = await getGoods(params);
    goodsList.value = res.data || [];
    total.value = res.pagination?.total || 0;
  } catch (err) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
};

const search = () => {
  page.value = 1;
  fetchGoods();
};

const goDetail = (id) => {
  router.push(`/goods/${id}`);
};

onMounted(() => {
  fetchGoods();
});
</script>

<style scoped>
.home {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* Hero 区域 */
.hero-section {
  text-align: center;
  margin-bottom: 48px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e2a3a 0%, #2c3e50 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 32px;
}

.search-wrapper {
  display: flex;
  justify-content: center;
}

.search-bar {
  display: flex;
  gap: 12px;
  background: white;
  padding: 8px 16px 8px 20px;
  border-radius: 60px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.search-input {
  width: 320px;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
  padding: 0 12px;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none;
}

.search-icon {
  font-size: 1.1rem;
}

.category-select {
  width: 140px;
}

.category-select :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
}

.search-btn {
  border-radius: 40px;
  padding: 10px 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

/* 物品网格 */
.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

.goods-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.goods-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.1);
}

.card-image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.goods-image {
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.goods-card:hover .goods-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.goods-card:hover .card-overlay {
  opacity: 1;
}

.view-detail {
  color: white;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 0.85rem;
}

.goods-info {
  padding: 16px 18px 20px;
}

.goods-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f2937;
}

.price {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ef4444;
  margin: 8px 0;
}

/* 卖家信息样式 */
.seller {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.75rem;
  color: #9ca3af;
}

.seller-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.seller-avatar-default {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.seller-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #9ca3af;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.6;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}
</style>
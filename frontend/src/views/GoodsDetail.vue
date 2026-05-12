<template>
  <div class="detail-container" v-loading="loading">
    <div v-if="goods" class="detail-card">
      <!-- 图片轮播（自动滚动） -->
      <el-carousel height="400px" indicator-position="outside" :interval="5000" trigger="click">
        <el-carousel-item v-for="(img, idx) in goods.images" :key="idx">
          <el-image :src="getImageUrl(img)" fit="contain" class="detail-image" />
        </el-carousel-item>
        <el-carousel-item v-if="!goods.images || goods.images.length === 0">
          <el-image src="https://via.placeholder.com/400x400?text=No+Image" fit="contain" class="detail-image" />
        </el-carousel-item>
      </el-carousel>

      <div class="info">
        <h1>{{ goods.title }}</h1>
        <p class="price">¥{{ goods.price }}</p>
        <p class="meta">
          分类：{{ categoryMap[goods.category] }}<br />
          地点：{{ goods.location || '未指定' }}<br />
          浏览次数：{{ goods.viewCount }}<br />
          发布者：{{ getSellerName(goods.seller) }}
          <span v-if="goods.seller?.studentId" class="student-badge">🎓 已认证</span>
        </p>
        <p class="description">{{ goods.description || '暂无描述' }}</p>

        <!-- 联系方式 - 仅登录用户可见 -->
        <div class="contact-section" v-if="goods.contact">
          <div v-if="userStore.isLoggedIn">
            <p class="contact-label">联系方式：</p>
            <p class="contact-value">{{ goods.contact }}</p>
            <el-button size="small" type="primary" plain @click="copyContact">复制联系方式</el-button>
          </div>
          <div v-else class="login-tip">
            <el-alert title="提示" type="info" :closable="false">
              <template #default>
                登录后查看卖家联系方式
                <el-button size="small" type="primary" @click="goLogin">去登录</el-button>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 购买按钮 - 仅登录用户可见 -->
        <div class="actions" v-if="userStore.isLoggedIn && goods.sellerId !== userStore.userInfo.id">
          <el-button type="primary" @click="openOrderDialog" :disabled="goods.status !== 'ACTIVE'">
            {{ goods.status === 'ACTIVE' ? '确定购买' : '已下架' }}
          </el-button>
        </div>
        <div v-else-if="goods.sellerId === userStore.userInfo.id" class="actions">
          <el-button type="info" @click="router.push('/profile')">我的发布</el-button>
          <el-button type="warning" plain @click="goEditGoods">编辑物品</el-button>
        </div>
        <div v-else-if="!userStore.isLoggedIn" class="actions">
          <el-button type="primary" @click="goLogin">登录后联系卖家</el-button>
        </div>

        <!-- 评价区域 -->
        <div class="reviews" v-if="goods.reviews?.length">
          <h3>用户评价</h3>
          <div v-for="review in goods.reviews" :key="review.id" class="review-item">
            <el-rate v-model="review.rating" disabled show-score />
            <p>{{ review.comment }}</p>
            <span>—— {{ review.reviewer?.name || '匿名用户' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 下单弹窗 -->
    <el-dialog v-model="dialogVisible" title="联系卖家" width="400px">
      <el-form :model="orderForm">
        <el-form-item label="您的联系方式">
          <el-input v-model="orderForm.contactInfo" placeholder="请留下您的微信/手机号，卖家会联系您" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder" :loading="orderLoading">发送意向</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getGoodsDetail } from '../api/goods';
import { createOrder } from '../api/order';
import { useUserStore } from '../stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const goods = ref(null);
const loading = ref(false);
const dialogVisible = ref(false);
const orderLoading = ref(false);
const orderForm = ref({ contactInfo: '' });

const categoryMap = {
  LIFE: '生活用品',
  ELECTRONICS: '电子产品',
  BOOK: '书籍',
  CLOTHING: '服饰穿戴',
  SPORTS: '运动户外',
  OTHER: '其他'
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  return baseUrl + path;
};

const getSellerName = (seller) => {
  if (!seller) return '匿名';
  if (seller.nickname) return seller.nickname;
  if (seller.name) return seller.name;
  if (seller.phone) return seller.phone.slice(0, 3) + '****' + seller.phone.slice(-4);
  return '匿名';
};

const fetchDetail = async () => {
  const id = route.params.id;
  loading.value = true;
  try {
    const res = await getGoodsDetail(id);
    goods.value = res;
  } catch (err) {
    ElMessage.error('加载失败');
    router.push('/');
  } finally {
    loading.value = false;
  }
};

const openOrderDialog = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  orderForm.value.contactInfo = '';
  dialogVisible.value = true;
};

const submitOrder = async () => {
  if (!orderForm.value.contactInfo) {
    ElMessage.warning('请填写您的联系方式');
    return;
  }
  orderLoading.value = true;
  try {
    await createOrder({ goodsId: goods.value.id, contactInfo: orderForm.value.contactInfo });
    ElMessage.success('意向已发送，卖家会联系您');
    dialogVisible.value = false;
  } catch (err) {
    ElMessage.error(err.msg || '操作失败');
  } finally {
    orderLoading.value = false;
  }
};

const copyContact = () => {
  if (goods.value?.contact) {
    navigator.clipboard.writeText(goods.value.contact);
    ElMessage.success('联系方式已复制');
  }
};

const goLogin = () => {
  router.push('/login');
};

const goEditGoods = () => {
  router.push(`/edit-goods/${goods.value.id}`);
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.detail-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info {
  padding: 20px;
}

.price {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
}

.meta {
  margin: 16px 0;
  line-height: 1.8;
  color: #666;
}

.student-badge {
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
}

.description {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.contact-section {
  background: #f0f9ff;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.contact-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.contact-value {
  color: #3b82f6;
  margin-bottom: 12px;
}

.login-tip {
  text-align: center;
}

.actions {
  margin: 20px 0;
}

.reviews {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.review-item {
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}
</style>
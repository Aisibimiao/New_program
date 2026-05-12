<template>
  <div class="admin-container">
    <el-tabs v-model="activeTab">
      <!-- ==================== 用户管理 ==================== -->
      <el-tab-pane label="用户管理" name="users">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="按手机号或邮箱搜索"
            clearable
            style="width: 300px"
            @clear="fetchUsers"
            @keyup.enter="fetchUsers"
          >
            <template #append>
              <el-button @click="fetchUsers">搜索</el-button>
            </template>
          </el-input>
        </div>
        
        <el-table :data="users" stripe v-loading="userLoading">
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="studentId" label="学号" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-select v-model="row.role" size="small" @change="updateRole(row.id, row.role)">
                <el-option label="普通用户" value="USER" />
                <el-option label="管理员" value="ADMIN" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ==================== 物品管理 ==================== -->
      <el-tab-pane label="物品管理" name="goods">
        <el-table :data="goods" stripe v-loading="goodsLoading">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="price" label="价格" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
                {{ row.status === 'ACTIVE' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="changeStatus(row.id, 'INACTIVE')">下架</el-button>
              <el-button size="small" type="success" @click="changeStatus(row.id, 'ACTIVE')">上架</el-button>
              <el-button size="small" type="danger" plain @click="deleteGoods(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ==================== 统计概览 ==================== -->
      <el-tab-pane label="统计概览" name="stats">
        <!-- 时间筛选下拉框 -->
        <div class="time-filter">
          <span class="filter-label">时间范围：</span>
          <el-select v-model="statsTimeRange" placeholder="选择时间范围" @change="fetchStats" style="width: 120px">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本年" value="year" />
          </el-select>
        </div>

        <div v-loading="statsLoading">
          <!-- 顶部统计卡片 -->
          <el-row :gutter="20" class="stats-metrics">
            <el-col :span="6">
              <div class="stat-card-simple">
                <div class="stat-card-value">{{ stats.totalUsers || 0 }}</div>
                <div class="stat-card-label">总用户数</div>
                <div class="stat-card-trend">
                  <span :class="stats.userGrowthRate >= 0 ? 'trend-up' : 'trend-down'">
                    {{ stats.userGrowthRate >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.userGrowthRate) }}%
                  </span> 较上月
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card-simple">
                <div class="stat-card-value">{{ stats.totalGoods || 0 }}</div>
                <div class="stat-card-label">物品总数</div>
                <div class="stat-card-trend">
                  <span :class="stats.goodsGrowthRate >= 0 ? 'trend-up' : 'trend-down'">
                    {{ stats.goodsGrowthRate >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.goodsGrowthRate) }}%
                  </span> 较上月
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card-simple">
                <div class="stat-card-value">{{ stats.activeGoodsCount || 0 }}</div>
                <div class="stat-card-label">在售物品</div>
                <div class="stat-card-trend">
                  <span :class="stats.activeGrowthRate >= 0 ? 'trend-up' : 'trend-down'">
                    {{ stats.activeGrowthRate >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.activeGrowthRate) }}%
                  </span> 较上月
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card-simple">
                <div class="stat-card-value">{{ stats.totalOrders || 0 }}</div>
                <div class="stat-card-label">总订单数</div>
                <div class="stat-card-trend">
                  <span :class="stats.ordersGrowthRate >= 0 ? 'trend-up' : 'trend-down'">
                    {{ stats.ordersGrowthRate >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.ordersGrowthRate) }}%
                  </span> 较上月
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 平台数据概览卡片 -->
          <el-card class="stats-overview-card">
            <template #header>
              <div class="card-header">
                <span>📊 平台数据概览</span>
                <span class="header-date">{{ currentDate }}</span>
              </div>
            </template>
            
            <el-row :gutter="20">
              <el-col :span="16">
                <div class="chart-section">
                  <div class="section-title">用户增长趋势（近6个月）</div>
                  <div class="trend-chart">
                    <div v-for="(item, index) in userTrend" :key="index" class="trend-bar-item">
                      <div class="trend-bar" :style="{ height: (item.count / maxUserCount) * 100 + '%' }"></div>
                      <div class="trend-label">{{ item.month }}</div>
                      <div class="trend-value">{{ item.count }}</div>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-section">
                  <div class="section-title">今日/本周数据</div>
                  <div class="summary-list">
                    <div class="summary-list-item">
                      <span class="summary-label">今日新增用户</span>
                      <span class="summary-number">{{ todayNewUsers }}</span>
                    </div>
                    <div class="summary-list-item">
                      <span class="summary-label">本周新增物品</span>
                      <span class="summary-number">{{ weekNewGoods }}</span>
                    </div>
                    <div class="summary-list-item">
                      <span class="summary-label">本周订单数</span>
                      <span class="summary-number">{{ weekOrders }}</span>
                    </div>
                    <div class="summary-list-item">
                      <span class="summary-label">活跃用户数</span>
                      <span class="summary-number">{{ stats.totalUsers || 0 }}</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>

          <!-- 物品分类分布卡片 -->
          <el-card class="stats-category-card">
            <template #header>
              <span>📦 物品分类分布</span>
            </template>
            <div class="category-stats-list">
              <div v-for="item in categoryStats" :key="item.category" class="category-stats-item">
                <div class="category-stats-info">
                  <span class="category-stats-name">{{ getCategoryName(item.category) }}</span>
                  <span class="category-stats-count">{{ item._count.id }}件</span>
                </div>
                <div class="category-stats-bar">
                  <div class="category-stats-progress" :style="{ width: (item._count.id / maxCategoryCount) * 100 + '%' }"></div>
                </div>
              </div>
              <div v-if="!categoryStats.length" class="empty-tip">暂无数据</div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- ==================== 交易统计 ==================== -->
      <el-tab-pane label="交易统计" name="trade">
        <!-- 时间筛选下拉框 -->
        <div class="time-filter">
          <span class="filter-label">时间范围：</span>
          <el-select v-model="tradeTimeRange" placeholder="选择时间范围" @change="fetchTradeStats" style="width: 120px">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本年" value="year" />
          </el-select>
        </div>

        <div v-loading="tradeLoading">
          <!-- 核心指标 -->
          <el-row :gutter="20" class="trade-metrics">
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-value">{{ tradeStats.totalOrders || 0 }}</div>
                <div class="metric-label">总意向订单</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-value">{{ tradeStats.totalCompletedOrders || 0 }}</div>
                <div class="metric-label">已完成交易</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-value">{{ tradeStats.completionRate || 0 }}%</div>
                <div class="metric-label">成交转化率</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <div class="metric-value">{{ tradeStats.totalUsers || 0 }}</div>
                <div class="metric-label">活跃用户数</div>
              </div>
            </el-col>
          </el-row>

          <!-- 近7天趋势 -->
          <el-card class="chart-card">
            <template #header>
              <span>📈 {{ tradeTimeRange === 'today' ? '今日小时趋势' : (tradeTimeRange === 'week' ? '近7天趋势' : (tradeTimeRange === 'month' ? '近30天趋势' : '近12个月趋势')) }}</span>
            </template>
            <div class="chart-bars">
              <div v-for="item in tradeStats.trendData" :key="item.label" class="bar-item">
                <div class="bar" :style="{ height: (item.count / maxTrendCount) * 100 + '%' }"></div>
                <div class="bar-label">{{ item.label }}</div>
                <div class="bar-value">{{ item.count }}</div>
              </div>
            </div>
          </el-card>

          <!-- 商品分类分布 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <span>📊 物品分类分布</span>
                </template>
                <div class="category-list">
                  <div v-for="item in tradeStats.categoryStats" :key="item.category" class="category-item">
                    <span class="category-name">{{ getCategoryName(item.category) }}</span>
                    <span class="category-count">{{ item._count.id }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>

            <!-- 热门商品排行 -->
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <span>🔥 热门商品排行</span>
                </template>
                <div class="hot-list">
                  <div v-for="(item, index) in tradeStats.hotGoods" :key="item.id" class="hot-item">
                    <span class="hot-rank">{{ index + 1 }}</span>
                    <span class="hot-title">{{ item.title }}</span>
                    <span class="hot-views">{{ item.viewCount }}次浏览</span>
                  </div>
                  <div v-if="!tradeStats.hotGoods?.length" class="empty-tip">暂无数据</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 最近成交记录 -->
          <el-card class="chart-card">
            <template #header>
              <span>✅ 最近成交记录</span>
            </template>
            <el-table :data="tradeStats.recentOrders" stripe size="small">
              <el-table-column prop="goodsTitle" label="物品名称" min-width="150" />
              <el-table-column prop="price" label="价格" width="100" />
              <el-table-column prop="buyerName" label="买家" width="120" />
              <el-table-column prop="sellerName" label="卖家" width="120" />
              <el-table-column prop="completedAt" label="成交时间" width="160">
                <template #default="{ row }">
                  {{ formatDate(row.completedAt) }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!tradeStats.recentOrders?.length" class="empty-tip">暂无成交记录</div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../api/request';

const activeTab = ref('users');
const users = ref([]);
const goods = ref([]);
const stats = ref({});
const tradeStats = ref({});
const userLoading = ref(false);
const goodsLoading = ref(false);
const statsLoading = ref(false);
const tradeLoading = ref(false);
const searchKeyword = ref('');
const statsTimeRange = ref('month');
const tradeTimeRange = ref('week');

// 统计数据变量
const maxTrendCount = ref(1);
const maxUserCount = ref(180);
const maxCategoryCount = ref(1);
const categoryStats = ref([]);
const userTrend = ref([]);
const todayNewUsers = ref(0);
const weekNewGoods = ref(0);
const weekOrders = ref(0);

const getCategoryName = (category) => {
  const map = {
    LIFE: '生活用品',
    ELECTRONICS: '电子产品',
    BOOK: '书籍',
    CLOTHING: '服饰穿戴',
    SPORTS: '运动户外',
    OTHER: '其他'
  };
  return map[category] || category;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const currentDate = computed(() => {
  const date = new Date();
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
});

// 获取用户列表（支持搜索）
const fetchUsers = async () => {
  userLoading.value = true;
  try {
    let url = '/admin/users';
    if (searchKeyword.value) {
      url += `?keyword=${encodeURIComponent(searchKeyword.value)}`;
    }
    const res = await request.get(url);
    users.value = res;
  } catch (err) {
    ElMessage.error('加载用户失败');
  } finally {
    userLoading.value = false;
  }
};

const fetchGoods = async () => {
  goodsLoading.value = true;
  try {
    const res = await request.get('/admin/goods');
    goods.value = res;
  } finally {
    goodsLoading.value = false;
  }
};

// 获取统计概览（支持时间筛选）
const fetchStats = async () => {
  statsLoading.value = true;
  try {
    const res = await request.get('/admin/stats', {
      params: { timeRange: statsTimeRange.value }
    });
    stats.value = res;
    
    if (res.categoryStats?.length) {
      categoryStats.value = res.categoryStats;
      maxCategoryCount.value = res.maxCategoryCount || 1;
    }
    if (res.monthlyTrend?.length) {
      userTrend.value = res.monthlyTrend;
      maxUserCount.value = Math.max(...res.monthlyTrend.map(t => t.count), 1);
    }
    todayNewUsers.value = res.todayNewUsers || 0;
    weekNewGoods.value = res.weekNewGoods || 0;
    weekOrders.value = res.weekOrders || 0;
  } catch (err) {
    ElMessage.error('加载统计失败');
  } finally {
    statsLoading.value = false;
  }
};

// 获取交易统计（支持时间筛选）
const fetchTradeStats = async () => {
  tradeLoading.value = true;
  try {
    const res = await request.get('/admin/trade-stats', {
      params: { timeRange: tradeTimeRange.value }
    });
    tradeStats.value = res;
    if (res.trendData?.length) {
      maxTrendCount.value = Math.max(...res.trendData.map(d => d.count), 1);
    }
  } catch (err) {
    ElMessage.error('加载交易统计失败');
  } finally {
    tradeLoading.value = false;
  }
};

const updateRole = async (userId, role) => {
  try {
    await request.put(`/admin/users/${userId}/role`, { role });
    ElMessage.success('角色已更新');
  } catch (err) {
    ElMessage.error('更新失败');
    fetchUsers();
  }
};

const changeStatus = async (goodsId, status) => {
  try {
    await request.put(`/admin/goods/${goodsId}/status`, { status });
    ElMessage.success('状态已更新');
    fetchGoods();
  } catch (err) {
    ElMessage.error('操作失败');
  }
};

const deleteGoods = async (goodsId) => {
  try {
    await ElMessageBox.confirm('确定删除此物品吗？删除后不可恢复', '警告', { type: 'warning' });
    await request.delete(`/admin/goods/${goodsId}`);
    ElMessage.success('已删除');
    fetchGoods();
    fetchStats();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败');
  }
};

onMounted(() => {
  fetchUsers();
  fetchGoods();
  fetchStats();
  fetchTradeStats();
});
</script>

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
}

/* 时间筛选 */
.time-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
}

/* ========== 统计概览样式 ========== */
.stats-metrics {
  margin-bottom: 20px;
}

.stat-card-simple {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-card-simple .stat-card-value {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
}

.stat-card-simple .stat-card-label {
  font-size: 14px;
  color: #6c757d;
  margin-top: 8px;
}

.stat-card-simple .stat-card-trend {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.trend-up {
  color: #10b981;
  font-weight: 500;
  margin-right: 4px;
}

.trend-down {
  color: #ef4444;
  font-weight: 500;
  margin-right: 4px;
}

.stats-overview-card,
.stats-category-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-date {
  font-size: 12px;
  color: #9ca3af;
}

.chart-section,
.summary-section {
  padding: 0 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 20px;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 10px 0;
}

.trend-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50px;
}

.trend-bar {
  width: 30px;
  background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 6px 6px 4px 4px;
  transition: height 0.3s;
  min-height: 4px;
}

.trend-label {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.trend-value {
  font-size: 12px;
  font-weight: bold;
  color: #3b82f6;
  margin-top: 4px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-label {
  font-size: 13px;
  color: #6c757d;
}

.summary-number {
  font-size: 18px;
  font-weight: bold;
  color: #3b82f6;
}

.category-stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-stats-item {
  width: 100%;
}

.category-stats-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.category-stats-name {
  color: #4a5568;
}

.category-stats-count {
  font-weight: 500;
  color: #3b82f6;
}

.category-stats-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.category-stats-progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* ========== 交易统计样式 ========== */
.trade-metrics {
  margin-bottom: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.metric-card .metric-value {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
}

.metric-card .metric-label {
  font-size: 14px;
  color: #6c757d;
  margin-top: 8px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.bar {
  width: 30px;
  background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
  min-height: 4px;
}

.bar-label {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.bar-value {
  font-size: 12px;
  font-weight: bold;
  color: #3b82f6;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.category-item {
  flex: 1;
  min-width: 100px;
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.category-name {
  color: #1f2937;
}

.category-count {
  font-weight: bold;
  color: #3b82f6;
}

.hot-list {
  max-height: 300px;
  overflow-y: auto;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f6;
}

.hot-rank {
  width: 30px;
  font-weight: bold;
  color: #f59e0b;
}

.hot-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-views {
  font-size: 12px;
  color: #9ca3af;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}
</style>
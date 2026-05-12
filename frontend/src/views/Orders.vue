<template>
  <div class="orders-container">
    <el-tabs v-model="activeTab" @tab-click="fetchOrders">
      <!-- 我买到的标签页 -->
      <el-tab-pane label="我买到的" name="buy">
        <el-table :data="buyOrders" stripe v-loading="loading">
          <el-table-column prop="goods.title" label="物品" min-width="180" />
          <el-table-column prop="goods.price" label="价格" width="100" />
          <el-table-column label="卖家" width="120">
            <template #default="{ row }">{{ row.goods.seller?.name || row.goods.seller?.phone || '匿名' }}</template>
          </el-table-column>
          <el-table-column label="卖家手机号" width="130">
            <template #default="{ row }">{{ row.goods.seller?.phone || '无' }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="orderStatusMap[row.status].type">{{ orderStatusMap[row.status].text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="contactInfo" label="我留下的联系方式" width="150" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <!-- 待确认状态：显示取消按钮 -->
              <el-button 
                v-if="row.status === 'PENDING'" 
                size="small" 
                type="danger" 
                @click="cancelOrderAction(row.id)"
              >
                取消
              </el-button>
              <!-- 已完成或已取消状态：显示删除按钮 -->
              <el-button 
                v-if="row.status === 'COMPLETED' || row.status === 'CANCELLED'" 
                size="small" 
                type="danger" 
                plain 
                @click="deleteOrderAction(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 我卖出的标签页 -->
      <el-tab-pane label="我卖出的" name="sell">
        <el-table :data="sellOrders" stripe v-loading="loading">
          <el-table-column prop="goods.title" label="物品" min-width="180" />
          <el-table-column prop="goods.price" label="价格" width="100" />
          <el-table-column label="买家" width="120">
            <template #default="{ row }">{{ row.buyer?.name || row.buyer?.phone || '匿名' }}</template>
          </el-table-column>
          <el-table-column label="买家手机号" width="130">
            <template #default="{ row }">{{ row.buyer?.phone || '无' }}</template>
          </el-table-column>
          <el-table-column prop="contactInfo" label="买家联系方式" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="orderStatusMap[row.status].type">{{ orderStatusMap[row.status].text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <!-- 待确认状态：显示确认和取消按钮 -->
              <el-button 
                v-if="row.status === 'PENDING'" 
                size="small" 
                type="success" 
                @click="confirmOrderAction(row.id)"
              >
                确认交易
              </el-button>
              <el-button 
                v-if="row.status === 'PENDING'" 
                size="small" 
                type="danger" 
                @click="cancelOrderAction(row.id)"
              >
                取消
              </el-button>
              <!-- 已完成或已取消状态：显示删除按钮 -->
              <el-button 
                v-if="row.status === 'COMPLETED' || row.status === 'CANCELLED'" 
                size="small" 
                type="danger" 
                plain 
                @click="deleteOrderAction(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 空状态 -->
    <div v-if="!loading && buyOrders.length === 0 && sellOrders.length === 0" class="empty-state">
      <el-empty description="暂无订单" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getBuyOrders, getSellOrders, confirmOrder, cancelOrder, deleteOrder } from '../api/order';

const activeTab = ref('buy');
const buyOrders = ref([]);
const sellOrders = ref([]);
const loading = ref(false);

const orderStatusMap = {
  PENDING: { text: '待确认', type: 'warning' },
  COMPLETED: { text: '已完成', type: 'success' },
  CANCELLED: { text: '已取消', type: 'info' }
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'buy') {
      const res = await getBuyOrders();
      buyOrders.value = res;
    } else {
      const res = await getSellOrders();
      sellOrders.value = res;
    }
  } catch (err) {
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
  }
};

// 确认交易（卖家）
const confirmOrderAction = async (orderId) => {
  try {
    await confirmOrder(orderId);
    ElMessage.success('交易已完成');
    await fetchOrders();
  } catch (err) {
    ElMessage.error('操作失败');
  }
};

// 取消订单
const cancelOrderAction = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定取消此订单吗？', '提示', { type: 'warning' });
    await cancelOrder(orderId);
    ElMessage.success('已取消');
    fetchOrders();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('取消失败');
  }
};

// 删除订单（新增）
const deleteOrderAction = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定删除此订单吗？删除后不可恢复', '提示', { type: 'warning' });
    await deleteOrder(orderId);
    ElMessage.success('订单已删除');
    fetchOrders();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败');
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .cell) {
  line-height: 1.4;
}
</style>
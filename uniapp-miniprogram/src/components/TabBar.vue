<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      v-for="(item, index) in tabs" 
      :key="index"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <text class="tab-icon">{{ item.icon }}</text>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabs = [
  { text: '首页', icon: '🏠', url: '/pages/index/index' },
  { text: '商品', icon: '📦', url: '/pages/goods/list' },
  { text: '我的', icon: '👤', url: '/pages/user/profile' }
]

const currentIndex = ref(0)

function switchTab(index: number) {
  if (currentIndex.value === index) return
  currentIndex.value = index
  uni.switchTab({ url: tabs[index].url })
}

function setCurrentIndex(index: number) {
  currentIndex.value = index
}

defineExpose({ setCurrentIndex })
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 40rpx;
  transition: all 0.3s ease;
}

.tab-icon {
  font-size: 48rpx;
  margin-bottom: 5rpx;
}

.tab-text {
  font-size: 24rpx;
  color: #999;
}

.tab-item.active {
  .tab-icon {
    transform: scale(1.1);
  }
  .tab-text {
    color: #667eea;
    font-weight: bold;
  }
}
</style>

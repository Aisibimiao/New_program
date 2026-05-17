<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      v-for="(item, index) in tabs" 
      :key="index"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <view v-if="index === 1" class="tab-icon publish-icon">
        <view class="publish-btn">
          <view class="publish-icon-cross">
            <view class="cross-line cross-h"></view>
            <view class="cross-line cross-v"></view>
          </view>
        </view>
      </view>
      <view v-else class="tab-icon">
        <LineIcon :name="item.icon" :active="currentIndex === index" />
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LineIcon from './LineIcon.vue'

const tabs = [
  { text: '首页', icon: 'home', url: '/pages/index/index' },
  { text: '发布', icon: 'plus', url: '/pages/publish/index' },
  { text: '我的', icon: 'user', url: '/pages/user/profile' }
]

const currentIndex = ref(0)

function switchTab(index: number) {
  if (currentIndex.value === index) return
  currentIndex.value = index
  if (index === 0) {
    uni.reLaunch({ url: tabs[index].url })
  } else {
    uni.navigateTo({ url: tabs[index].url })
  }
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
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 5rpx;
}

.tab-text {
  font-size: 24rpx;
  color: #999;
}

.tab-item.active {
  .tab-icon:not(.publish-icon) {
    transform: scale(1.1);
  }
  .tab-text {
    color: #667eea;
    font-weight: bold;
  }
}

.publish-icon {
  width: auto;
  height: auto;
  margin-bottom: 0;
}

.publish-btn {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -40rpx;
  box-shadow: 0 12rpx 32rpx rgba(245, 87, 108, 0.4);
  border: 4rpx solid #fff;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
    box-shadow: 0 6rpx 16rpx rgba(245, 87, 108, 0.5);
  }
}

.publish-icon-cross {
  position: relative;
  width: 44rpx;
  height: 44rpx;
}

.cross-line {
  position: absolute;
  background-color: #fff;
  border-radius: 4rpx;
  transition: all 0.2s ease;
}

.cross-h {
  width: 100%;
  height: 6rpx;
  top: 50%;
  transform: translateY(-50%);
}

.cross-v {
  width: 6rpx;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}
</style>

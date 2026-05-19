<template>
  <view class="line-tab-bar">
    <view 
      class="line-tab-item" 
      v-for="(item, index) in tabs" 
      :key="index"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <view v-if="index === 1" class="line-tab-icon line-publish-icon">
        <view class="line-publish-btn">
          <view class="line-publish-icon-cross">
            <view class="line-cross-line line-cross-h"></view>
            <view class="line-cross-line line-cross-v"></view>
          </view>
        </view>
      </view>
      <view v-else class="line-tab-icon">
        <LineIcon :name="item.icon" :active="currentIndex === index" />
      </view>
      <text class="line-tab-text">{{ item.text }}</text>
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
.line-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 130rpx;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 3rpx solid #e0e0e0;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4rpx 20rpx rgba(26, 26, 46, 0.08);
}

.line-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 50rpx;
  transition: all 0.25s ease;
  position: relative;
}

.line-tab-icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 8rpx;
}

.line-tab-text {
  font-size: 24rpx;
  color: #8a8a9e;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.line-tab-item.active {
  .line-tab-icon:not(.line-publish-icon) {
    transform: scale(1.1);
  }
  .line-tab-text {
    color: #3f37c9;
    font-weight: 600;
  }
  &::before {
    content: '';
    position: absolute;
    top: 8rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 4rpx;
    background: linear-gradient(90deg, #3f37c9 0%, #4a4a6a 100%);
    border-radius: 2rpx;
  }
}

.line-publish-icon {
  width: auto;
  height: auto;
  margin-bottom: 0;
}

.line-publish-btn {
  width: 110rpx;
  height: 110rpx;
  background: transparent;
  border: 4rpx solid #3f37c9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -50rpx;
  position: relative;
  transition: all 0.25s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -8rpx;
    left: -8rpx;
    right: -8rpx;
    bottom: -8rpx;
    border: 2rpx dashed #3f37c9;
    border-radius: 50%;
    opacity: 0.5;
  }
  
  &:active {
    transform: scale(0.9);
    background: rgba(63, 55, 201, 0.1);
  }
}

.line-publish-icon-cross {
  position: relative;
  width: 48rpx;
  height: 48rpx;
}

.line-cross-line {
  position: absolute;
  background-color: #3f37c9;
  border-radius: 3rpx;
  transition: all 0.2s ease;
}

.line-cross-h {
  width: 100%;
  height: 6rpx;
  top: 50%;
  transform: translateY(-50%);
}

.line-cross-v {
  width: 6rpx;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}
</style>

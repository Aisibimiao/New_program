<template>
  <view class="line-icon" :class="[`icon-${name}`, { 'icon-active': active }]">
    <view class="icon-inner">
      <!-- 首页图标 -->
      <view v-if="name === 'home'" class="icon-home">
        <view class="home-roof"></view>
        <view class="home-body"></view>
        <view class="home-door"></view>
      </view>
      
      <!-- 发布图标 -->
      <view v-else-if="name === 'plus'" class="icon-plus">
        <view class="plus-h"></view>
        <view class="plus-v"></view>
      </view>
      
      <!-- 用户图标 -->
      <view v-else-if="name === 'user'" class="icon-user">
        <view class="user-circle"></view>
        <view class="user-body"></view>
      </view>
      
      <!-- 聊天图标 -->
      <view v-else-if="name === 'chat'" class="icon-chat">
        <view class="chat-bubble"></view>
        <view class="chat-tail"></view>
      </view>
      
      <!-- 收藏图标 -->
      <view v-else-if="name === 'heart'" class="icon-heart">
        <view class="heart-shape"></view>
      </view>
      
      <!-- 分享图标 -->
      <view v-else-if="name === 'share'" class="icon-share">
        <view class="share-circle"></view>
        <view class="share-line1"></view>
        <view class="share-line2"></view>
      </view>
      
      <!-- 搜索图标 -->
      <view v-else-if="name === 'search'" class="icon-search">
        <view class="search-circle"></view>
        <view class="search-line"></view>
      </view>
      
      <!-- 设置图标 -->
      <view v-else-if="name === 'settings'" class="icon-settings">
        <view class="settings-circle"></view>
        <view class="settings-gear"></view>
      </view>
      
      <!-- 信息图标 -->
      <view v-else-if="name === 'info'" class="icon-info">
        <view class="info-circle"></view>
        <view class="info-i"></view>
      </view>
      
      <!-- 删除图标 -->
      <view v-else-if="name === 'trash'" class="icon-trash">
        <view class="trash-can"></view>
        <view class="trash-lid"></view>
      </view>
      
      <!-- 下拉箭头 -->
      <view v-else-if="name === 'arrow-down'" class="icon-arrow-down">
        <view class="arrow-d"></view>
      </view>
      
      <!-- 上拉箭头 -->
      <view v-else-if="name === 'arrow-up'" class="icon-arrow-up">
        <view class="arrow-u"></view>
      </view>
      
      <!-- 订单图标 -->
      <view v-else-if="name === 'order'" class="icon-order">
        <view class="order-box"></view>
        <view class="order-line"></view>
      </view>
      
      <!-- 钱包图标 -->
      <view v-else-if="name === 'wallet'" class="icon-wallet">
        <view class="wallet-shape"></view>
        <view class="wallet-line"></view>
      </view>
      
      <!-- 反馈图标 -->
      <view v-else-if="name === 'feedback'" class="icon-feedback">
        <view class="feedback-message"></view>
      </view>
      
      <!-- 通知图标 -->
      <view v-else-if="name === 'bell'" class="icon-bell">
        <view class="bell-shape"></view>
        <view class="bell-clapper"></view>
      </view>
      
      <!-- 用户组图标 -->
      <view v-else-if="name === 'users'" class="icon-users">
        <view class="user-group"></view>
      </view>
      
      <!-- 刷新图标 -->
      <view v-else-if="name === 'refresh'" class="icon-refresh">
        <view class="refresh-arrow"></view>
      </view>
      
      <!-- 锁图标 -->
      <view v-else-if="name === 'lock'" class="icon-lock">
        <view class="lock-shape"></view>
        <view class="lock-shackle"></view>
      </view>
      
      <!-- 文件图标 -->
      <view v-else-if="name === 'file'" class="icon-file">
        <view class="file-shape"></view>
        <view class="file-corner"></view>
      </view>
      
      <!-- 门图标 -->
      <view v-else-if="name === 'door'" class="icon-door">
        <view class="door-shape"></view>
        <view class="door-handle"></view>
      </view>
      
      <!-- 左箭头 -->
      <view v-else-if="name === 'arrow-left'" class="icon-arrow-left">
        <view class="arrow-l"></view>
      </view>
      
      <!-- 右箭头 -->
      <view v-else-if="name === 'chevron-right'" class="icon-chevron-right">
        <view class="chevron-r"></view>
      </view>
      
      <!-- 关闭图标 -->
      <view v-else-if="name === 'close'" class="icon-close">
        <view class="close-line1"></view>
        <view class="close-line2"></view>
      </view>
      
      <!-- 位置图标 -->
      <view v-else-if="name === 'location'" class="icon-location">
        <view class="location-shape"></view>
        <view class="location-dot"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  active?: boolean
}>()
</script>

<style lang="scss" scoped>
.line-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-active {
  color: #4F46E5;
  
  .icon-home,
  .icon-user,
  .icon-plus,
  .icon-chat,
  .icon-heart,
  .icon-share,
  .icon-search,
  .icon-settings,
  .icon-info,
  .icon-trash,
  .icon-arrow-down,
  .icon-arrow-up,
  .icon-order,
  .icon-wallet,
  .icon-feedback {
    border-color: #4F46E5;
    
    &::before, &::after {
      background-color: #4F46E5;
    }
  }
  
  .heart-shape {
    background-color: #4F46E5;
  }
}

/* 首页图标 */
.icon-home {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .home-roof {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 16rpx solid transparent;
    border-right: 16rpx solid transparent;
    border-bottom: 14rpx solid #999;
  }
  
  .home-body {
    position: absolute;
    bottom: 0;
    left: 2rpx;
    width: 24rpx;
    height: 16rpx;
    border: 2rpx solid #999;
    border-top: none;
    border-radius: 0 0 4rpx 4rpx;
  }
  
  .home-door {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8rpx;
    height: 10rpx;
    background-color: #999;
    border-radius: 2rpx;
  }
}

.icon-active .icon-home {
  .home-roof {
    border-bottom-color: #4F46E5;
  }
  .home-body {
    border-color: #4F46E5;
  }
  .home-door {
    background-color: #4F46E5;
  }
}

/* 发布图标 */
.icon-plus {
  width: 32rpx;
  height: 32rpx;
  position: relative;
  
  .plus-h {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 4rpx;
    background-color: #999;
    transform: translateY(-50%);
    border-radius: 2rpx;
  }
  
  .plus-v {
    position: absolute;
    left: 50%;
    top: 0;
    width: 4rpx;
    height: 100%;
    background-color: #999;
    transform: translateX(-50%);
    border-radius: 2rpx;
  }
}

.icon-active .icon-plus {
  .plus-h, .plus-v {
    background-color: #4F46E5;
  }
}

/* 用户图标 */
.icon-user {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .user-circle {
    width: 14rpx;
    height: 14rpx;
    border: 3rpx solid #999;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .user-body {
    width: 20rpx;
    height: 14rpx;
    border: 3rpx solid #999;
    border-top: none;
    border-radius: 0 0 10rpx 10rpx;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

.icon-active .icon-user {
  .user-circle, .user-body {
    border-color: #4F46E5;
  }
}

/* 聊天图标 */
.icon-chat {
  width: 30rpx;
  height: 26rpx;
  position: relative;
  
  .chat-bubble {
    width: 22rpx;
    height: 18rpx;
    border: 3rpx solid #999;
    border-radius: 0 10rpx 10rpx 10rpx;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .chat-tail {
    width: 0;
    height: 0;
    border-top: 6rpx solid transparent;
    border-bottom: 6rpx solid transparent;
    border-right: 8rpx solid #999;
    position: absolute;
    bottom: 4rpx;
    left: -4rpx;
  }
}

.icon-active .icon-chat {
  .chat-bubble {
    border-color: #4F46E5;
  }
  .chat-tail {
    border-right-color: #4F46E5;
  }
}

/* 收藏图标 */
.icon-heart {
  width: 26rpx;
  height: 26rpx;
  position: relative;
  
  .heart-shape {
    width: 12rpx;
    height: 12rpx;
    background-color: #999;
    border-radius: 50%;
    position: absolute;
    
    &:nth-child(1) {
      top: 6rpx;
      left: 0;
    }
    
    &:nth-child(2) {
      top: 6rpx;
      right: 0;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) rotate(-45deg);
    width: 14rpx;
    height: 14rpx;
    background-color: #999;
  }
}

.icon-heart {
  background: transparent;
  
  &::before {
    background-color: transparent;
    border: 3rpx solid #999;
    border-color: #999 #999 transparent transparent;
  }
  
  .heart-shape {
    background-color: transparent;
    border: 3rpx solid #999;
  }
}

.icon-active .icon-heart {
  &::before {
    background-color: #4F46E5;
    border-color: #4F46E5;
  }
  
  .heart-shape {
    background-color: #4F46E5;
    border-color: #4F46E5;
  }
}

/* 分享图标 */
.icon-share {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .share-circle {
    width: 20rpx;
    height: 20rpx;
    border: 3rpx solid #999;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .share-line1 {
    position: absolute;
    top: 2rpx;
    right: 0;
    width: 12rpx;
    height: 3rpx;
    background-color: #999;
    transform: rotate(45deg);
    transform-origin: left center;
  }
  
  .share-line2 {
    position: absolute;
    top: 0;
    right: 2rpx;
    width: 3rpx;
    height: 12rpx;
    background-color: #999;
    transform: rotate(45deg);
    transform-origin: bottom center;
  }
}

.icon-active .icon-share {
  .share-circle {
    border-color: #4F46E5;
  }
  .share-line1, .share-line2 {
    background-color: #4F46E5;
  }
}

/* 搜索图标 */
.icon-search {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .search-circle {
    width: 20rpx;
    height: 20rpx;
    border: 3rpx solid #999;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .search-line {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 3rpx;
    height: 14rpx;
    background-color: #999;
    transform: rotate(-45deg);
    transform-origin: top center;
  }
}

.icon-active .icon-search {
  .search-circle {
    border-color: #4F46E5;
  }
  .search-line {
    background-color: #4F46E5;
  }
}

/* 设置图标 */
.icon-settings {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .settings-circle {
    width: 24rpx;
    height: 24rpx;
    border: 3rpx solid #999;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .settings-gear {
    position: absolute;
    top: 2rpx;
    left: 2rpx;
    width: 6rpx;
    height: 6rpx;
    background-color: #999;
    border-radius: 50%;
    
    &::before, &::after {
      content: '';
      position: absolute;
      width: 4rpx;
      height: 14rpx;
      background-color: #999;
      border-radius: 2rpx;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    &::before {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    
    &::after {
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }
}

.icon-active .icon-settings {
  .settings-circle {
    border-color: #4F46E5;
  }
  .settings-gear {
    background-color: #4F46E5;
    &::before, &::after {
      background-color: #4F46E5;
    }
  }
}

/* 信息图标 */
.icon-info {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .info-circle {
    width: 24rpx;
    height: 24rpx;
    border: 3rpx solid #999;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .info-i {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    &::before {
      content: '';
      position: absolute;
      width: 4rpx;
      height: 14rpx;
      background-color: #999;
      border-radius: 2rpx;
      top: -7rpx;
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 4rpx;
      height: 4rpx;
      background-color: #999;
      border-radius: 50%;
      bottom: -4rpx;
    }
  }
}

.icon-active .icon-info {
  .info-circle {
    border-color: #4F46E5;
  }
  .info-i {
    &::before, &::after {
      background-color: #4F46E5;
    }
  }
}

/* 删除图标 */
.icon-trash {
  width: 26rpx;
  height: 28rpx;
  position: relative;
  
  .trash-can {
    width: 20rpx;
    height: 18rpx;
    border: 3rpx solid #999;
    border-radius: 4rpx;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .trash-lid {
    width: 24rpx;
    height: 6rpx;
    background-color: #999;
    border-radius: 4rpx 4rpx 0 0;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

.icon-active .icon-trash {
  .trash-can {
    border-color: #4F46E5;
  }
  .trash-lid {
    background-color: #4F46E5;
  }
}

/* 下拉箭头 */
.icon-arrow-down {
  width: 20rpx;
  height: 20rpx;
  position: relative;
  
  .arrow-d {
    width: 0;
    height: 0;
    border-left: 8rpx solid transparent;
    border-right: 8rpx solid transparent;
    border-top: 10rpx solid #999;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.icon-active .icon-arrow-down {
  .arrow-d {
    border-top-color: #4F46E5;
  }
}

/* 上拉箭头 */
.icon-arrow-up {
  width: 20rpx;
  height: 20rpx;
  position: relative;
  
  .arrow-u {
    width: 0;
    height: 0;
    border-left: 8rpx solid transparent;
    border-right: 8rpx solid transparent;
    border-bottom: 10rpx solid #999;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.icon-active .icon-arrow-up {
  .arrow-u {
    border-bottom-color: #4F46E5;
  }
}

/* 订单图标 */
.icon-order {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .order-box {
    width: 24rpx;
    height: 18rpx;
    border: 3rpx solid #999;
    border-radius: 4rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .order-line {
    position: absolute;
    top: 6rpx;
    left: 4rpx;
    width: 16rpx;
    height: 3rpx;
    background-color: #999;
  }
}

.icon-active .icon-order {
  .order-box {
    border-color: #4F46E5;
  }
  .order-line {
    background-color: #4F46E5;
  }
}

/* 钱包图标 */
.icon-wallet {
  width: 28rpx;
  height: 20rpx;
  position: relative;
  
  .wallet-shape {
    width: 26rpx;
    height: 16rpx;
    border: 3rpx solid #999;
    border-radius: 8rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .wallet-line {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 18rpx;
    height: 3rpx;
    background-color: #999;
  }
}

.icon-active .icon-wallet {
  .wallet-shape {
    border-color: #4F46E5;
  }
  .wallet-line {
    background-color: #4F46E5;
  }
}

/* 反馈图标 */
.icon-feedback {
  width: 28rpx;
  height: 24rpx;
  position: relative;
  
  .feedback-message {
    width: 24rpx;
    height: 20rpx;
    border: 3rpx solid #999;
    border-radius: 10rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    &::before {
      content: '';
      position: absolute;
      top: 6rpx;
      left: 6rpx;
      width: 4rpx;
      height: 4rpx;
      background-color: #999;
      border-radius: 50%;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 6rpx;
      right: 6rpx;
      width: 8rpx;
      height: 4rpx;
      border: 2rpx solid #999;
      border-top: none;
      border-radius: 0 0 4rpx 4rpx;
    }
  }
}

.icon-active .icon-feedback {
  .feedback-message {
    border-color: #4F46E5;
    
    &::before {
      background-color: #4F46E5;
    }
    
    &::after {
      border-color: #4F46E5;
    }
  }
}

/* 通知图标 */
.icon-bell {
  width: 28rpx;
  height: 26rpx;
  position: relative;
  
  .bell-shape {
    width: 22rpx;
    height: 18rpx;
    border: 3rpx solid #999;
    border-radius: 11rpx 11rpx 4rpx 4rpx;
    position: absolute;
    top: 4rpx;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .bell-clapper {
    position: absolute;
    bottom: 2rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4rpx solid transparent;
    border-right: 4rpx solid transparent;
    border-top: 6rpx solid #999;
  }
}

.icon-active .icon-bell {
  .bell-shape {
    border-color: #4F46E5;
  }
  .bell-clapper {
    border-top-color: #4F46E5;
  }
}

/* 用户组图标 */
.icon-users {
  width: 30rpx;
  height: 24rpx;
  position: relative;
  
  .user-group {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    &::before {
      content: '';
      position: absolute;
      width: 16rpx;
      height: 16rpx;
      border: 3rpx solid #999;
      border-radius: 50%;
      left: 0;
      top: 0;
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 12rpx;
      height: 12rpx;
      border: 3rpx solid #999;
      border-radius: 50%;
      right: 0;
      bottom: 0;
    }
  }
}

.icon-active .icon-users {
  .user-group {
    &::before, &::after {
      border-color: #4F46E5;
    }
  }
}

/* 刷新图标 */
.icon-refresh {
  width: 28rpx;
  height: 28rpx;
  position: relative;
  
  .refresh-arrow {
    width: 20rpx;
    height: 20rpx;
    border: 3rpx solid #999;
    border-right-color: transparent;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    
    &::after {
      content: '';
      position: absolute;
      top: -4rpx;
      right: -4rpx;
      width: 0;
      height: 0;
      border-left: 6rpx solid transparent;
      border-right: 6rpx solid transparent;
      border-bottom: 6rpx solid #999;
    }
  }
}

.icon-active .icon-refresh {
  .refresh-arrow {
    border-color: #4F46E5;
    border-right-color: transparent;
    
    &::after {
      border-bottom-color: #4F46E5;
    }
  }
}

/* 锁图标 */
.icon-lock {
  width: 24rpx;
  height: 28rpx;
  position: relative;
  
  .lock-shape {
    width: 20rpx;
    height: 16rpx;
    border: 3rpx solid #999;
    border-radius: 4rpx;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .lock-shackle {
    position: absolute;
    top: 2rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 12rpx;
    height: 8rpx;
    border: 3rpx solid #999;
    border-bottom: none;
    border-radius: 8rpx 8rpx 0 0;
  }
}

.icon-active .icon-lock {
  .lock-shape, .lock-shackle {
    border-color: #4F46E5;
  }
}

/* 文件图标 */
.icon-file {
  width: 24rpx;
  height: 28rpx;
  position: relative;
  
  .file-shape {
    width: 20rpx;
    height: 22rpx;
    border: 3rpx solid #999;
    border-radius: 4rpx;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .file-corner {
    position: absolute;
    top: 4rpx;
    right: 2rpx;
    width: 0;
    height: 0;
    border-left: 8rpx solid transparent;
    border-bottom: 8rpx solid transparent;
    border-right: 8rpx solid #999;
  }
}

.icon-active .icon-file {
  .file-shape {
    border-color: #4F46E5;
  }
  .file-corner {
    border-right-color: #4F46E5;
  }
}

/* 门图标 */
.icon-door {
  width: 24rpx;
  height: 30rpx;
  position: relative;
  
  .door-shape {
    width: 20rpx;
    height: 24rpx;
    border: 3rpx solid #999;
    border-radius: 10rpx 10rpx 0 0;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .door-handle {
    position: absolute;
    bottom: 8rpx;
    right: 4rpx;
    width: 4rpx;
    height: 4rpx;
    border: 2rpx solid #999;
    border-radius: 50%;
  }
}

.icon-active .icon-door {
  .door-shape, .door-handle {
    border-color: #4F46E5;
  }
}

/* 左箭头 */
.icon-arrow-left {
  width: 24rpx;
  height: 24rpx;
  position: relative;
  
  .arrow-l {
    width: 0;
    height: 0;
    border-top: 10rpx solid transparent;
    border-bottom: 10rpx solid transparent;
    border-right: 14rpx solid #999;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.icon-active .icon-arrow-left {
  .arrow-l {
    border-right-color: #4F46E5;
  }
}

/* 右箭头 */
.icon-chevron-right {
  width: 20rpx;
  height: 20rpx;
  position: relative;
  
  .chevron-r {
    width: 8rpx;
    height: 8rpx;
    border-right: 3rpx solid #999;
    border-bottom: 3rpx solid #999;
    transform: rotate(-45deg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
  }
}

.icon-active .icon-chevron-right {
  .chevron-r {
    border-color: #4F46E5;
  }
}

/* 关闭图标 */
.icon-close {
  width: 24rpx;
  height: 24rpx;
  position: relative;
  
  .close-line1, .close-line2 {
    position: absolute;
    width: 20rpx;
    height: 3rpx;
    background-color: #999;
    border-radius: 2rpx;
    top: 50%;
    left: 50%;
  }
  
  .close-line1 {
    transform: translate(-50%, -50%) rotate(45deg);
  }
  
  .close-line2 {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
}

.icon-active .icon-close {
  .close-line1, .close-line2 {
    background-color: #4F46E5;
  }
}

/* 位置图标 */
.icon-location {
  width: 24rpx;
  height: 32rpx;
  position: relative;
  
  .location-shape {
    width: 20rpx;
    height: 26rpx;
    border: 3rpx solid #999;
    border-radius: 10rpx 10rpx 10rpx 10rpx;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .location-dot {
    width: 8rpx;
    height: 8rpx;
    background-color: #999;
    border-radius: 50%;
    position: absolute;
    top: 8rpx;
    left: 50%;
    transform: translateX(-50%);
  }
}

.icon-active .icon-location {
  .location-shape {
    border-color: #4F46E5;
  }
  .location-dot {
    background-color: #4F46E5;
  }
}
</style>
<template>
  <view class="about-container">
    <view class="header-section">
      <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
      <text class="app-name">重庆电子科技职业大学校园交易平台</text>
      <text class="version">版本 1.0.0</text>
    </view>

    <view class="intro-section">
      <text class="section-title">平台简介</text>
      <text class="intro-text">
        重庆电子科技职业大学校园交易平台是一款面向在校学生的闲置物品交易小程序。我们致力于为同学们提供一个便捷、安全、诚信的二手交易环境，让闲置物品循环利用，让校园生活更加丰富多彩。
      </text>
    </view>

    <view class="feature-section">
      <text class="section-title">主要功能</text>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">📦</text>
          <text class="feature-text">发布闲置物品</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🛒</text>
          <text class="feature-text">在线购买商品</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">💬</text>
          <text class="feature-text">实时聊天咨询</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">❤️</text>
          <text class="feature-text">收藏感兴趣商品</text>
        </view>
      </view>
    </view>

    <view class="developer-section">
      <text class="section-title">开发者信息</text>
      <view class="developer-info">
        <text class="developer-name">开发团队</text>
        <text class="developer-detail">校园创新技术团队</text>
      </view>
      <view class="developer-info">
        <text class="developer-name">联系邮箱</text>
        <text class="developer-detail">support@campus-market.com</text>
      </view>
    </view>

    <view class="links-section">
      <text class="section-title">相关链接</text>
      <view class="link-item" @click="openLink('userAgreement')">
        <text class="link-text">用户协议</text>
        <text class="link-arrow">›</text>
      </view>
      <view class="link-item" @click="openLink('privacyPolicy')">
        <text class="link-text">隐私政策</text>
        <text class="link-arrow">›</text>
      </view>
      <view class="link-item" @click="openLink('feedback')">
        <text class="link-text">意见反馈</text>
        <text class="link-arrow">›</text>
      </view>
    </view>

    <view class="footer">
      <text class="copyright">© 2024 重庆电子科技职业大学校园交易平台</text>
    </view>
  </view>
</template>

<script setup lang="ts">
function openLink(type: string) {
  switch (type) {
    case 'userAgreement':
      uni.navigateTo({ url: '/pages/user/agreement' })
      break
    case 'privacyPolicy':
      uni.navigateTo({ url: '/pages/user/privacy' })
      break
    case 'feedback':
      uni.navigateTo({ url: '/pages/user/feedback' })
      break
  }
}
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60rpx;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  background: #fff;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  text-align: center;
  margin-bottom: 12rpx;
}

.version {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.intro-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.intro-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.feature-section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.feature-item {
  width: 48%;
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.feature-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

.developer-section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.developer-info {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.developer-info:last-child {
  border-bottom: none;
}

.developer-name {
  font-size: 28rpx;
  color: #666;
}

.developer-detail {
  font-size: 28rpx;
  color: #333;
}

.links-section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.link-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.link-item:last-child {
  border-bottom: none;
}

.link-text {
  font-size: 28rpx;
  color: #333;
}

.link-arrow {
  font-size: 32rpx;
  color: #999;
}

.footer {
  text-align: center;
  padding: 40rpx 0;
}

.copyright {
  font-size: 22rpx;
  color: #999;
}
</style>
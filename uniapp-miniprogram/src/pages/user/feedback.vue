<template>
  <view class="feedback-container">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">反馈类型</text>
        <picker mode="selector" :range="feedbackTypes" @change="onTypeChange">
          <view class="picker-value">
            {{ feedbackTypes[selectedType] || '请选择反馈类型' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">联系方式</text>
        <input class="form-input" v-model="contact" placeholder="手机号或邮箱（选填）" />
      </view>

      <view class="form-item">
        <text class="form-label">反馈内容</text>
        <textarea class="form-textarea" v-model="content" placeholder="请详细描述您的问题或建议..." maxlength="500" />
        <text class="word-count">{{ content.length }}/500</text>
      </view>

      <view class="form-item">
        <text class="form-label">上传图片（选填）</text>
        <view class="image-list">
          <view class="image-item" v-for="(img, idx) in images" :key="idx">
            <image :src="img" mode="aspectFill" />
            <view class="image-remove" @click="removeImage(idx)">×</view>
          </view>
          <view class="image-add" v-if="images.length < 3" @click="chooseImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="submitFeedback">
      <text>提交反馈</text>
    </view>

    <view class="contact-section">
      <text class="contact-title">联系我们</text>
      <text class="contact-info">邮箱：support@campus-market.com</text>
      <text class="contact-info">电话：400-123-4567</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const feedbackTypes = ['功能建议', 'Bug反馈', '交易问题', '投诉建议', '其他']
const selectedType = ref(0)
const contact = ref('')
const content = ref('')
const images = ref<string[]>([])

function onTypeChange(e: any) {
  selectedType.value = e.detail.value
}

function chooseImage() {
  uni.chooseImage({
    count: 3 - images.value.length,
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

function submitFeedback() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }

  uni.showLoading({ title: '提交中...' })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '反馈提交成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.feedback-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.picker-value {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.form-input {
  height: 80rpx;
  padding: 0 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.form-textarea {
  width: 100%;
  height: 240rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 200rpx;
  height: 200rpx;
  position: relative;
  border-radius: 8rpx;
  overflow: hidden;

  image {
    width: 100%;
    height: 100%;
  }

  .image-remove {
    position: absolute;
    top: 0;
    right: 0;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.image-add {
  width: 200rpx;
  height: 200rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .add-icon {
    font-size: 60rpx;
    color: #999;
  }

  .add-text {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.submit-btn {
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.contact-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;

  .contact-title {
    display: block;
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .contact-info {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 10rpx;
  }
}
</style>
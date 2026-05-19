<template>
  <view class="line-publish-container">
    <view class="line-header-bar">
      <view class="line-back-btn" @click="goBack">
        <LineIcon name="arrow-left" />
      </view>
      <text class="line-header-title">发布商品</text>
      <view class="line-header-right">
        <view class="line-header-dot"></view>
      </view>
    </view>

    <scroll-view class="line-content-scroll" scroll-y>
      <view class="line-form-section">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>商品分类</text>
        </view>
        <picker mode="selector" :range="categoryLabels" @change="onCategoryChange">
          <view class="line-picker-input">
            <text class="line-picker-text">{{ selectedCategory || '请选择分类' }}</text>
            <LineIcon name="chevron-right" />
          </view>
        </picker>
      </view>

      <view class="line-form-section" v-if="form.category === 'BOOK'">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>书籍信息</text>
        </view>

        <picker mode="selector" :range="collegeOptions" @change="onCollegeChange">
          <view class="line-picker-input">
            <text class="line-picker-text">{{ form.college || '请选择学院' }}</text>
            <LineIcon name="chevron-right" />
          </view>
        </picker>

        <picker mode="selector" :range="majorOptions" @change="onMajorChange">
          <view class="line-picker-input">
            <text class="line-picker-text">{{ form.major || '请选择专业' }}</text>
            <LineIcon name="chevron-right" />
          </view>
        </picker>

        <picker mode="selector" :range="gradeOptions" @change="onGradeChange">
          <view class="line-picker-input">
            <text class="line-picker-text">{{ form.grade || '请选择年级' }}</text>
            <LineIcon name="chevron-right" />
          </view>
        </picker>

        <picker mode="selector" :range="semesterOptions" @change="onSemesterChange">
          <view class="line-picker-input">
            <text class="line-picker-text">{{ form.semester || '请选择学期' }}</text>
            <LineIcon name="chevron-right" />
          </view>
        </picker>

        <view class="line-input-wrapper">
          <input
            class="line-form-input"
            v-model="form.bookName"
            placeholder="请输入书名/一整套"
            placeholder-class="line-placeholder"
          />
          <view class="line-input-border"></view>
        </view>
      </view>

      <view class="line-form-section">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>商品名称</text>
        </view>
        <view class="line-input-wrapper">
          <input
            class="line-form-input"
            v-model="form.name"
            placeholder="请输入商品名称"
            placeholder-class="line-placeholder"
          />
          <view class="line-input-border"></view>
        </view>
      </view>

      <view class="line-form-section">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>商品描述</text>
        </view>
        <view class="line-textarea-wrapper">
          <textarea
            class="line-form-textarea"
            v-model="form.description"
            placeholder="请输入商品描述"
            placeholder-class="line-placeholder"
            :maxlength="500"
          />
          <view class="line-textarea-border"></view>
        </view>
        <text class="line-textarea-count">{{ form.description.length }}/500</text>
      </view>

      <view class="line-form-section">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>商品图片</text>
          <text class="line-title-note">（最多3张）</text>
        </view>
        <view class="line-upload-area">
          <view
            class="line-upload-item"
            v-for="(img, index) in images"
            :key="index"
          >
            <view class="line-upload-image-wrapper">
              <image class="line-upload-image" :src="img" mode="aspectFill" />
              <view class="line-upload-image-border"></view>
            </view>
            <view class="line-remove-btn" @click="removeImage(index)">
              <LineIcon name="close" />
            </view>
          </view>
          <view class="line-upload-btn" @click="chooseImage" v-if="images.length < 3">
            <view class="line-upload-icon-box">
              <LineIcon name="plus" />
            </view>
            <text class="line-upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <view class="line-form-section">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>发布金额</text>
        </view>
        <view class="line-price-input-wrapper">
          <text class="line-price-symbol">¥</text>
          <input
            class="line-price-input"
            v-model="form.price"
            placeholder="0"
            placeholder-class="line-placeholder"
            type="digit"
          />
          <view class="line-price-border"></view>
        </view>
      </view>

      <view class="line-form-section">
        <view class="line-section-title">
          <view class="line-title-line"></view>
          <text>交易地点</text>
        </view>
        <view class="line-location-input-wrapper">
          <view class="line-location-icon">
            <LineIcon name="location" />
          </view>
          <input
            class="line-location-input"
            v-model="form.location"
            placeholder="比如：北区食堂"
            placeholder-class="line-placeholder"
          />
          <view class="line-location-border"></view>
        </view>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>

    <view class="line-bottom-bar">
      <view class="line-submit-btn" :class="{ disabled: !canSubmit || submitting }" @click="handleSubmit">
        <text>{{ submitting ? '发布中...' : '发布商品' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createGoods, uploadImage } from '@/api/goods'
import LineIcon from '@/components/LineIcon.vue'

const categories = [
  { value: 'ELECTRONICS', label: '数码产品' },
  { value: 'CLOTHING', label: '服饰鞋包' },
  { value: 'BOOK', label: '图书教材' },
  { value: 'SPORTS', label: '运动户外' },
  { value: 'LIFE', label: '生活用品' },
  { value: 'OTHER', label: '其他' }
]
const categoryLabels = categories.map(c => c.label)

const collegeOptions = [
  '信息工程学院', '计算机学院', '电子学院', '软件学院',
  '机械学院', '电气学院', '经管学院', '外语学院', '其他学院'
]

const majorOptions = [
  '计算机科学与技术', '软件工程', '电子信息工程', '通信工程',
  '机械工程', '电气工程', '会计学', '市场营销', '其他专业'
]

const gradeOptions = ['2023', '2024', '2025', '2026']
const semesterOptions = ['上', '下']

const images = ref<string[]>([])
const submitting = ref(false)
const form = ref({
  name: '',
  description: '',
  category: '',
  price: '',
  college: '',
  major: '',
  bookName: '',
  grade: '',
  semester: '',
  location: ''
})

const selectedCategory = computed(() => {
  const cat = categories.find(c => c.value === form.value.category)
  return cat ? cat.label : ''
})

const canSubmit = computed(() => {
  const baseValid = images.value.length > 0 &&
         form.value.name &&
         form.value.description &&
         form.value.price &&
         form.value.category
  
  if (form.value.category === 'BOOK') {
    return baseValid &&
           form.value.college &&
           form.value.major &&
           form.value.bookName &&
           form.value.grade
  }
  
  return baseValid
})

function goBack() {
  uni.navigateBack()
}

function onCategoryChange(e: any) {
  const index = e.detail.value
  form.value.category = categories[index].value
  if (form.value.category !== 'BOOK') {
    form.value.college = ''
    form.value.major = ''
    form.value.bookName = ''
    form.value.grade = ''
  }
}

function onCollegeChange(e: any) {
  form.value.college = collegeOptions[e.detail.value]
}

function onMajorChange(e: any) {
  form.value.major = majorOptions[e.detail.value]
}

function onGradeChange(e: any) {
  form.value.grade = gradeOptions[e.detail.value]
}

function onSemesterChange(e: any) {
  form.value.semester = semesterOptions[e.detail.value]
}

function chooseImage() {
  uni.chooseImage({
    count: 3 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    uni.showLoading({ title: '发布中...' })

    const uploadedImages: string[] = []
    for (const img of images.value) {
      if (img.startsWith('http')) {
        uploadedImages.push(img)
      } else {
        const url = await uploadImage(img)
        if (url) {
          uploadedImages.push(url)
        }
      }
    }

    await createGoods({
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      images: uploadedImages,
      category: form.value.category,
      college: form.value.college || undefined,
      major: form.value.major || undefined,
      bookName: form.value.bookName || undefined,
      grade: form.value.grade || undefined,
      location: form.value.location || undefined
    })

    uni.hideLoading()
    uni.showToast({ title: '发布成功', icon: 'success' })

    setTimeout(() => {
      uni.navigateTo({ url: '/pages/goods/my-list' })
    }, 1500)
  } catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err?.message || '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-publish-container {
  min-height: 100vh;
  background-color: $line-bg;
  display: flex;
  flex-direction: column;
}

.line-content-scroll {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 200rpx;
}

.line-form-section {
  background-color: #fff;
  border: $line-normal solid $line-border;
  border-radius: $line-radius;
  padding: 32rpx;
  margin-bottom: 24rpx;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -6rpx;
    left: 24rpx;
    right: 24rpx;
    height: 6rpx;
    background: repeating-linear-gradient(
      90deg,
      $line-border 0rpx,
      $line-border 8rpx,
      transparent 8rpx,
      transparent 16rpx
    );
  }
}

.line-section-title {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.line-title-line {
  width: 4rpx;
  height: 28rpx;
  background-color: $line-accent;
  border-radius: 2rpx;
}

.line-title-note {
  font-size: $line-font-sm;
  color: $line-light;
  font-weight: 400;
}

.line-picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
  position: relative;
  transition: all 0.2s ease;
  
  &:active {
    border-color: $line-accent;
  }
}

.line-picker-text {
  font-size: $line-font-md;
  color: $line-primary;
}

.line-input-wrapper {
  position: relative;
  margin-bottom: 16rpx;
}

.line-form-input {
  width: 100%;
  height: 96rpx;
  font-size: $line-font-md;
  padding: 0 24rpx;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  color: $line-primary;
  background-color: #fff;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: $line-accent;
  }
}

.line-input-border {
  position: absolute;
  bottom: 0;
  left: 24rpx;
  right: 24rpx;
  height: 2rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-border 0rpx,
    $line-border 6rpx,
    transparent 6rpx,
    transparent 12rpx
  );
  opacity: 0;
  transition: opacity 0.2s ease;
  
  .line-form-input:focus + & {
    opacity: 1;
  }
}

.line-textarea-wrapper {
  position: relative;
}

.line-form-textarea {
  width: 100%;
  height: 240rpx;
  font-size: $line-font-md;
  padding: 20rpx;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  color: $line-primary;
  background-color: #fff;
  line-height: 1.6;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: $line-accent;
  }
}

.line-textarea-border {
  position: absolute;
  bottom: 0;
  left: 20rpx;
  right: 20rpx;
  height: 2rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-border 0rpx,
    $line-border 6rpx,
    transparent 6rpx,
    transparent 12rpx
  );
  opacity: 0;
  transition: opacity 0.2s ease;
  
  .line-form-textarea:focus + & {
    opacity: 1;
  }
}

.line-textarea-count {
  display: block;
  text-align: right;
  font-size: $line-font-sm;
  color: $line-light;
  margin-top: 12rpx;
}

.line-placeholder {
  color: $line-light;
}

.line-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.line-upload-item {
  position: relative;
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  border-radius: $line-radius-sm;
  overflow: hidden;
}

.line-upload-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.line-upload-image {
  width: 100%;
  height: 100%;
}

.line-upload-image-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  pointer-events: none;
}

.line-remove-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: #fff;
  border: $line-thin solid $line-danger;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $line-danger;
  z-index: 10;
}

.line-upload-btn {
  width: calc(33.33% - 12rpx);
  aspect-ratio: 1;
  border: $line-thin dashed $line-border;
  border-radius: $line-radius-sm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.2s ease;
  
  &:active {
    border-color: $line-accent;
    background-color: rgba(63, 55, 201, 0.05);
  }
}

.line-upload-icon-box {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $line-light;
}

.line-upload-text {
  font-size: $line-font-sm;
  color: $line-light;
  margin-top: 8rpx;
}

.line-price-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 24rpx;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  height: 96rpx;
}

.line-price-symbol {
  font-size: 36rpx;
  color: $line-accent;
  font-weight: 700;
  margin-right: 8rpx;
}

.line-price-input {
  flex: 1;
  height: 100%;
  font-size: 36rpx;
  font-weight: 700;
  color: $line-primary;
}

.line-price-border {
  position: absolute;
  bottom: 0;
  left: 24rpx;
  right: 24rpx;
  height: 2rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-accent 0rpx,
    $line-accent 8rpx,
    transparent 8rpx,
    transparent 16rpx
  );
  opacity: 0.5;
}

.line-location-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 24rpx;
  border: $line-thin solid $line-border;
  border-radius: $line-radius-sm;
  height: 96rpx;
}

.line-location-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $line-accent;
  margin-right: 12rpx;
}

.line-location-input {
  flex: 1;
  height: 100%;
  font-size: $line-font-md;
  color: $line-primary;
}

.line-location-border {
  position: absolute;
  bottom: 0;
  left: 24rpx;
  right: 24rpx;
  height: 2rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-accent 0rpx,
    $line-accent 8rpx,
    transparent 8rpx,
    transparent 16rpx
  );
  opacity: 0.5;
}

.line-bottom-space {
  height: 40rpx;
}

.line-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: $line-thin solid $line-border;
  z-index: 100;
}

.line-submit-btn {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: $line-normal solid $line-primary;
  border-radius: $line-radius;
  background-color: $line-primary;
  color: #fff;
  font-size: $line-font-lg;
  font-weight: 600;
  letter-spacing: 2rpx;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>

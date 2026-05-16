<template>
  <view class="container">
    <scroll-view class="content-scroll" scroll-y>
      <view class="form-section">
        <view class="section-title">
          <text>商品分类</text>
        </view>
        <picker mode="selector" :range="categoryLabels" @change="onCategoryChange">
          <view class="picker-input">
            {{ selectedCategory || '请选择分类' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-section" v-if="form.category === 'BOOK'">
        <view class="section-title">
          <text>书籍信息</text>
        </view>

        <picker mode="selector" :range="collegeOptions" @change="onCollegeChange">
          <view class="picker-input">
            {{ form.college || '请选择学院' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>

        <picker mode="selector" :range="majorOptions" @change="onMajorChange" style="margin-top: 20rpx;">
          <view class="picker-input">
            {{ form.major || '请选择专业' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>

        <picker mode="selector" :range="gradeOptions" @change="onGradeChange" style="margin-top: 20rpx;">
          <view class="picker-input">
            {{ form.grade || '请选择年级' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>

        <input
          class="form-input"
          v-model="form.bookName"
          placeholder="请输入书名"
          style="margin-top: 20rpx;"
        />
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>商品名称</text>
        </view>
        <input
          class="form-input"
          v-model="form.name"
          placeholder="请输入商品名称"
        />
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>商品描述</text>
        </view>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="请输入商品描述"
          :maxlength="500"
        />
        <text class="textarea-count">{{ form.description.length }}/500</text>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>商品图片 (最多3张)</text>
        </view>
        <view class="upload-area">
          <view
            class="upload-item"
            v-for="(img, index) in images"
            :key="index"
          >
            <image class="upload-image" :src="img" mode="aspectFill" />
            <view class="remove-btn" @click="removeImage(index)">
              <text>✕</text>
            </view>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="images.length < 3">
            <text class="upload-icon">+</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>发布金额</text>
        </view>
        <view class="form-input price-input-wrap">
          <text class="price-symbol">¥</text>
          <input
            class="price-input"
            v-model="form.price"
            placeholder="0"
            type="digit"
          />
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text>交易地点</text>
        </view>
        <view class="form-input location-input">
          <text class="location-icon">📍</text>
          <input
            class="location-text-input"
            v-model="form.location"
            placeholder="比如：北区食堂"
            placeholder-class="location-placeholder"
          />
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: !canSubmit || submitting }" @click="handleSubmit">
        <text>{{ submitting ? '发布中...' : '发布商品' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createGoods, uploadImage } from '@/api/goods'

const categories = [
  { value: 'ELECTRONICS', label: '电子产品' },
  { value: 'BEAUTY', label: '生活美妆' },
  { value: 'BOOK', label: '书籍' },
  { value: 'VIRTUAL', label: '虚拟物品' },
  { value: 'SPORTS', label: '运动户外' },
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

const gradeOptions = ['大一', '大二', '大三', '大四', '研究生', '其他']

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
@import '@/styles/variables.scss';

.container {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding: $spacing-md;
  padding-bottom: 180rpx;
}

.form-section {
  background-color: $bg-white;
  border-radius: $radius-xl;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  @include shadow-card;
  border: 2rpx solid rgba(102, 126, 234, 0.06);
}

.section-title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    width: 6rpx;
    height: 32rpx;
    @include gradient-primary;
    border-radius: $radius-full;
    margin-right: $spacing-sm;
  }
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96rpx;
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 0 $spacing-lg;
  font-size: $font-md;
  color: $text-primary;
  transition: all $transition-fast;
  
  &:active {
    background-color: darken($bg-color, 3%);
    transform: scale(0.99);
  }
}

.picker-arrow {
  font-size: $font-lg;
  color: $text-light;
  transition: transform $transition-fast;
}

.picker-input:active .picker-arrow {
  transform: rotate(90deg);
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.upload-item {
  position: relative;
  width: calc(33.33% - 16rpx);
  aspect-ratio: 1;
  border-radius: $radius-xl;
  overflow: hidden;
  @include shadow-sm;
  transition: all $transition-normal;
  
  &:active {
    transform: scale(0.95);
    @include shadow-card;
  }
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: $radius-xl;
}

.remove-btn {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  width: 52rpx;
  height: 52rpx;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.95) 0%, rgba(220, 53, 69, 0.95) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: $font-sm;
  font-weight: 600;
  box-shadow: 0 6rpx 16rpx rgba(231, 76, 60, 0.5);
  transition: all $transition-fast;
  animation: fadeIn 0.2s ease-out;
  
  &:active {
    transform: scale(0.85);
    box-shadow: 0 3rpx 8rpx rgba(231, 76, 60, 0.6);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.upload-btn {
  width: calc(33.33% - 16rpx);
  aspect-ratio: 1;
  border: 4rpx dashed rgba(102, 126, 234, 0.4);
  border-radius: $radius-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transition: all $transition-normal;
  
  &:active {
    border-color: $primary-color;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
    transform: scale(0.96);
    border-style: solid;
  }
  
  &:hover {
    border-color: $primary-color;
  }
}

.upload-icon {
  font-size: 64rpx;
  color: $primary-color;
  opacity: 0.7;
  line-height: 1;
  transition: all $transition-fast;
  
  .upload-btn:active & {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

.upload-text {
  font-size: $font-xs;
  color: $text-light;
  margin-top: $spacing-xs;
  transition: all $transition-fast;
  
  .upload-btn:active & {
    color: $primary-color;
  }
}

.form-input {
  width: 100%;
  height: 96rpx;
  font-size: $font-md;
  padding: 0 $spacing-lg;
  background-color: $bg-color;
  border-radius: $radius-lg;
  transition: all $transition-fast;
  
  &:focus {
    background-color: darken($bg-color, 2%);
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.15);
  }
}

.form-textarea {
  width: 100%;
  height: 240rpx;
  font-size: $font-md;
  padding: $spacing-md;
  background-color: $bg-color;
  border-radius: $radius-lg;
  transition: all $transition-fast;
  
  &:focus {
    background-color: darken($bg-color, 2%);
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.15);
  }
}

.textarea-count {
  display: block;
  text-align: right;
  font-size: $font-xs;
  color: $text-light;
  margin-top: $spacing-sm;
}

.price-input-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-symbol {
  font-size: 32rpx;
  color: $accent-color;
  font-weight: 700;
  margin-right: $spacing-xs;
}

.price-input {
  flex: 1;
  height: 96rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  text-align: left;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc($spacing-md + constant(safe-area-inset-bottom));
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 -8rpx 40rpx rgba(102, 126, 234, 0.1);
  border-top: 2rpx solid rgba(102, 126, 234, 0.06);
}

.submit-btn {
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  @include gradient-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: $font-lg;
  font-weight: 600;
  box-shadow: 0 12rpx 36rpx rgba(102, 126, 234, 0.4);
  transition: all $transition-fast;
  letter-spacing: 4rpx;
  
  &:active {
    transform: scale(0.97);
    box-shadow: 0 6rpx 18rpx rgba(102, 126, 234, 0.5);
  }
  
  &.disabled {
    opacity: 0.5;
    box-shadow: none;
    
    &:active {
      transform: none;
    }
  }
}

.form-placeholder {
  padding: $spacing-xl;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: $radius-lg;
  border: 2rpx dashed rgba(102, 126, 234, 0.2);
  text-align: center;
}

.placeholder-text {
  font-size: $font-sm;
  color: $text-light;
}

.location-input {
  display: flex;
  align-items: center;
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  transition: all $transition-fast;
  
  &:focus-within {
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.15);
    background-color: darken($bg-color, 2%);
  }
}

.location-icon {
  font-size: 40rpx;
  margin-right: $spacing-md;
}

.location-text-input {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
}

</style>

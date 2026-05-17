<template>
  <view class="container">
    <scroll-view class="content-scroll" scroll-y>
      <!-- 商品分类 -->
      <view class="form-section">
        <view class="section-title">
          <text>商品分类</text>
        </view>
        <picker mode="selector" :range="categoryOptions" range-key="label" @change="onCategoryChange">
          <view class="picker-input">
            {{ selectedCategoryLabel || '请选择分类' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 书籍特殊筛选（仅在选择书籍时显示） -->
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

        <picker mode="selector" :range="semesterOptions" @change="onSemesterChange" style="margin-top: 20rpx;">
          <view class="picker-input">
            {{ form.semester || '请选择学期' }}
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

      <!-- 商品名称 -->
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

      <!-- 商品描述 -->
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

      <!-- 商品图片 -->
      <view class="form-section">
        <view class="section-title">
          <text>商品图片 (最多6张)</text>
        </view>
        <view class="upload-area-wrapper">
          <view class="upload-area">
            <view 
              class="upload-item" 
              v-for="(img, index) in images" 
              :key="index"
            >
              <image class="upload-image" :src="getImageUrl(img)" mode="aspectFill" />
              <view class="remove-btn" @click="removeImage(index)">
                <text>✕</text>
              </view>
            </view>
            <view class="upload-btn" @click="chooseImage" v-if="images.length < 6">
              <text class="upload-icon">+</text>
              <text class="upload-text">添加图片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 价格 -->
      <view class="form-section">
        <view class="price-row">
          <view class="price-item" v-if="form.category === 'BOOK'">
            <text class="price-label">原价</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input 
                class="price-input" 
                v-model="form.originalPrice" 
                placeholder="0"
                type="digit"
              />
            </view>
          </view>
          <view class="price-item">
            <text class="price-label">售价</text>
            <view class="price-input-wrap">
              <text class="price-symbol">¥</text>
              <input 
                class="price-input" 
                v-model="form.price" 
                placeholder="0"
                type="digit"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="cancel-btn" @click="goBack">
        <text>取消</text>
      </view>
      <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
        <text>保存修改</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getGoodsDetail, updateGoods, uploadImage } from '@/api/goods'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const goodsId = ref('')

// 分类选项
const categories = [
  { value: 'ELECTRONICS', label: '数码产品' },
  { value: 'CLOTHING', label: '服饰鞋包' },
  { value: 'BOOK', label: '图书教材' },
  { value: 'SPORTS', label: '运动户外' },
  { value: 'LIFE', label: '生活用品' },
  { value: 'OTHER', label: '其他' }
]
const categoryOptions = categories.map(c => c.label)

// 学院选项
const collegeOptions = [
  '信息工程学院', '计算机学院', '电子学院', '软件学院', 
  '机械学院', '电气学院', '经管学院', '外语学院', '其他学院'
]

// 专业选项
const majorOptions = [
  '计算机科学与技术', '软件工程', '电子信息工程', '通信工程', 
  '机械工程', '电气工程', '会计学', '市场营销', '其他专业'
]

// 年级选项
const gradeOptions = ['2023', '2024', '2025', '2026']
// 学期选项
const semesterOptions = ['上', '下']

const images = ref<string[]>([])
const form = ref({
  name: '',
  description: '',
  category: '',
  originalPrice: '',
  price: '',
  college: '',
  major: '',
  bookName: '',
  grade: '',
  semester: ''
})

const selectedCategoryLabel = computed(() => {
  const cat = categories.find(c => c.value === form.value.category)
  return cat ? cat.label : ''
})

const canSubmit = computed(() => {
  return images.value.length > 0 &&
         form.value.name &&
         form.value.description &&
         form.value.price &&
         form.value.category
})

function getImageUrl(url?: string) {
  if (!url || url === '[]') return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `http://localhost:3000${url}`
  return url
}

async function loadGoodsDetail() {
  try {
    const result = await getGoodsDetail(goodsId.value)
    form.value = {
      name: result.name,
      description: result.description,
      category: result.category,
      originalPrice: result.originalPrice ? String(result.originalPrice) : '',
      price: String(result.price),
      college: result.college || '',
      major: result.major || '',
      bookName: result.bookName || '',
      grade: result.grade || ''
    }
    images.value = result.images || []
  } catch (err) {
    console.error('加载商品详情失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function onCategoryChange(e: any) {
  const index = e.detail.value
  form.value.category = categories[index].value
  // 重置书籍相关字段
  if (form.value.category !== 'BOOK') {
    form.value.college = ''
    form.value.major = ''
    form.value.bookName = ''
    form.value.grade = ''
    form.value.originalPrice = ''
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

async function chooseImage() {
  uni.chooseImage({
    count: 6 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uni.showLoading({ title: '上传中...' })
      try {
        for (const filePath of res.tempFilePaths) {
          const url = await uploadImage(filePath)
          images.value.push(url)
        }
      } catch (err) {
        uni.showToast({ title: '上传失败', icon: 'none' })
        console.error('上传失败', err)
      } finally {
        uni.hideLoading()
      }
    }
  })
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

async function handleSubmit() {
  if (!canSubmit.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })

  try {
    await updateGoods(goodsId.value, {
      name: form.value.name,
      description: form.value.description,
      category: form.value.category,
      originalPrice: form.value.originalPrice,
      price: form.value.price,
      images: images.value,
      college: form.value.college,
      major: form.value.major,
      bookName: form.value.bookName,
      grade: form.value.grade
    })

    uni.showToast({ title: '修改成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '修改失败', icon: 'none' })
    console.error('修改失败', err)
  } finally {
    uni.hideLoading()
  }
}

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  userStore.initFromStorage()
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  goodsId.value = options.id || ''
  
  if (!goodsId.value) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  loadGoodsDetail()
})
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

.upload-area-wrapper {
  display: flex;
  justify-content: center;
}

.upload-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
}

.upload-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: $radius-lg;
  overflow: hidden;
  @include shadow-sm;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: $radius-lg;
}

.remove-btn {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.9) 0%, rgba(220, 53, 69, 0.9) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: $font-sm;
  box-shadow: 0 4rpx 12rpx rgba(231, 76, 60, 0.4);
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.9);
  }
}

.upload-btn {
  aspect-ratio: 1;
  border: 4rpx dashed rgba(102, 126, 234, 0.3);
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  transition: all $transition-fast;
  
  &:active {
    border-color: $primary-color;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    transform: scale(0.98);
  }
}

.upload-icon {
  font-size: 72rpx;
  color: $primary-color;
  opacity: 0.6;
  line-height: 1;
}

.upload-text {
  font-size: $font-sm;
  color: $text-light;
  margin-top: $spacing-xs;
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
  padding: $spacing-md $spacing-lg;
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

.price-row {
  display: flex;
  justify-content: center;
  gap: $spacing-xl;
}

.price-item {
  flex: 1;
  max-width: 300rpx;
}

.price-label {
  display: block;
  font-size: $font-sm;
  color: $text-light;
  margin-bottom: $spacing-sm;
  text-align: center;
}

.price-input-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 0 $spacing-lg;
  height: 112rpx;
}

.price-symbol {
  font-size: 48rpx;
  color: $accent-color;
  font-weight: 700;
  margin-right: $spacing-xs;
}

.price-input {
  width: 160rpx;
  height: 112rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: $text-primary;
  text-align: center;
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
  display: flex;
  gap: $spacing-md;
}

.cancel-btn {
  flex: 1;
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  background-color: $bg-color;
  color: $text-secondary;
  border-radius: $radius-full;
  font-size: $font-md;
  font-weight: 600;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.97);
    background-color: darken($bg-color, 3%);
  }
}

.submit-btn {
  flex: 2;
  height: 104rpx;
  line-height: 104rpx;
  text-align: center;
  @include gradient-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: $font-md;
  font-weight: 600;
  box-shadow: 0 12rpx 36rpx rgba(102, 126, 234, 0.4);
  transition: all $transition-fast;
  
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
</style>

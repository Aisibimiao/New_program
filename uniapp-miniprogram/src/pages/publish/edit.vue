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
const gradeOptions = ['大一', '大二', '大三', '大四', '研究生', '其他']

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
  grade: ''
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
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding: 20rpx;
  padding-bottom: 160rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #333;
}

.picker-arrow {
  font-size: 40rpx;
  color: #ccc;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.remove-btn {
  position: absolute;
  top: -15rpx;
  right: -15rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #e74c3c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #ccc;
}

.upload-text {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 10rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  font-size: 30rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 30rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.textarea-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.price-row {
  display: flex;
  gap: 40rpx;
}

.price-item {
  flex: 1;
}

.price-label {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 15rpx;
}

.price-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: #333;
}

.price-input {
  flex: 1;
  height: 80rpx;
  font-size: 32rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn {
  flex: 2;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn.disabled {
  opacity: 0.5;
}
</style>

<template>
  <view class="order-pay-page">
    <view class="goods-card">
      <image class="goods-image" :src="firstImage" mode="aspectFill"></image>
      <view class="goods-info">
        <text class="goods-title">{{ order.goods?.title || '商品' }}</text>
        <text class="goods-price">¥{{ order.goods?.price || 0 }}</text>
      </view>
    </view>

    <view class="pay-section">
      <text class="section-title">支付方式</text>
      <view class="pay-method selected" @tap="payMethod = 'wechat'">
        <image class="wechat-icon" src="/static/images/wechat-pay.png" mode="aspectFit"></image>
        <text class="pay-method-name">微信支付</text>
        <text class="check-icon">✓</text>
      </view>
    </view>

    <view class="amount-section">
      <text class="amount-label">支付金额</text>
      <text class="amount-value">¥{{ order.goods?.price || 0 }}</text>
    </view>

    <button class="pay-btn" :loading="paying" @tap="handlePay">确认支付</button>

    <view class="tips">
      <text>点击确认支付即表示您同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onLoad } from '@/utils/prepack'
import { getOrderDetail, confirmOrder } from '@/api/order'
import { createWechatPay, getOrderStatus } from '@/api/pay'

const orderId = ref('')
const order = ref({})
const paying = ref(false)
const payMethod = ref('wechat')

const firstImage = computed(() => {
  const images = order.value.goods?.images
  if (Array.isArray(images) && images.length > 0) {
    return images[0]
  }
  return '/static/images/default-goods.png'
})

onLoad((options) => {
  if (options.orderId) {
    orderId.value = options.orderId
    loadOrderDetail()
  }
})

async function loadOrderDetail() {
  try {
    const res = await getOrderDetail(orderId.value)
    order.value = res.order || res
  } catch (err) {
    uni.showToast({ title: '获取订单失败', icon: 'none' })
  }
}

async function handlePay() {
  if (paying.value) return

  paying.value = true
  try {
    const res = await createWechatPay({ orderId: orderId.value })

    if (res.payData) {
      await wx.requestPayment({
        ...res.payData,
        success: async (payRes) => {
          uni.showToast({ title: '支付成功', icon: 'success' })
          await checkOrderStatus()
        },
        fail: (err) => {
          if (err.errMsg !== 'requestPayment:fail cancel') {
            uni.showToast({ title: '支付失败', icon: 'none' })
          }
        }
      })
    } else {
      uni.showToast({ title: res.msg || '支付参数获取失败', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: err.message || '支付失败', icon: 'none' })
  } finally {
    paying.value = false
  }
}

async function checkOrderStatus() {
  try {
    const res = await getOrderStatus(orderId.value)
    if (res.order?.status === 'COMPLETED') {
      uni.showToast({ title: '交易完成', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/order/detail?orderId=${orderId.value}` })
      }, 1500)
    }
  } catch (err) {
    console.error('检查订单状态失败:', err)
  }
}
</script>

<style scoped>
.order-pay-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.goods-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  margin-bottom: 20rpx;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
}

.goods-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-title {
  font-size: 28rpx;
  color: #333;
  lines: 2;
  overflow: hidden;
}

.goods-price {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.pay-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 24rpx;
  display: block;
}

.pay-method {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
}

.pay-method.selected {
  border-color: #07c160;
  background: #f0fff4;
}

.wechat-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
}

.pay-method-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.check-icon {
  color: #07c160;
  font-size: 32rpx;
}

.amount-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.amount-label {
  font-size: 28rpx;
  color: #666;
}

.amount-value {
  font-size: 48rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.pay-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #07c160 0%, #04b55e 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-btn:active {
  opacity: 0.9;
}

.tips {
  margin-top: 24rpx;
  text-align: center;
}

.tips text {
  font-size: 22rpx;
  color: #999;
}
</style>
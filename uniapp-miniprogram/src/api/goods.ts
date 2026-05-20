export interface Goods {
  _id: string
  title: string
  description: string
  price: number
  originalPrice: number
  images: string[]
  category: string
  status: number
  userId: string
  views: number
  createTime: any
  seller?: {
    _id: string
    nickname?: string
    avatar?: string
  }
}

export async function getGoods(params?: {
  page?: number
  limit?: number
  keyword?: string
  category?: string
}) {
  const pageNum = params?.page || 1
  const pageSize = params?.limit || 10
  
  try {
    const result = await uni.cloud.callFunction({
      name: 'getGoods',
      data: {
        page: pageNum,
        pageSize: pageSize,
        category: params?.category
      }
    })
    return result.result
  } catch (error) {
    return { success: false, message: '云函数调用失败', data: { list: [], total: 0, hasMore: false } }
  }
}

export async function getGoodsDetail(id: string) {
  try {
    const db = uni.cloud.database()
    const result = await db.collection('goods').doc(id).get()
    
    if (result.data.length === 0) {
      return { success: false, message: '商品不存在' }
    }
    
    // 获取卖家信息
    const seller = await db.collection('users').doc(result.data[0].userId).get()
    
    return {
      success: true,
      data: {
        ...result.data[0],
        seller: seller.data.length > 0 ? seller.data[0] : null
      }
    }
  } catch (error) {
    return { success: false, message: '获取商品失败' }
  }
}

export async function getMyGoods(params?: { page?: number; limit?: number }) {
  const user = uni.getStorageSync('user')
  if (!user) {
    return { success: false, message: '请先登录' }
  }
  
  const pageNum = params?.page || 1
  const pageSize = params?.limit || 10
  const skip = (pageNum - 1) * pageSize
  
  try {
    const db = uni.cloud.database()
    const result = await db.collection('goods')
      .where({ userId: user._id })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    
    const total = await db.collection('goods').where({ userId: user._id }).count()
    
    return {
      success: true,
      data: {
        list: result.data,
        total: total.total,
        hasMore: skip + pageSize < total.total
      }
    }
  } catch (error) {
    return { success: false, message: '获取商品失败' }
  }
}

export async function createGoods(data: {
  title: string
  description: string
  price: number | string
  originalPrice?: number | string
  images: string[]
  category: string
}) {
  const user = uni.getStorageSync('user')
  if (!user) {
    return { success: false, message: '请先登录' }
  }
  
  try {
    const result = await uni.cloud.callFunction({
      name: 'addGoods',
      data: {
        title: data.title,
        price: data.price,
        originalPrice: data.originalPrice || 0,
        description: data.description,
        images: data.images,
        category: data.category,
        userId: user._id
      }
    })
    return result.result
  } catch (error) {
    return { success: false, message: '创建商品失败' }
  }
}

export async function updateGoods(id: string, data: {
  title?: string
  description?: string
  price?: number | string
  originalPrice?: number | string
  images?: string[]
  category?: string
  status?: number
}) {
  try {
    const db = uni.cloud.database()
    const result = await db.collection('goods').doc(id).update({
      data: {
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        originalPrice: typeof data.originalPrice === 'string' ? parseFloat(data.originalPrice) : data.originalPrice
      }
    })
    return { success: result.stats.updated > 0 }
  } catch (error) {
    return { success: false, message: '更新失败' }
  }
}

export async function deleteGoods(id: string) {
  try {
    const db = uni.cloud.database()
    const result = await db.collection('goods').doc(id).remove()
    return { success: result.stats.removed > 0 }
  } catch (error) {
    return { success: false, message: '删除失败' }
  }
}

export function offShelfGoods(id: string) {
  return updateGoods(id, { status: 0 })
}

export async function uploadImage(filePath: string): Promise<string> {
  try {
    const result = await uni.cloud.uploadFile({
      cloudPath: 'goods/' + Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '.png',
      filePath: filePath
    })
    return result.fileID || ''
  } catch (err) {
    console.error('上传失败', err)
    return ''
  }
}

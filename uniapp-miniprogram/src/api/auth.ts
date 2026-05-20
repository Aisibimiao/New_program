export interface User {
  _id: string
  nickname: string
  avatar: string
  openid?: string
  phone?: string
}

export async function login() {
  try {
    const result = await uni.cloud.callFunction({
      name: 'login'
    })
    return result.result
  } catch (error) {
    return { success: false, message: '云函数调用失败' }
  }
}

export async function getProfile() {
  try {
    const result = await uni.cloud.callFunction({
      name: 'login'
    })
    return result.result
  } catch (error) {
    return { success: false, message: '云函数调用失败' }
  }
}

export async function updateProfile(data: {
  nickname?: string
  avatar?: string
}) {
  const userStore = uni.getStorageSync('user')
  if (!userStore) {
    return { success: false, message: '请先登录' }
  }
  
  try {
    const db = uni.cloud.database()
    const result = await db.collection('users').doc(userStore._id).update({
      data
    })
    return { success: result.stats.updated > 0 }
  } catch (error) {
    return { success: false, message: '更新失败' }
  }
}

export function logout() {
  uni.removeStorageSync('user')
  return { success: true }
}

export function register(data: {
  email: string
  password: string
  nickname: string
  code: string
}) {
  return login()
}

export function sendCode(email: string) {
  return { success: true }
}

export function wechatLogin(data: { 
  code: string 
  nickName?: string 
  avatarUrl?: string 
}) {
  return login()
}

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/api/auth'
import { login as apiLogin, register as apiRegister, getProfile, logout as apiLogout } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref('')

  function setUser(data: User) {
    user.value = data
  }

  function setToken(t: string) {
    token.value = t
    uni.setStorageSync('token', t)
  }

  function updateUser(data: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...data }
      uni.setStorageSync('user', JSON.stringify(user.value))
    }
  }

  async function login(email: string, password: string) {
    const result = await apiLogin({ email, password })
    setToken(result.token)
    setUser(result.user)
    uni.setStorageSync('user', JSON.stringify(result.user))
    return result
  }

  async function register(email: string, password: string, nickname: string, code: string) {
    const result = await apiRegister({ email, password, nickname, code })
    setToken(result.token)
    setUser(result.user)
    uni.setStorageSync('user', JSON.stringify(result.user))
    return result
  }

  async function fetchProfile() {
    const result = await getProfile()
    setUser(result)
    uni.setStorageSync('user', JSON.stringify(result))
    return result
  }

  function logout() {
    apiLogout()
    user.value = null
    token.value = ''
    uni.removeStorageSync('token')
    uni.removeStorageSync('user')
  }

  function initFromStorage() {
    const storedToken = uni.getStorageSync('token')
    const storedUser = uni.getStorageSync('user')
    if (storedToken) {
      token.value = storedToken
    }
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('解析用户信息失败')
      }
    }
  }

  return {
    user,
    token,
    login,
    register,
    fetchProfile,
    logout,
    initFromStorage,
    setUser,
    setToken,
    updateUser
  }
})
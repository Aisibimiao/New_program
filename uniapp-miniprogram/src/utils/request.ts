const baseURL = 'http://localhost:3000/api'
const imageBaseURL = 'http://localhost:3000'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
  showErrorToast?: boolean
}

interface ResponseData {
  code?: number
  msg?: string
  data?: any
  list?: any[]
  total?: number
  goods?: any
  user?: any
  token?: string
}

function showErrorToast(msg: string) {
  uni.showToast({
    title: msg,
    icon: 'none',
    duration: 2500
  })
}

export function request<T>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const requestUrl = baseURL + options.url
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header
    }
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    console.log(`[API请求] ${options.method || 'GET'} ${requestUrl}`, { data: options.data, hasToken: !!token })

    uni.request({
      url: requestUrl,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: options.timeout || 15000,
      success: (res) => {
        console.log(`[API响应] ${requestUrl}`, { statusCode: res.statusCode, data: res.data })
        const data = res.data as ResponseData
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (data.list !== undefined && data.total !== undefined) {
            resolve(data as T)
          } else if (data.data !== undefined) {
            resolve(data.data as T)
          } else if (data.goods !== undefined) {
            resolve(data.goods as T)
          } else if (data.user !== undefined && data.token !== undefined) {
            resolve({ user: data.user, token: data.token } as T)
          } else if (data.msg) {
            resolve(data as T)
          } else {
            resolve(data as T)
          }
        } else {
          console.error(`[API错误] ${requestUrl}`, { statusCode: res.statusCode, msg: data.msg })
          const errorMsg = data.msg || `请求失败 (${res.statusCode})`

          if (res.statusCode === 401) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('user')
            showErrorToast('登录已过期，请重新登录')
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/user/login' })
            }, 1500)
          } else if (res.statusCode === 403) {
            showErrorToast('暂无权限，请联系管理员')
          } else if (res.statusCode === 404) {
            showErrorToast('资源不存在')
          } else if (res.statusCode === 500) {
            showErrorToast('服务器内部错误，请稍后重试')
          } else if (options.showErrorToast !== false) {
            showErrorToast(errorMsg)
          }

          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        console.error(`[API网络错误] ${requestUrl}`, err)
        const errorMsg = err.errMsg || '网络请求失败'

        if (err.errMsg?.includes('timeout')) {
          showErrorToast('请求超时，请检查网络连接')
        } else if (err.errMsg?.includes('fail')) {
          showErrorToast('网络连接失败，请检查网络')
        } else if (options.showErrorToast !== false) {
          showErrorToast(errorMsg)
        }

        reject(new Error(errorMsg))
      }
    })
  })
}

export function uploadFile(url: string, filePath: string, name: string): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    uni.uploadFile({
      url: baseURL + url,
      filePath,
      name,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data) as ResponseData
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (data.data?.url) {
              resolve(data.data)
            } else if (data.goods?.images) {
              resolve({ url: data.goods.images[0] || '' })
            } else {
              resolve({ url: '' })
            }
          } else {
            reject(new Error(data.msg || '上传失败'))
          }
        } catch {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })
  })
}

const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23667EEA" width="400" height="300"/%3E%3Ctext fill="white" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E暂无图片%3C/text%3E%3C/svg%3E'

export function formatImageUrl(url?: string): string {
  if (!url || url === '[]' || url === 'null' || url === '') {
    return placeholderImage
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('data:image/')) {
    return url
  }
  if (url.startsWith('/')) {
    return `${imageBaseURL}${url}`
  }
  if (url.startsWith('uploads/') || url.startsWith('static/')) {
    return `${imageBaseURL}/${url}`
  }
  return `${imageBaseURL}/${url}`
}

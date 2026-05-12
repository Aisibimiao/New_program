const baseURL = 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
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
      timeout: options.timeout || 30000,
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
          if (res.statusCode === 401) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('user')
            uni.navigateTo({ url: '/pages/user/login' })
          }
          reject(new Error(data.msg || `请求失败 (${res.statusCode})`))
        }
      },
      fail: (err) => {
        console.error(`[API网络错误] ${requestUrl}`, err)
        reject(new Error(err.errMsg || '网络错误'))
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

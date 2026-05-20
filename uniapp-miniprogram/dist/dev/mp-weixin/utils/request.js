"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "http://47.236.64.92/api";
const imageBaseURL = "http://47.236.64.92";
function showErrorToast(msg) {
  common_vendor.index.showToast({
    title: msg,
    icon: "none",
    duration: 2500
  });
}
function request(options) {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    const requestUrl = baseURL + options.url;
    const header = {
      "Content-Type": "application/json",
      ...options.header
    };
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
    console.log(`[API请求] ${options.method || "GET"} ${requestUrl}`, { data: options.data, hasToken: !!token });
    common_vendor.index.request({
      url: requestUrl,
      method: options.method || "GET",
      data: options.data,
      header,
      timeout: options.timeout || 15e3,
      success: (res) => {
        console.log(`[API响应] ${requestUrl}`, { statusCode: res.statusCode, data: res.data });
        const data = res.data;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (data.list !== void 0 && data.total !== void 0) {
            resolve(data);
          } else if (data.data !== void 0) {
            resolve(data.data);
          } else if (data.goods !== void 0) {
            resolve(data.goods);
          } else if (data.user !== void 0 && data.token !== void 0) {
            resolve({ user: data.user, token: data.token });
          } else if (data.msg) {
            resolve(data);
          } else {
            resolve(data);
          }
        } else {
          console.error(`[API错误] ${requestUrl}`, { statusCode: res.statusCode, msg: data.msg });
          const errorMsg = data.msg || `请求失败 (${res.statusCode})`;
          if (res.statusCode === 401) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("user");
            showErrorToast("登录已过期，请重新登录");
            setTimeout(() => {
              common_vendor.index.redirectTo({ url: "/pages/user/login" });
            }, 1500);
          } else if (res.statusCode === 403) {
            showErrorToast("暂无权限，请联系管理员");
          } else if (res.statusCode === 404) {
            showErrorToast("资源不存在");
          } else if (res.statusCode === 500) {
            showErrorToast("服务器内部错误，请稍后重试");
          } else if (options.showErrorToast !== false) {
            showErrorToast(errorMsg);
          }
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        var _a, _b;
        console.error(`[API网络错误] ${requestUrl}`, err);
        const errorMsg = err.errMsg || "网络请求失败";
        if ((_a = err.errMsg) == null ? void 0 : _a.includes("timeout")) {
          showErrorToast("请求超时，请检查网络连接");
        } else if ((_b = err.errMsg) == null ? void 0 : _b.includes("fail")) {
          showErrorToast("网络连接失败，请检查网络");
        } else if (options.showErrorToast !== false) {
          showErrorToast(errorMsg);
        }
        reject(new Error(errorMsg));
      }
    });
  });
}
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23667EEA" width="400" height="300"/%3E%3Ctext fill="white" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E暂无图片%3C/text%3E%3C/svg%3E';
function formatImageUrl(url) {
  if (!url || url === "[]" || url === "null" || url === "") {
    return placeholderImage;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("data:image/")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${imageBaseURL}${url}`;
  }
  if (url.startsWith("uploads/") || url.startsWith("static/")) {
    return `${imageBaseURL}/${url}`;
  }
  return `${imageBaseURL}/${url}`;
}
exports.formatImageUrl = formatImageUrl;
exports.request = request;

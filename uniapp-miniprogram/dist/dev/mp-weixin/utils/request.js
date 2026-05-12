"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "http://localhost:3000/api";
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
      timeout: options.timeout || 3e4,
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
          if (res.statusCode === 401) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("user");
            common_vendor.index.navigateTo({ url: "/pages/user/login" });
          }
          reject(new Error(data.msg || `请求失败 (${res.statusCode})`));
        }
      },
      fail: (err) => {
        console.error(`[API网络错误] ${requestUrl}`, err);
        reject(new Error(err.errMsg || "网络错误"));
      }
    });
  });
}
function uploadFile(url, filePath, name) {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.uploadFile({
      url: baseURL + url,
      filePath,
      name,
      header: {
        "Authorization": `Bearer ${token}`
      },
      success: (res) => {
        var _a, _b;
        try {
          const data = JSON.parse(res.data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if ((_a = data.data) == null ? void 0 : _a.url) {
              resolve(data.data);
            } else if ((_b = data.goods) == null ? void 0 : _b.images) {
              resolve({ url: data.goods.images[0] || "" });
            } else {
              resolve({ url: "" });
            }
          } else {
            reject(new Error(data.msg || "上传失败"));
          }
        } catch {
          reject(new Error("解析响应失败"));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "上传失败"));
      }
    });
  });
}
exports.request = request;
exports.uploadFile = uploadFile;

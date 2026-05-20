"use strict";
const common_vendor = require("../common/vendor.js");
async function login() {
  try {
    const result = await common_vendor.index.cloud.callFunction({
      name: "login"
    });
    return result.result;
  } catch (error) {
    return { success: false, message: "云函数调用失败" };
  }
}
async function getProfile() {
  try {
    const result = await common_vendor.index.cloud.callFunction({
      name: "login"
    });
    return result.result;
  } catch (error) {
    return { success: false, message: "云函数调用失败" };
  }
}
function logout() {
  common_vendor.index.removeStorageSync("user");
  return { success: true };
}
function register(data) {
  return login();
}
function wechatLogin(data) {
  return login();
}
exports.getProfile = getProfile;
exports.login = login;
exports.logout = logout;
exports.register = register;
exports.wechatLogin = wechatLogin;

"use strict";
const common_vendor = require("../common/vendor.js");
const api_auth = require("../api/auth.js");
const useUserStore = common_vendor.defineStore("user", () => {
  const user = common_vendor.ref(null);
  const token = common_vendor.ref("");
  function setUser(data) {
    user.value = data;
  }
  function setToken(t) {
    token.value = t;
    common_vendor.index.setStorageSync("token", t);
  }
  function updateUser(data) {
    if (user.value) {
      user.value = { ...user.value, ...data };
      common_vendor.index.setStorageSync("user", JSON.stringify(user.value));
    }
  }
  async function login(email, password) {
    const result = await api_auth.login({ email, password });
    setToken(result.token);
    setUser(result.user);
    common_vendor.index.setStorageSync("user", JSON.stringify(result.user));
    return result;
  }
  async function register(email, password, nickname, code) {
    const result = await api_auth.register({ email, password, nickname, code });
    setToken(result.token);
    setUser(result.user);
    common_vendor.index.setStorageSync("user", JSON.stringify(result.user));
    return result;
  }
  async function wechatLogin(code, nickName, avatarUrl) {
    const result = await api_auth.wechatLogin({ code, nickName, avatarUrl });
    setToken(result.token);
    setUser(result.user);
    common_vendor.index.setStorageSync("user", JSON.stringify(result.user));
    return result;
  }
  async function fetchProfile() {
    const result = await api_auth.getProfile();
    setUser(result);
    common_vendor.index.setStorageSync("user", JSON.stringify(result));
    return result;
  }
  function logout() {
    api_auth.logout();
    user.value = null;
    token.value = "";
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("user");
  }
  function initFromStorage() {
    const storedToken = common_vendor.index.getStorageSync("token");
    const storedUser = common_vendor.index.getStorageSync("user");
    if (storedToken) {
      token.value = storedToken;
    }
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error("解析用户信息失败");
      }
    }
  }
  return {
    user,
    token,
    login,
    register,
    wechatLogin,
    fetchProfile,
    logout,
    initFromStorage,
    setUser,
    setToken,
    updateUser
  };
});
exports.useUserStore = useUserStore;

"use strict";
const utils_request = require("../utils/request.js");
function login(data) {
  return utils_request.request({
    url: "/auth/login",
    method: "POST",
    data: { account: data.email, password: data.password }
  });
}
function register(data) {
  return utils_request.request({
    url: "/auth/register",
    method: "POST",
    data
  });
}
function getProfile() {
  return utils_request.request({
    url: "/auth/profile",
    method: "GET"
  });
}
function logout() {
  return utils_request.request({
    url: "/auth/logout",
    method: "POST"
  });
}
function wechatLogin(data) {
  return utils_request.request({
    url: "/auth/wechat-login",
    method: "POST",
    data
  });
}
exports.getProfile = getProfile;
exports.login = login;
exports.logout = logout;
exports.register = register;
exports.wechatLogin = wechatLogin;

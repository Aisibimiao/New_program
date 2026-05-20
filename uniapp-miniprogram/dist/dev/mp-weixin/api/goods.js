"use strict";
const utils_request = require("../utils/request.js");
function getGoods(params) {
  return utils_request.request({
    url: "/goods",
    method: "GET",
    data: params
  });
}
function getMyGoods(params) {
  return utils_request.request({
    url: "/goods/my/list",
    method: "GET",
    data: params
  });
}
function getGoodsDetail(id) {
  return utils_request.request({
    url: `/goods/${id}`,
    method: "GET"
  });
}
function createGoods(data) {
  return utils_request.request({
    url: "/goods",
    method: "POST",
    data
  });
}
function updateGoods(id, data) {
  return utils_request.request({
    url: `/goods/${id}`,
    method: "PUT",
    data
  });
}
function deleteGoods(id) {
  return utils_request.request({
    url: `/goods/${id}`,
    method: "DELETE"
  });
}
function offShelfGoods(id) {
  return updateGoods(id, { status: 0 });
}
async function uploadImage(filePath) {
  var _a;
  try {
    const result = await utils_request.uploadFile("/goods/upload", filePath, "file");
    return result.url || ((_a = result.data) == null ? void 0 : _a.url) || "";
  } catch (err) {
    console.error("上传失败", err);
    return "";
  }
}
exports.createGoods = createGoods;
exports.deleteGoods = deleteGoods;
exports.getGoods = getGoods;
exports.getGoodsDetail = getGoodsDetail;
exports.getMyGoods = getMyGoods;
exports.offShelfGoods = offShelfGoods;
exports.updateGoods = updateGoods;
exports.uploadImage = uploadImage;

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
async function uploadImage(filePath) {
  const result = await utils_request.uploadFile("/goods/upload", filePath, "file");
  return result.url;
}
exports.createGoods = createGoods;
exports.getGoods = getGoods;
exports.getGoodsDetail = getGoodsDetail;
exports.getMyGoods = getMyGoods;
exports.uploadImage = uploadImage;

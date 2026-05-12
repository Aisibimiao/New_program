"use strict";
const utils_request = require("../utils/request.js");
function addFavorite(goodsId) {
  return utils_request.request({
    url: "/favorites",
    method: "POST",
    data: { goodsId }
  });
}
function removeFavorite(goodsId) {
  return utils_request.request({
    url: `/favorites/${goodsId}`,
    method: "DELETE"
  });
}
function getFavorites() {
  return utils_request.request({
    url: "/favorites",
    method: "GET"
  });
}
exports.addFavorite = addFavorite;
exports.getFavorites = getFavorites;
exports.removeFavorite = removeFavorite;

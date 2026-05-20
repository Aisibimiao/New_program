"use strict";
const utils_request = require("../utils/request.js");
function createOrder(data) {
  return utils_request.request({
    url: "/orders",
    method: "POST",
    data
  });
}
function getBuyOrders() {
  return utils_request.request({
    url: "/orders/buy",
    method: "GET"
  });
}
function getSellOrders() {
  return utils_request.request({
    url: "/orders/sell",
    method: "GET"
  });
}
function confirmOrder(orderId) {
  return utils_request.request({
    url: `/orders/${orderId}/confirm`,
    method: "PUT"
  });
}
function shipOrder(orderId) {
  return utils_request.request({
    url: `/orders/${orderId}/ship`,
    method: "PUT"
  });
}
function receiveOrder(orderId) {
  return utils_request.request({
    url: `/orders/${orderId}/receive`,
    method: "PUT"
  });
}
function cancelOrder(orderId) {
  return utils_request.request({
    url: `/orders/${orderId}/cancel`,
    method: "PUT"
  });
}
function getOrderDetail(orderId) {
  return utils_request.request({
    url: `/orders/${orderId}`,
    method: "GET"
  });
}
exports.cancelOrder = cancelOrder;
exports.confirmOrder = confirmOrder;
exports.createOrder = createOrder;
exports.getBuyOrders = getBuyOrders;
exports.getOrderDetail = getOrderDetail;
exports.getSellOrders = getSellOrders;
exports.receiveOrder = receiveOrder;
exports.shipOrder = shipOrder;

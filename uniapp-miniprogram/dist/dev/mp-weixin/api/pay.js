"use strict";
const utils_request = require("../utils/request.js");
function createWechatPay(orderId) {
  return utils_request.request({
    url: "/pay/wechat",
    method: "POST",
    data: { orderId }
  });
}
exports.createWechatPay = createWechatPay;

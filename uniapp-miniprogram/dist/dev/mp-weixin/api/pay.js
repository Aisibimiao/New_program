"use strict";
const utils_request = require("../utils/request.js");
function createWechatPay(data) {
  return utils_request.request({
    url: "/pay/wechat",
    method: "POST",
    data
  });
}
exports.createWechatPay = createWechatPay;

"use strict";
const utils_request = require("../utils/request.js");
function getMessages(goodsId, otherId) {
  return utils_request.request({
    url: "/chat/messages",
    method: "GET",
    data: { goodsId, otherId }
  });
}
function sendMessage(data) {
  return utils_request.request({
    url: "/chat/send",
    method: "POST",
    data
  });
}
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;

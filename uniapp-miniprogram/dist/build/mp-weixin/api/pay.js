"use strict";const e=require("../utils/request.js");exports.createWechatPay=function(t){return e.request({url:"/pay/wechat",method:"POST",data:{orderId:t}})};

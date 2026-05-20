"use strict";
const common_vendor = require("../common/vendor.js");
async function getGoods(params) {
  const pageNum = (params == null ? void 0 : params.page) || 1;
  const pageSize = (params == null ? void 0 : params.limit) || 10;
  try {
    const result = await common_vendor.index.cloud.callFunction({
      name: "getGoods",
      data: {
        page: pageNum,
        pageSize,
        category: params == null ? void 0 : params.category
      }
    });
    return result.result;
  } catch (error) {
    return { success: false, message: "云函数调用失败", data: { list: [], total: 0, hasMore: false } };
  }
}
async function getGoodsDetail(id) {
  try {
    const db = common_vendor.index.cloud.database();
    const result = await db.collection("goods").doc(id).get();
    if (result.data.length === 0) {
      return { success: false, message: "商品不存在" };
    }
    const seller = await db.collection("users").doc(result.data[0].userId).get();
    return {
      success: true,
      data: {
        ...result.data[0],
        seller: seller.data.length > 0 ? seller.data[0] : null
      }
    };
  } catch (error) {
    return { success: false, message: "获取商品失败" };
  }
}
async function getMyGoods(params) {
  const user = common_vendor.index.getStorageSync("user");
  if (!user) {
    return { success: false, message: "请先登录" };
  }
  const pageNum = 1;
  const pageSize = 10;
  const skip = (pageNum - 1) * pageSize;
  try {
    const db = common_vendor.index.cloud.database();
    const result = await db.collection("goods").where({ userId: user._id }).orderBy("createTime", "desc").skip(skip).limit(pageSize).get();
    const total = await db.collection("goods").where({ userId: user._id }).count();
    return {
      success: true,
      data: {
        list: result.data,
        total: total.total,
        hasMore: skip + pageSize < total.total
      }
    };
  } catch (error) {
    return { success: false, message: "获取商品失败" };
  }
}
async function createGoods(data) {
  const user = common_vendor.index.getStorageSync("user");
  if (!user) {
    return { success: false, message: "请先登录" };
  }
  try {
    const result = await common_vendor.index.cloud.callFunction({
      name: "addGoods",
      data: {
        title: data.title,
        price: data.price,
        originalPrice: data.originalPrice || 0,
        description: data.description,
        images: data.images,
        category: data.category,
        userId: user._id
      }
    });
    return result.result;
  } catch (error) {
    return { success: false, message: "创建商品失败" };
  }
}
async function updateGoods(id, data) {
  try {
    const db = common_vendor.index.cloud.database();
    const result = await db.collection("goods").doc(id).update({
      data: {
        ...data,
        price: typeof data.price === "string" ? parseFloat(data.price) : data.price,
        originalPrice: typeof data.originalPrice === "string" ? parseFloat(data.originalPrice) : data.originalPrice
      }
    });
    return { success: result.stats.updated > 0 };
  } catch (error) {
    return { success: false, message: "更新失败" };
  }
}
async function deleteGoods(id) {
  try {
    const db = common_vendor.index.cloud.database();
    const result = await db.collection("goods").doc(id).remove();
    return { success: result.stats.removed > 0 };
  } catch (error) {
    return { success: false, message: "删除失败" };
  }
}
function offShelfGoods(id) {
  return updateGoods(id, { status: 0 });
}
async function uploadImage(filePath) {
  try {
    const result = await common_vendor.index.cloud.uploadFile({
      cloudPath: "goods/" + Date.now() + "-" + Math.random().toString(36).substr(2, 9) + ".png",
      filePath
    });
    return result.fileID || "";
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

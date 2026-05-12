"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const api_order = require("../../api/order.js");
const api_favorite = require("../../api/favorite.js");
const api_pay = require("../../api/pay.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const goods = common_vendor.ref(null);
    const collected = common_vendor.ref(false);
    const goodsId = common_vendor.ref("");
    const userStore = stores_user.useUserStore();
    const imagesArray = common_vendor.ref([]);
    function parseImages(images) {
      if (!images) return [];
      if (Array.isArray(images)) return images;
      if (typeof images === "string" && images.startsWith("[")) {
        try {
          return JSON.parse(images);
        } catch {
          return [];
        }
      }
      return [];
    }
    function getImageUrl(url) {
      if (!url) return "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20image%20placeholder&image_size=square";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function getConditionText(condition) {
      const map = {
        1: "全新",
        2: "几乎全新",
        3: "轻微使用",
        4: "明显使用"
      };
      return map[condition || 0] || "其他";
    }
    function formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
    function goToChat() {
      var _a, _b, _c, _d, _e;
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "使用聊天功能需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/chat/index?goodsId=${(_a = goods.value) == null ? void 0 : _a.id}&goodsName=${encodeURIComponent(((_b = goods.value) == null ? void 0 : _b.name) || "")}&otherId=${(_c = goods.value) == null ? void 0 : _c.userId}&otherAvatar=${encodeURIComponent(((_e = (_d = goods.value) == null ? void 0 : _d.seller) == null ? void 0 : _e.avatar) || "")}`
      });
    }
    async function collect() {
      var _a, _b, _c, _d;
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "收藏商品需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            }
          }
        });
        return;
      }
      try {
        if (collected.value) {
          await api_favorite.removeFavorite(((_b = (_a = goods.value) == null ? void 0 : _a.id) == null ? void 0 : _b.toString()) || "");
          collected.value = false;
          common_vendor.index.showToast({ title: "取消收藏", icon: "success" });
        } else {
          await api_favorite.addFavorite(((_d = (_c = goods.value) == null ? void 0 : _c.id) == null ? void 0 : _d.toString()) || "");
          collected.value = true;
          common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
        }
      } catch (err) {
        common_vendor.index.showToast({ title: err.message || "操作失败", icon: "none" });
      }
    }
    function goToContactSeller() {
      var _a;
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "联系卖家需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.makePhoneCall({
        phoneNumber: ((_a = goods.value) == null ? void 0 : _a.contact) || "10086",
        fail: () => {
          common_vendor.index.showToast({ title: "暂无联系方式", icon: "none" });
        }
      });
    }
    function handleShare() {
      var _a;
      const shareUrl = `http://localhost:5173/goods/${(_a = goods.value) == null ? void 0 : _a.id}`;
      common_vendor.index.showActionSheet({
        itemList: ["复制链接", "分享给朋友"],
        success: (res) => {
          if (res.tapIndex === 0) {
            common_vendor.index.setClipboardData({
              data: shareUrl,
              success: () => {
                common_vendor.index.showToast({ title: "链接已复制", icon: "success" });
              }
            });
          } else if (res.tapIndex === 1) {
            common_vendor.index.showToast({ title: "分享功能开发中", icon: "none" });
          }
        }
      });
    }
    async function checkFavoriteStatus() {
      if (!userStore.token) return;
      try {
        const favorites = await api_favorite.getFavorites();
        collected.value = favorites.some((fav) => fav.goodsId === goodsId.value);
      } catch (err) {
        console.error("检查收藏状态失败", err);
      }
    }
    async function buyNow() {
      var _a, _b;
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "购买商品需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认购买",
        content: `确定要购买「${(_a = goods.value) == null ? void 0 : _a.name}」吗？价格：¥${(_b = goods.value) == null ? void 0 : _b.price}`,
        success: async (res) => {
          var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "处理中..." });
            try {
              const orderResult = await api_order.createOrder({ goodsId: ((_b2 = (_a2 = goods.value) == null ? void 0 : _a2.id) == null ? void 0 : _b2.toString()) || "" });
              const orderId = ((_c = orderResult.order) == null ? void 0 : _c.id) || ((_e = (_d = orderResult.data) == null ? void 0 : _d.order) == null ? void 0 : _e.id) || "";
              if (orderId) {
                const payResult = await api_pay.createWechatPay(orderId);
                common_vendor.index.hideLoading();
                common_vendor.index.requestPayment({
                  provider: "wxpay",
                  timeStamp: ((_f = payResult.payData) == null ? void 0 : _f.timestamp) || "",
                  nonceStr: ((_g = payResult.payData) == null ? void 0 : _g.noncestr) || "",
                  package: ((_h = payResult.payData) == null ? void 0 : _h.package) || "",
                  signType: "MD5",
                  paySign: ((_i = payResult.payData) == null ? void 0 : _i.sign) || "",
                  success: () => {
                    common_vendor.index.showToast({ title: "支付成功", icon: "success" });
                    setTimeout(() => {
                      common_vendor.index.navigateBack();
                    }, 1500);
                  },
                  fail: (err) => {
                    common_vendor.index.showToast({ title: err.errMsg || "支付失败", icon: "none" });
                  }
                });
              } else {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({ title: "下单成功", icon: "success" });
                setTimeout(() => {
                  common_vendor.index.navigateBack();
                }, 1500);
              }
            } catch (err) {
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({ title: err.message || "操作失败", icon: "none" });
            }
          }
        }
      });
    }
    async function loadData() {
      try {
        const goodsResult = await api_goods.getGoodsDetail(goodsId.value);
        goods.value = goodsResult;
        imagesArray.value = parseImages(goodsResult == null ? void 0 : goodsResult.images);
        await checkFavoriteStatus();
      } catch (err) {
        console.error("加载数据失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    }
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.id) {
        goodsId.value = options.id;
      }
    });
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      if (goodsId.value) {
        loadData();
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      return {
        a: common_vendor.f(imagesArray.value, (img, index, i0) => {
          return {
            a: getImageUrl(img),
            b: index
          };
        }),
        b: common_vendor.t((_a = goods.value) == null ? void 0 : _a.price),
        c: common_vendor.t((_b = goods.value) == null ? void 0 : _b.originalPrice),
        d: common_vendor.t((_c = goods.value) == null ? void 0 : _c.name),
        e: common_vendor.t((_d = goods.value) == null ? void 0 : _d.description),
        f: common_vendor.t((_e = goods.value) == null ? void 0 : _e.category),
        g: common_vendor.t(getConditionText((_f = goods.value) == null ? void 0 : _f.condition)),
        h: common_vendor.t(formatDate((_g = goods.value) == null ? void 0 : _g.createdAt)),
        i: getImageUrl((_i = (_h = goods.value) == null ? void 0 : _h.seller) == null ? void 0 : _i.avatar),
        j: common_vendor.t(((_k = (_j = goods.value) == null ? void 0 : _j.seller) == null ? void 0 : _k.nickname) || ((_m = (_l = goods.value) == null ? void 0 : _l.seller) == null ? void 0 : _m.name) || "用户"),
        k: common_vendor.t(((_o = (_n = goods.value) == null ? void 0 : _n.seller) == null ? void 0 : _o.role) === "admin" ? "管理员" : "普通用户"),
        l: common_vendor.o(goToChat),
        m: common_vendor.t(collected.value ? "❤️" : "🤍"),
        n: common_vendor.t(collected.value ? "已收藏" : "收藏"),
        o: common_vendor.o(collect),
        p: common_vendor.o(handleShare),
        q: common_vendor.o(goToContactSeller),
        r: common_vendor.o(buyNow)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f4ccafb"]]);
wx.createPage(MiniProgramPage);

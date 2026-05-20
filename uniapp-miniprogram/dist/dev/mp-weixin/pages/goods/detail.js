"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const api_order = require("../../api/order.js");
const api_favorite = require("../../api/favorite.js");
const api_pay = require("../../api/pay.js");
const stores_user = require("../../stores/user.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const goods = common_vendor.ref(null);
    const collected = common_vendor.ref(false);
    const goodsId = common_vendor.ref("");
    const userStore = stores_user.useUserStore();
    const isFromFavorite = common_vendor.ref(false);
    const isSold = common_vendor.computed(() => {
      var _a, _b;
      return ((_a = goods.value) == null ? void 0 : _a.status) === "SOLD" || ((_b = goods.value) == null ? void 0 : _b.status) === 0;
    });
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
    function getCategoryText(category) {
      const map = {
        "ELECTRONICS": "数码产品",
        "CLOTHING": "服饰鞋包",
        "BOOKS": "图书教材",
        "SPORTS": "运动户外",
        "LIFE": "生活用品",
        "OTHER": "其他"
      };
      return map[category || ""] || category || "未分类";
    }
    function getImageUrl(url) {
      if (!url) return "https://api.dicebear.com/9.x/initials/png?seed=Goods&backgroundColor=e2e8f0";
      return utils_request.formatImageUrl(url);
    }
    function handleImageError(e) {
      const image = e.target;
      image.src = utils_request.formatImageUrl("");
    }
    function formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
    function goBack() {
      common_vendor.index.navigateBack();
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
        url: `/pages/chat/index?goodsId=${(_a = goods.value) == null ? void 0 : _a.id}&goodsName=${encodeURIComponent(((_b = goods.value) == null ? void 0 : _b.name) || "")}&otherId=${(_c = goods.value) == null ? void 0 : _c.userId}&otherAvatar=${encodeURIComponent(((_e = (_d = goods.value) == null ? void 0 : _d.seller) == null ? void 0 : _e.avatar) || "https://api.dicebear.com/9.x/initials/svg?seed=Seller&backgroundColor=b6e3f4")}`
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
          common_vendor.index.showToast({ title: "取消收藏", icon: "none" });
        } else {
          await api_favorite.addFavorite(((_d = (_c = goods.value) == null ? void 0 : _c.id) == null ? void 0 : _d.toString()) || "");
          collected.value = true;
          common_vendor.index.showToast({ title: "收藏成功", icon: "none" });
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
                common_vendor.index.showToast({ title: "链接已复制", icon: "none" });
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
      if (isSold.value && !isFromFavorite.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "该商品已售出，仅可查看详情",
          showCancel: false
        });
        return;
      }
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
                    common_vendor.index.showToast({ title: "支付成功", icon: "none" });
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
                common_vendor.index.showToast({ title: "下单成功", icon: "none" });
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
      if ((options == null ? void 0 : options.from) === "favorite") {
        isFromFavorite.value = true;
      }
    });
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      if (goodsId.value) {
        loadData();
      }
    });
    common_vendor.onShow(() => {
      if (goodsId.value) {
        loadData();
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      return common_vendor.e({
        a: common_vendor.p({
          name: "arrow-left"
        }),
        b: common_vendor.o(goBack),
        c: getImageUrl((_b = (_a = goods.value) == null ? void 0 : _a.images) == null ? void 0 : _b[0]),
        d: common_vendor.o(($event) => handleImageError($event)),
        e: isSold.value
      }, isSold.value ? {} : {}, {
        f: common_vendor.t((_c = goods.value) == null ? void 0 : _c.price),
        g: common_vendor.t((_d = goods.value) == null ? void 0 : _d.name),
        h: common_vendor.t((_e = goods.value) == null ? void 0 : _e.description),
        i: common_vendor.t(getCategoryText((_f = goods.value) == null ? void 0 : _f.category)),
        j: common_vendor.t(formatDate((_g = goods.value) == null ? void 0 : _g.createdAt)),
        k: common_vendor.p({
          name: "user"
        }),
        l: getImageUrl((_i = (_h = goods.value) == null ? void 0 : _h.seller) == null ? void 0 : _i.avatar),
        m: common_vendor.t(((_k = (_j = goods.value) == null ? void 0 : _j.seller) == null ? void 0 : _k.nickname) || ((_m = (_l = goods.value) == null ? void 0 : _l.seller) == null ? void 0 : _m.name) || "用户"),
        n: common_vendor.t(((_o = (_n = goods.value) == null ? void 0 : _n.seller) == null ? void 0 : _o.role) === "admin" ? "管理员" : "普通用户"),
        o: common_vendor.p({
          name: "chat"
        }),
        p: common_vendor.o(goToChat),
        q: common_vendor.p({
          name: "heart",
          active: collected.value
        }),
        r: common_vendor.t(collected.value ? "已收藏" : "收藏"),
        s: common_vendor.o(collect),
        t: common_vendor.p({
          name: "share"
        }),
        v: common_vendor.o(handleShare),
        w: common_vendor.o(goToContactSeller),
        x: common_vendor.t(isSold.value ? "已售出" : "立即购买"),
        y: isSold.value ? 1 : "",
        z: common_vendor.o(buyNow),
        A: isSold.value && !isFromFavorite.value ? 1 : ""
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f4ccafb"]]);
wx.createPage(MiniProgramPage);

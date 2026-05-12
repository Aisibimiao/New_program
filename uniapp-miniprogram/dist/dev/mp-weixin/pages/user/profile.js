"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_goods = require("../../api/goods.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "profile",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const user = common_vendor.ref(null);
    const stats = common_vendor.ref({
      goodsCount: 0,
      orderCount: 0
    });
    function getImageUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    async function loadUserData() {
      if (!userStore.token) return;
      try {
        const myGoods = await api_goods.getMyGoods();
        stats.value.goodsCount = Array.isArray(myGoods) ? myGoods.length : 0;
      } catch (err) {
        console.error("加载用户数据失败", err);
      }
    }
    function goToLogin() {
      common_vendor.index.navigateTo({ url: "/pages/user/login" });
    }
    function refreshUser() {
      userStore.initFromStorage();
      user.value = userStore.user;
      if (user.value) {
        loadUserData();
      }
    }
    function goToEdit() {
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "编辑资料需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/user/edit" });
    }
    function goToPublish() {
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "发布商品需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/publish/index" });
    }
    function goToMyGoods() {
      if (!userStore.token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/goods/my-list" });
    }
    function goToOrders() {
      if (!userStore.token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/order/list" });
    }
    function goToFavorites() {
      if (!userStore.token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/favorite/index" });
    }
    function goToSettings() {
      common_vendor.index.navigateTo({ url: "/pages/user/settings" });
    }
    function goToAbout() {
      common_vendor.index.showModal({
        title: "关于我们",
        content: "校园二手平台 v1.0\n\n让闲置物品找到新主人\n\n联系我们：support@campus-trade.com",
        showCancel: false
      });
    }
    function goToHome() {
      common_vendor.index.navigateTo({ url: "/pages/index/index" });
    }
    function goToGoods() {
      common_vendor.index.navigateTo({ url: "/pages/goods/list" });
    }
    function goToProfile() {
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            userStore.logout();
            user.value = null;
            stats.value = { goodsCount: 0, orderCount: 0 };
            common_vendor.index.showToast({ title: "退出成功", icon: "success" });
          }
        }
      });
    }
    common_vendor.onMounted(() => {
      refreshUser();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: user.value
      }, user.value ? {
        b: getImageUrl(user.value.avatar),
        c: common_vendor.t(user.value.nickname || user.value.name || "用户"),
        d: common_vendor.t(user.value.role === "ADMIN" ? "管理员" : "普通用户"),
        e: common_vendor.o(goToEdit)
      } : {
        f: common_vendor.o(goToLogin)
      }, {
        g: user.value
      }, user.value ? {
        h: common_vendor.t(stats.value.goodsCount),
        i: common_vendor.t(stats.value.orderCount)
      } : {}, {
        j: common_vendor.o(goToPublish),
        k: common_vendor.o(goToMyGoods),
        l: common_vendor.o(goToOrders),
        m: common_vendor.o(goToFavorites),
        n: common_vendor.o(goToSettings),
        o: common_vendor.o(goToAbout),
        p: user.value
      }, user.value ? {
        q: common_vendor.o(handleLogout)
      } : {}, {
        r: common_vendor.o(($event) => goToHome()),
        s: common_vendor.o(($event) => goToGoods()),
        t: common_vendor.o(($event) => goToProfile())
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f6b4f04d"]]);
wx.createPage(MiniProgramPage);

"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_goods = require("../../api/goods.js");
const api_order = require("../../api/order.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
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
      if (!url) return "https://api.dicebear.com/9.x/initials/svg?seed=User&backgroundColor=b6e3f4";
      return utils_request.formatImageUrl(url);
    }
    async function loadUserData() {
      if (!userStore.token) return;
      try {
        const myGoods = await api_goods.getMyGoods();
        stats.value.goodsCount = Array.isArray(myGoods) ? myGoods.length : 0;
      } catch (err) {
        console.error("加载商品数据失败", err);
        stats.value.goodsCount = 0;
      }
      try {
        const sellOrders = await api_order.getSellOrders();
        stats.value.orderCount = Array.isArray(sellOrders) ? sellOrders.length : 0;
      } catch (err) {
        console.error("加载订单数据失败", err);
        stats.value.orderCount = 0;
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
      common_vendor.index.navigateTo({ url: "/pages/user/about" });
    }
    function switchToHome() {
      common_vendor.index.reLaunch({ url: "/pages/index/index" });
    }
    function switchToPublish() {
      common_vendor.index.navigateTo({ url: "/pages/publish/index" });
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "退出后将无法同步收藏和发布记录，是否继续？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            userStore.logout();
            user.value = null;
            stats.value = { goodsCount: 0, orderCount: 0 };
            common_vendor.index.reLaunch({ url: "/pages/user/login" });
          }
        }
      });
    }
    common_vendor.onMounted(() => {
      refreshUser();
    });
    common_vendor.onShow(() => {
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
        f: common_vendor.p({
          name: "user"
        }),
        g: common_vendor.o(goToLogin)
      }, {
        h: user.value
      }, user.value ? {
        i: common_vendor.t(stats.value.goodsCount),
        j: common_vendor.t(stats.value.orderCount)
      } : {}, {
        k: common_vendor.p({
          name: "plus"
        }),
        l: common_vendor.p({
          name: "arrow-right"
        }),
        m: common_vendor.o(goToPublish),
        n: common_vendor.p({
          name: "order"
        }),
        o: common_vendor.p({
          name: "arrow-right"
        }),
        p: common_vendor.o(goToMyGoods),
        q: common_vendor.p({
          name: "wallet"
        }),
        r: common_vendor.p({
          name: "arrow-right"
        }),
        s: common_vendor.o(goToOrders),
        t: common_vendor.p({
          name: "heart"
        }),
        v: common_vendor.p({
          name: "arrow-right"
        }),
        w: common_vendor.o(goToFavorites),
        x: common_vendor.p({
          name: "settings"
        }),
        y: common_vendor.p({
          name: "arrow-right"
        }),
        z: common_vendor.o(goToSettings),
        A: common_vendor.p({
          name: "info"
        }),
        B: common_vendor.p({
          name: "arrow-right"
        }),
        C: common_vendor.o(goToAbout),
        D: user.value
      }, user.value ? {
        E: common_vendor.p({
          name: "trash"
        }),
        F: common_vendor.o(handleLogout)
      } : {}, {
        G: common_vendor.p({
          name: "home"
        }),
        H: common_vendor.o(switchToHome),
        I: common_vendor.p({
          name: "plus"
        }),
        J: common_vendor.o(switchToPublish),
        K: common_vendor.p({
          name: "user",
          active: true
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f6b4f04d"]]);
wx.createPage(MiniProgramPage);

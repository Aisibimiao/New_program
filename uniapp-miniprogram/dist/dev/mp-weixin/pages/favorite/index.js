"use strict";
const common_vendor = require("../../common/vendor.js");
const api_favorite = require("../../api/favorite.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const favorites = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    function getImageUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function goToDetail(goodsId) {
      common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` });
    }
    async function handleRemove(goodsId) {
      common_vendor.index.showModal({
        title: "移除收藏",
        content: "确定要移除该收藏吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_favorite.removeFavorite(goodsId);
              common_vendor.index.showToast({ title: "移除成功", icon: "success" });
              loadFavorites();
            } catch (err) {
              common_vendor.index.showToast({ title: err.message || "移除失败", icon: "none" });
            }
          }
        }
      });
    }
    async function loadFavorites() {
      refreshing.value = true;
      try {
        favorites.value = await api_favorite.getFavorites();
      } catch (err) {
        console.error("加载收藏失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        refreshing.value = false;
      }
    }
    function onRefresh() {
      loadFavorites();
    }
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      loadFavorites();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(favorites.value, (item, k0, i0) => {
          var _a, _b, _c, _d, _e;
          return {
            a: getImageUrl((_b = (_a = item.goods) == null ? void 0 : _a.images) == null ? void 0 : _b[0]),
            b: common_vendor.t((_c = item.goods) == null ? void 0 : _c.name),
            c: common_vendor.t((_d = item.goods) == null ? void 0 : _d.description),
            d: common_vendor.t((_e = item.goods) == null ? void 0 : _e.price),
            e: common_vendor.o(($event) => goToDetail(item.goodsId), item.id),
            f: common_vendor.o(($event) => handleRemove(item.goodsId), item.id),
            g: item.id
          };
        }),
        b: favorites.value.length === 0
      }, favorites.value.length === 0 ? {} : {}, {
        c: refreshing.value,
        d: common_vendor.o(onRefresh)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9c2e4bd0"]]);
wx.createPage(MiniProgramPage);

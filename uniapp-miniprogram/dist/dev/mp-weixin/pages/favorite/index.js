"use strict";
const common_vendor = require("../../common/vendor.js");
const api_favorite = require("../../api/favorite.js");
const stores_user = require("../../stores/user.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const favorites = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    function getImageUrl(url) {
      if (!url) return "https://api.dicebear.com/9.x/initials/png?seed=Goods&backgroundColor=e2e8f0";
      return utils_request.formatImageUrl(url);
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function goToDetail(goodsId, status) {
      const isSold = status === "SOLD" || status === 0;
      if (isSold) {
        common_vendor.index.showModal({
          title: "提示",
          content: "该商品已售出，仅可查看详情",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${goodsId}&from=favorite` });
            }
          }
        });
      } else {
        common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` });
      }
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
    common_vendor.onShow(() => {
      loadFavorites();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "arrow-left"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.t(favorites.value.length),
        d: common_vendor.f(favorites.value, (item, k0, i0) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
          return common_vendor.e({
            a: ((_a = item.goods) == null ? void 0 : _a.status) === "SOLD" || ((_b = item.goods) == null ? void 0 : _b.status) === 0
          }, ((_c = item.goods) == null ? void 0 : _c.status) === "SOLD" || ((_d = item.goods) == null ? void 0 : _d.status) === 0 ? {} : {}, {
            b: getImageUrl((_f = (_e = item.goods) == null ? void 0 : _e.images) == null ? void 0 : _f[0]),
            c: common_vendor.t((_g = item.goods) == null ? void 0 : _g.name),
            d: common_vendor.t((_h = item.goods) == null ? void 0 : _h.description),
            e: common_vendor.t((_i = item.goods) == null ? void 0 : _i.price),
            f: (_j = item.goods) == null ? void 0 : _j.originalPrice
          }, ((_k = item.goods) == null ? void 0 : _k.originalPrice) ? {
            g: common_vendor.t((_l = item.goods) == null ? void 0 : _l.originalPrice)
          } : {}, {
            h: common_vendor.o(($event) => {
              var _a2;
              return goToDetail(item.goodsId, (_a2 = item.goods) == null ? void 0 : _a2.status);
            }, item.id),
            i: "9c2e4bd0-1-" + i0,
            j: common_vendor.o(($event) => handleRemove(item.goodsId), item.id),
            k: item.id
          });
        }),
        e: common_vendor.p({
          name: "close"
        }),
        f: favorites.value.length === 0
      }, favorites.value.length === 0 ? {
        g: common_vendor.p({
          name: "heart"
        })
      } : {}, {
        h: refreshing.value,
        i: common_vendor.o(onRefresh)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9c2e4bd0"]]);
wx.createPage(MiniProgramPage);

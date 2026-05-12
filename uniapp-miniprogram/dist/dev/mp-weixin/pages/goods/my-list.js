"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my-list",
  setup(__props) {
    const activeTab = common_vendor.ref("selling");
    const goodsList = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    function getImageUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${id}` });
    }
    async function loadGoods() {
      refreshing.value = true;
      try {
        const result = await api_goods.getMyGoods();
        if (activeTab.value === "selling") {
          goodsList.value = result.filter((g) => g.status === 1);
        } else {
          goodsList.value = result.filter((g) => g.status === 0);
        }
      } catch (err) {
        console.error("加载失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        refreshing.value = false;
      }
    }
    function onRefresh() {
      loadGoods();
    }
    common_vendor.watch(activeTab, () => {
      loadGoods();
    });
    common_vendor.onMounted(() => {
      loadGoods();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === "selling" ? 1 : "",
        b: common_vendor.o(($event) => activeTab.value = "selling"),
        c: activeTab.value === "sold" ? 1 : "",
        d: common_vendor.o(($event) => activeTab.value = "sold"),
        e: common_vendor.f(goodsList.value, (goods, k0, i0) => {
          return {
            a: getImageUrl(goods.images[0]),
            b: common_vendor.t(goods.name),
            c: common_vendor.t(goods.description),
            d: common_vendor.t(goods.price),
            e: common_vendor.t(goods.status === 1 ? "在售" : "已售出"),
            f: goods.id,
            g: common_vendor.o(($event) => goToDetail(goods.id), goods.id)
          };
        }),
        f: goodsList.value.length === 0
      }, goodsList.value.length === 0 ? {} : {}, {
        g: refreshing.value,
        h: common_vendor.o(onRefresh)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bf6a0d3e"]]);
wx.createPage(MiniProgramPage);

"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const stores_user = require("../../stores/user.js");
if (!Math) {
  (LineIcon + TabBar)();
}
const LineIcon = () => "../../components/LineIcon.js";
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const tabBarRef = common_vendor.ref();
    const keyword = common_vendor.ref("");
    const goodsList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const limit = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const category = common_vendor.ref("");
    const categories = ["数码产品", "服饰鞋包", "图书教材", "运动户外", "生活用品", "其他"];
    function getImageUrl(url) {
      if (!url || url === "[]") return "";
      if (url.startsWith("http")) return url;
      if (url.startsWith("/")) return `http://47.236.64.92${url}`;
      return url;
    }
    function handleImageError(e) {
      const image = e.target;
      image.src = "";
    }
    function getConditionText(condition) {
      const map = {
        1: "全新",
        2: "几乎全新",
        3: "轻微使用",
        4: "明显使用"
      };
      return map[condition] || "其他";
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({ url: "/pages/goods/detail?id=" + id });
    }
    function switchToHome() {
      common_vendor.index.reLaunch({ url: "/pages/index/index" });
    }
    function setCategory(cat) {
      category.value = cat;
      page.value = 1;
      hasMore.value = true;
      loadGoods(true);
    }
    function clearKeyword() {
      keyword.value = "";
      page.value = 1;
      hasMore.value = true;
      loadGoods(true);
    }
    function clearCategory() {
      category.value = "";
      page.value = 1;
      hasMore.value = true;
      loadGoods(true);
    }
    async function loadGoods(isRefresh = false) {
      if (loading.value) return;
      loading.value = true;
      try {
        const params = {
          page: isRefresh ? 1 : page.value,
          limit: limit.value
        };
        if (keyword.value) params.keyword = keyword.value;
        if (category.value) params.category = category.value;
        const result = await api_goods.getGoods(params);
        if (isRefresh) {
          goodsList.value = result.list;
          page.value = 1;
        } else {
          goodsList.value = [...goodsList.value, ...result.list];
        }
        hasMore.value = result.list.length >= limit.value;
        if (hasMore.value) page.value++;
      } catch (err) {
        console.error("加载商品失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    }
    function search() {
      page.value = 1;
      hasMore.value = true;
      loadGoods(true);
    }
    function onRefresh() {
      refreshing.value = true;
      loadGoods(true);
    }
    function loadMore() {
      if (hasMore.value && !loading.value) {
        loadGoods();
      }
    }
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.category) {
        category.value = options.category;
      }
    });
    common_vendor.onMounted(() => {
      var _a;
      userStore.initFromStorage();
      loadGoods();
      (_a = tabBarRef.value) == null ? void 0 : _a.setCurrentIndex(1);
    });
    common_vendor.onShow(() => {
      page.value = 1;
      hasMore.value = true;
      goodsList.value = [];
      loadGoods();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "arrow-left"
        }),
        b: common_vendor.o(($event) => switchToHome()),
        c: common_vendor.p({
          name: "search"
        }),
        d: common_vendor.o(search),
        e: keyword.value,
        f: common_vendor.o(($event) => keyword.value = $event.detail.value),
        g: common_vendor.o(search),
        h: !category.value ? 1 : "",
        i: common_vendor.o(($event) => setCategory("")),
        j: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat),
            b: cat,
            c: category.value === cat ? 1 : "",
            d: common_vendor.o(($event) => setCategory(cat), cat)
          };
        }),
        k: keyword.value || category.value
      }, keyword.value || category.value ? common_vendor.e({
        l: keyword.value
      }, keyword.value ? {
        m: common_vendor.t(keyword.value),
        n: common_vendor.p({
          name: "close"
        }),
        o: common_vendor.o(clearKeyword)
      } : {}, {
        p: category.value
      }, category.value ? {
        q: common_vendor.t(category.value),
        r: common_vendor.p({
          name: "close"
        }),
        s: common_vendor.o(clearCategory)
      } : {}) : {}, {
        t: common_vendor.f(goodsList.value, (goods, k0, i0) => {
          var _a;
          return {
            a: getImageUrl((_a = goods.images) == null ? void 0 : _a[0]),
            b: common_vendor.o(($event) => handleImageError($event), goods.id),
            c: common_vendor.t(goods.name),
            d: common_vendor.t(goods.description),
            e: common_vendor.t(goods.price),
            f: common_vendor.t(getConditionText(goods.condition)),
            g: goods.id,
            h: common_vendor.o(($event) => goToDetail(goods.id), goods.id)
          };
        }),
        v: loading.value
      }, loading.value ? {} : {}, {
        w: !loading.value && !hasMore.value
      }, !loading.value && !hasMore.value ? {} : {}, {
        x: refreshing.value,
        y: common_vendor.o(onRefresh),
        z: common_vendor.o(loadMore),
        A: common_vendor.sr(tabBarRef, "c467e7b9-4", {
          "k": "tabBarRef"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c467e7b9"]]);
wx.createPage(MiniProgramPage);

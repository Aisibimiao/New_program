"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const userStore = stores_user.useUserStore();
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
      if (!url) return "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20image%20placeholder&image_size=square";
      let parsedUrl = url;
      if (url.startsWith("[")) {
        try {
          const arr = JSON.parse(url);
          if (Array.isArray(arr) && arr.length > 0) {
            parsedUrl = arr[0];
          } else {
            return "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20image%20placeholder&image_size=square";
          }
        } catch {
          return "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20image%20placeholder&image_size=square";
        }
      }
      if (parsedUrl.startsWith("http")) return parsedUrl;
      return `http://localhost:3000${parsedUrl}`;
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
      common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${id}` });
    }
    function goToHome() {
      common_vendor.index.navigateTo({ url: "/pages/index/index" });
    }
    function goToGoods() {
    }
    function goToProfile() {
      common_vendor.index.navigateTo({ url: "/pages/user/profile" });
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
      userStore.initFromStorage();
      loadGoods();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(search),
        b: keyword.value,
        c: common_vendor.o(($event) => keyword.value = $event.detail.value),
        d: common_vendor.o(search),
        e: !category.value ? 1 : "",
        f: common_vendor.o(($event) => setCategory("")),
        g: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat),
            b: cat,
            c: category.value === cat ? 1 : "",
            d: common_vendor.o(($event) => setCategory(cat), cat)
          };
        }),
        h: keyword.value || category.value
      }, keyword.value || category.value ? common_vendor.e({
        i: keyword.value
      }, keyword.value ? {
        j: common_vendor.t(keyword.value),
        k: common_vendor.o(clearKeyword)
      } : {}, {
        l: category.value
      }, category.value ? {
        m: common_vendor.t(category.value),
        n: common_vendor.o(clearCategory)
      } : {}) : {}, {
        o: common_vendor.f(goodsList.value, (goods, k0, i0) => {
          return {
            a: getImageUrl(goods.images[0]),
            b: common_vendor.t(goods.name),
            c: common_vendor.t(goods.description),
            d: common_vendor.t(goods.price),
            e: common_vendor.t(getConditionText(goods.condition)),
            f: goods.id,
            g: common_vendor.o(($event) => goToDetail(goods.id), goods.id)
          };
        }),
        p: loading.value
      }, loading.value ? {} : {}, {
        q: !loading.value && !hasMore.value
      }, !loading.value && !hasMore.value ? {} : {}, {
        r: refreshing.value,
        s: common_vendor.o(onRefresh),
        t: common_vendor.o(loadMore),
        v: common_vendor.o(($event) => goToHome()),
        w: common_vendor.o(($event) => goToGoods()),
        x: common_vendor.o(($event) => goToProfile())
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c467e7b9"]]);
wx.createPage(MiniProgramPage);

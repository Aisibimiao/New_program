"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const searchKeyword = common_vendor.ref("");
    const categories = [
      { name: "数码产品", icon: "📱" },
      { name: "服饰鞋包", icon: "👔" },
      { name: "图书教材", icon: "📚" },
      { name: "运动户外", icon: "⚽" },
      { name: "生活用品", icon: "🏠" },
      { name: "其他", icon: "🎯" }
    ];
    const hotGoods = common_vendor.ref([]);
    const mockGoods = [
      {
        id: "1",
        name: "iPhone 14 Pro 256GB",
        description: "95成新，使用半年，无磕碰",
        price: 5999,
        originalPrice: 8999,
        images: [],
        category: "数码产品",
        condition: 3,
        status: 1,
        userId: "1",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15"
      },
      {
        id: "2",
        name: "高等数学教材（第七版）",
        description: "全新未拆封，考研必备",
        price: 35,
        originalPrice: 59,
        images: [],
        category: "图书教材",
        condition: 5,
        status: 1,
        userId: "2",
        createdAt: "2024-01-14",
        updatedAt: "2024-01-14"
      },
      {
        id: "3",
        name: "Nike Air Force 1 运动鞋",
        description: "42码，穿过几次，几乎全新",
        price: 499,
        originalPrice: 799,
        images: [],
        category: "服饰鞋包",
        condition: 4,
        status: 1,
        userId: "3",
        createdAt: "2024-01-13",
        updatedAt: "2024-01-13"
      },
      {
        id: "4",
        name: "羽毛球拍套装",
        description: "含球拍、球、护腕，九成新",
        price: 120,
        originalPrice: 260,
        images: [],
        category: "运动户外",
        condition: 3,
        status: 1,
        userId: "4",
        createdAt: "2024-01-12",
        updatedAt: "2024-01-12"
      },
      {
        id: "5",
        name: "小米台灯Pro",
        description: "护眼台灯，可调节亮度色温",
        price: 89,
        originalPrice: 169,
        images: [],
        category: "生活用品",
        condition: 4,
        status: 1,
        userId: "5",
        createdAt: "2024-01-11",
        updatedAt: "2024-01-11"
      },
      {
        id: "6",
        name: "机械键盘青轴",
        description: "RGB背光，手感极佳",
        price: 159,
        originalPrice: 299,
        images: [],
        category: "数码产品",
        condition: 3,
        status: 1,
        userId: "6",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-10"
      }
    ];
    function getImageUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function goToHome() {
      common_vendor.index.navigateTo({ url: "/pages/index/index" });
    }
    function goToGoods() {
      common_vendor.index.navigateTo({ url: "/pages/goods/list" });
    }
    function handleSearch() {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({ title: "请输入搜索关键词", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: `/pages/goods/list?keyword=${encodeURIComponent(searchKeyword.value)}` });
    }
    function goToCategory(category) {
      common_vendor.index.navigateTo({ url: `/pages/goods/list?category=${category}` });
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
    function goToProfile() {
      common_vendor.index.navigateTo({ url: "/pages/user/profile" });
    }
    function goToFavorites() {
      if (!userStore.token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/favorite/index" });
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${id}` });
    }
    function loadHotGoods() {
      hotGoods.value = mockGoods;
      api_goods.getGoods({ page: 1, limit: 6 }).then((result) => {
        if (result.list && result.list.length > 0) {
          hotGoods.value = result.list;
        }
      }).catch((err) => {
        console.error("后台API加载失败，使用mock数据", err);
      });
    }
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      loadHotGoods();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleSearch),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(handleSearch),
        e: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.icon),
            b: common_vendor.t(cat.name),
            c: cat.name,
            d: common_vendor.o(($event) => goToCategory(cat.name), cat.name)
          };
        }),
        f: common_vendor.o(($event) => goToGoods()),
        g: common_vendor.f(hotGoods.value, (goods, k0, i0) => {
          var _a;
          return {
            a: getImageUrl((_a = goods.images) == null ? void 0 : _a[0]),
            b: common_vendor.t(goods.name),
            c: common_vendor.t(goods.price),
            d: goods.id,
            e: common_vendor.o(($event) => goToDetail(goods.id), goods.id)
          };
        }),
        h: common_vendor.o(($event) => goToGoods()),
        i: common_vendor.o(($event) => goToPublish()),
        j: common_vendor.o(($event) => goToProfile()),
        k: common_vendor.o(($event) => goToFavorites()),
        l: common_vendor.o(($event) => goToHome()),
        m: common_vendor.o(($event) => goToGoods()),
        n: common_vendor.o(($event) => goToProfile())
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);

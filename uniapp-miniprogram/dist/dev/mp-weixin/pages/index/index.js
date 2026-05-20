"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
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
    const searchKeyword = common_vendor.ref("");
    const goodsList = common_vendor.ref([]);
    const favoriteIds = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const loading = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const scrollTop = common_vendor.ref(0);
    const isSticky = common_vendor.ref(false);
    const showCategoryPopup = common_vendor.ref(false);
    const selectedCategory = common_vendor.ref("");
    const imageLoadedMap = common_vendor.ref({});
    let lastClickTime = 0;
    const categories = [
      { value: "ELECTRONICS", label: "数码产品" },
      { value: "CLOTHING", label: "服饰鞋包" },
      { value: "BOOK", label: "图书教材" },
      { value: "SPORTS", label: "运动户外" },
      { value: "LIFE", label: "生活用品" },
      { value: "OTHER", label: "其他" }
    ];
    const selectedCategoryLabel = common_vendor.computed(() => {
      if (!selectedCategory.value) return "全部";
      const cat = categories.find((c) => c.value === selectedCategory.value);
      return (cat == null ? void 0 : cat.label) || "全部";
    });
    const mockGoods = [
      {
        id: "1",
        name: "iPhone 14 Pro 256GB",
        description: "95成新，使用半年，无磕碰，电池健康度92%",
        price: 5999,
        originalPrice: 8999,
        images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="none" stroke="%231a1a2e" stroke-width="3" width="400" height="300"/%3E%3Ctext fill="%231a1a2e" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EiPhone 14 Pro%3C/text%3E%3C/svg%3E'],
        category: "ELECTRONICS",
        condition: 3,
        status: 1,
        userId: "1",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15"
      },
      {
        id: "2",
        name: "高等数学教材（第七版）",
        description: "全新未拆封，考研必备教材",
        price: 35,
        originalPrice: 59,
        images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="none" stroke="%231a1a2e" stroke-width="3" width="400" height="300"/%3E%3Ctext fill="%231a1a2e" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E高等数学%3C/text%3E%3C/svg%3E'],
        category: "BOOKS",
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
        images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="none" stroke="%231a1a2e" stroke-width="3" width="400" height="300"/%3E%3Ctext fill="%231a1a2e" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENike AF1%3C/text%3E%3C/svg%3E'],
        category: "CLOTHING",
        condition: 4,
        status: 1,
        userId: "3",
        createdAt: "2024-01-13",
        updatedAt: "2024-01-13"
      }
    ];
    function getImageUrl(url) {
      if (!url) return "https://api.dicebear.com/9.x/initials/png?seed=Goods&backgroundColor=e2e8f0";
      return utils_request.formatImageUrl(url);
    }
    function onImageLoad(goodsId) {
      imageLoadedMap.value[goodsId] = true;
    }
    function handleImageError(e, goodsId) {
      const image = e.target;
      image.src = utils_request.formatImageUrl("");
      imageLoadedMap.value[goodsId] = true;
    }
    function formatTime(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      if (days === 0) return "今天";
      if (days === 1) return "昨天";
      if (days < 7) return `${days}天前`;
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    function isFavorite(goodsId) {
      return favoriteIds.value.includes(goodsId);
    }
    async function toggleFavorite(goodsId) {
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
        if (isFavorite(goodsId)) {
          await api_favorite.removeFavorite(goodsId);
          favoriteIds.value = favoriteIds.value.filter((id) => id !== goodsId);
          common_vendor.index.showToast({ title: "已取消收藏", icon: "none" });
        } else {
          await api_favorite.addFavorite(goodsId);
          favoriteIds.value.push(goodsId);
          common_vendor.index.showToast({ title: "已收藏", icon: "none" });
        }
      } catch (err) {
        console.error("收藏操作失败", err);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    }
    async function loadFavorites() {
      if (!userStore.token) return;
      try {
        const result = await api_favorite.getFavorites();
        favoriteIds.value = (result || []).map((fav) => fav.goodsId);
      } catch (err) {
        console.error("加载收藏列表失败", err);
      }
    }
    function goToHome() {
      const currentTime = Date.now();
      if (currentTime - lastClickTime < 300) {
        refreshPage();
      }
      lastClickTime = currentTime;
    }
    function refreshPage() {
      page.value = 1;
      hasMore.value = true;
      goodsList.value = [];
      scrollTop.value = 0;
      loadGoods();
      common_vendor.index.showToast({ title: "已刷新", icon: "none" });
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
    function toggleCategory() {
      showCategoryPopup.value = !showCategoryPopup.value;
    }
    function selectCategory(value) {
      selectedCategory.value = value;
      showCategoryPopup.value = false;
      page.value = 1;
      hasMore.value = true;
      goodsList.value = [];
      loadGoods();
    }
    function handleSearch() {
      page.value = 1;
      hasMore.value = true;
      goodsList.value = [];
      loadGoods();
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${id}` });
    }
    function onScroll(e) {
      const scrollY = e.detail.scrollTop;
      isSticky.value = scrollY >= 300;
    }
    function onPullDownRefresh() {
      if (isRefreshing.value) return;
      isRefreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      goodsList.value = [];
      loadGoods().then(() => {
        isRefreshing.value = false;
        common_vendor.index.showToast({ title: "刷新成功", icon: "none" });
      }).catch(() => {
        isRefreshing.value = false;
      });
    }
    function onReachBottom() {
      if (loading.value || !hasMore.value || isRefreshing.value) return;
      loadGoods();
    }
    function loadGoods() {
      return new Promise((resolve) => {
        if (loading.value || !hasMore.value) {
          resolve();
          return;
        }
        loading.value = true;
        const params = { page: page.value, limit: 6 };
        if (searchKeyword.value) params.keyword = searchKeyword.value;
        if (selectedCategory.value) params.category = selectedCategory.value;
        api_goods.getGoods(params).then((result) => {
          if (result.list && result.list.length > 0) {
            goodsList.value = [...goodsList.value, ...result.list];
            page.value++;
            if (result.list.length < 6) {
              hasMore.value = false;
            }
          } else {
            hasMore.value = false;
          }
          loading.value = false;
          resolve();
        }).catch((err) => {
          console.error("加载商品失败，使用mock数据", err);
          if (goodsList.value.length === 0) {
            let filtered = mockGoods;
            if (selectedCategory.value) {
              filtered = filtered.filter((g) => g.category === selectedCategory.value);
            }
            if (searchKeyword.value) {
              const keyword = searchKeyword.value.toLowerCase();
              filtered = filtered.filter(
                (g) => g.name.toLowerCase().includes(keyword) || g.description.toLowerCase().includes(keyword)
              );
            }
            goodsList.value = filtered;
          }
          hasMore.value = false;
          loading.value = false;
          resolve();
        });
      });
    }
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      loadGoods();
      loadFavorites();
    });
    common_vendor.onShow(() => {
      page.value = 1;
      hasMore.value = true;
      goodsList.value = [];
      loadGoods();
      loadFavorites();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedCategoryLabel.value),
        b: common_vendor.p({
          name: "arrow-down"
        }),
        c: common_vendor.o(toggleCategory),
        d: common_vendor.p({
          name: "search"
        }),
        e: common_vendor.o(handleSearch),
        f: searchKeyword.value,
        g: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        h: isSticky.value ? 1 : "",
        i: showCategoryPopup.value
      }, showCategoryPopup.value ? {
        j: selectedCategory.value === "" ? 1 : "",
        k: common_vendor.o(($event) => selectCategory("")),
        l: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.label),
            b: cat.value,
            c: selectedCategory.value === cat.value ? 1 : "",
            d: common_vendor.o(($event) => selectCategory(cat.value), cat.value)
          };
        }),
        m: common_vendor.o(() => {
        }),
        n: common_vendor.o(toggleCategory)
      } : {}, {
        o: isSticky.value
      }, isSticky.value ? {} : {}, {
        p: common_vendor.f(goodsList.value, (goods, k0, i0) => {
          var _a;
          return {
            a: getImageUrl((_a = goods.images) == null ? void 0 : _a[0]),
            b: common_vendor.o(($event) => onImageLoad(goods.id), goods.id),
            c: common_vendor.o(($event) => handleImageError($event, goods.id), goods.id),
            d: imageLoadedMap.value[goods.id] ? 1 : "",
            e: common_vendor.o(($event) => goToDetail(goods.id), goods.id),
            f: common_vendor.t(goods.name),
            g: common_vendor.o(($event) => goToDetail(goods.id), goods.id),
            h: common_vendor.t(goods.description),
            i: common_vendor.o(($event) => goToDetail(goods.id), goods.id),
            j: common_vendor.t(goods.price),
            k: "83a5a03c-2-" + i0,
            l: common_vendor.p({
              name: "heart",
              active: isFavorite(goods.id)
            }),
            m: common_vendor.o(($event) => toggleFavorite(goods.id), goods.id),
            n: common_vendor.t(formatTime(goods.createdAt)),
            o: goods.id
          };
        }),
        q: loading.value
      }, loading.value ? {} : goodsList.value.length === 0 && !loading.value ? {
        s: common_vendor.p({
          name: "box"
        })
      } : {}, {
        r: goodsList.value.length === 0 && !loading.value,
        t: common_vendor.o(onScroll),
        v: scrollTop.value,
        w: common_vendor.o(onPullDownRefresh),
        x: common_vendor.o(onReachBottom),
        y: isRefreshing.value,
        z: common_vendor.p({
          name: "home",
          active: true
        }),
        A: common_vendor.o(($event) => goToHome()),
        B: common_vendor.p({
          name: "plus"
        }),
        C: common_vendor.o(($event) => goToPublish()),
        D: common_vendor.p({
          name: "user"
        }),
        E: common_vendor.o(($event) => goToProfile())
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);

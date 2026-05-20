"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my-list",
  setup(__props) {
    const activeTab = common_vendor.ref("selling");
    const goodsList = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    const imageUrls = common_vendor.ref({});
    async function getImageUrl(fileID) {
      if (!fileID || fileID === "[]" || fileID === "") return "";
      if (fileID.startsWith("http")) {
        return fileID;
      }
      if (imageUrls.value[fileID]) {
        return imageUrls.value[fileID];
      }
      try {
        const result = await common_vendor.index.cloud.getTempFileURL({
          fileList: [fileID]
        });
        if (result.fileList[0].tempFileURL) {
          imageUrls.value[fileID] = result.fileList[0].tempFileURL;
          return result.fileList[0].tempFileURL;
        }
      } catch (err) {
        console.error("获取图片URL失败", err);
      }
      return "";
    }
    function handleImageError(e) {
      const image = e.target;
      image.src = "";
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({ url: "/pages/goods/detail?id=" + id });
    }
    function goToEdit(id) {
      common_vendor.index.navigateTo({ url: "/pages/publish/edit?id=" + id });
    }
    async function handleOffShelf(id) {
      common_vendor.index.showModal({
        title: "确认下架",
        content: "确定要下架这个商品吗？下架后会移至已售出",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_goods.offShelfGoods(id);
              common_vendor.index.showToast({ title: "下架成功", icon: "success" });
              loadGoods();
            } catch (err) {
              console.error("下架失败", err);
              common_vendor.index.showToast({ title: "下架失败", icon: "none" });
            }
          }
        }
      });
    }
    async function handleDelete(id) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个商品吗？删除后不可恢复",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_goods.deleteGoods(id);
              common_vendor.index.showToast({ title: "删除成功", icon: "success" });
              loadGoods();
            } catch (err) {
              console.error("删除失败", err);
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            }
          }
        }
      });
    }
    async function loadGoods() {
      refreshing.value = true;
      imageUrls.value = {};
      try {
        const result = await api_goods.getMyGoods();
        if (result.success && result.data) {
          const list = result.data.list || [];
          if (activeTab.value === "selling") {
            goodsList.value = list.filter((g) => g.status === 1);
          } else {
            goodsList.value = list.filter((g) => g.status === 0);
          }
        } else {
          goodsList.value = [];
        }
      } catch (err) {
        console.error("加载失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
        goodsList.value = [];
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
    common_vendor.onShow(() => {
      loadGoods();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === "selling"
      }, activeTab.value === "selling" ? {} : {}, {
        b: activeTab.value === "selling" ? 1 : "",
        c: common_vendor.o(($event) => activeTab.value = "selling"),
        d: activeTab.value === "sold"
      }, activeTab.value === "sold" ? {} : {}, {
        e: activeTab.value === "sold" ? 1 : "",
        f: common_vendor.o(($event) => activeTab.value = "sold"),
        g: common_vendor.f(goodsList.value, (goods, k0, i0) => {
          var _a;
          return common_vendor.e({
            a: getImageUrl((_a = goods.images) == null ? void 0 : _a[0]),
            b: common_vendor.o(($event) => handleImageError($event), goods._id),
            c: common_vendor.t(goods.title),
            d: common_vendor.t(goods.description),
            e: common_vendor.t(goods.price),
            f: common_vendor.t(goods.status === 1 ? "在售" : "已售出"),
            g: common_vendor.o(($event) => goToDetail(goods._id), goods._id),
            h: goods.status === 1
          }, goods.status === 1 ? {
            i: common_vendor.o(($event) => handleOffShelf(goods._id), goods._id),
            j: common_vendor.o(($event) => goToEdit(goods._id), goods._id),
            k: common_vendor.o(($event) => handleDelete(goods._id), goods._id)
          } : {
            l: common_vendor.o(($event) => handleDelete(goods._id), goods._id)
          }, {
            m: goods._id
          });
        }),
        h: goodsList.value.length === 0
      }, goodsList.value.length === 0 ? {
        i: common_vendor.p({
          name: "box"
        })
      } : {}, {
        j: refreshing.value,
        k: common_vendor.o(onRefresh)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bf6a0d3e"]]);
wx.createPage(MiniProgramPage);

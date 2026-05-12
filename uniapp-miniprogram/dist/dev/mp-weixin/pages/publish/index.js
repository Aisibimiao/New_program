"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const categories = ["数码产品", "服饰鞋包", "图书教材", "运动户外", "生活用品", "其他"];
    const conditions = [
      { label: "全新", value: 1 },
      { label: "几乎全新", value: 2 },
      { label: "轻微使用", value: 3 },
      { label: "明显使用", value: 4 }
    ];
    const images = common_vendor.ref([]);
    const form = common_vendor.ref({
      name: "",
      description: "",
      category: "数码产品",
      condition: 2,
      originalPrice: "",
      price: ""
    });
    const canSubmit = common_vendor.computed(() => {
      return images.value.length > 0 && form.value.name && form.value.description && form.value.price;
    });
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      if (!userStore.token) {
        common_vendor.index.showModal({
          title: "请先登录",
          content: "发布商品需要先登录，是否前往登录？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/user/login" });
            } else {
              common_vendor.index.navigateBack();
            }
          }
        });
      }
    });
    async function chooseImage() {
      common_vendor.index.chooseImage({
        count: 6 - images.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          common_vendor.index.showLoading({ title: "上传中..." });
          try {
            for (const filePath of res.tempFilePaths) {
              const url = await api_goods.uploadImage(filePath);
              images.value.push(url);
            }
          } catch (err) {
            common_vendor.index.showToast({ title: "上传失败", icon: "none" });
            console.error("上传失败", err);
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    }
    function removeImage(index) {
      images.value.splice(index, 1);
    }
    async function handleSubmit() {
      if (!canSubmit.value) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "发布中..." });
      try {
        await api_goods.createGoods({
          name: form.value.name,
          description: form.value.description,
          category: form.value.category,
          condition: form.value.condition,
          originalPrice: parseFloat(form.value.originalPrice) || 0,
          price: parseFloat(form.value.price),
          images: images.value
        });
        common_vendor.index.showToast({ title: "发布成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.redirectTo({ url: "/pages/index/index" });
        }, 1500);
      } catch (err) {
        common_vendor.index.showToast({ title: err.message || "发布失败", icon: "none" });
        console.error("发布失败", err);
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(images.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => removeImage(index), index),
            c: index
          };
        }),
        b: images.value.length < 6
      }, images.value.length < 6 ? {
        c: common_vendor.o(chooseImage)
      } : {}, {
        d: form.value.name,
        e: common_vendor.o(($event) => form.value.name = $event.detail.value),
        f: form.value.description,
        g: common_vendor.o(($event) => form.value.description = $event.detail.value),
        h: common_vendor.t(form.value.description.length),
        i: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat),
            b: cat,
            c: form.value.category === cat ? 1 : "",
            d: common_vendor.o(($event) => form.value.category = cat, cat)
          };
        }),
        j: common_vendor.f(conditions, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: form.value.condition === item.value ? 1 : "",
            d: common_vendor.o(($event) => form.value.condition = item.value, item.value)
          };
        }),
        k: form.value.originalPrice,
        l: common_vendor.o(($event) => form.value.originalPrice = $event.detail.value),
        m: form.value.price,
        n: common_vendor.o(($event) => form.value.price = $event.detail.value),
        o: !canSubmit.value ? 1 : "",
        p: common_vendor.o(handleSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ce8f53b1"]]);
wx.createPage(MiniProgramPage);

"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "feedback",
  setup(__props) {
    const feedbackTypes = ["功能建议", "Bug反馈", "交易问题", "投诉建议", "其他"];
    const selectedType = common_vendor.ref(0);
    const contact = common_vendor.ref("");
    const content = common_vendor.ref("");
    const images = common_vendor.ref([]);
    function onTypeChange(e) {
      selectedType.value = e.detail.value;
    }
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 3 - images.value.length,
        success: (res) => {
          images.value = [...images.value, ...res.tempFilePaths];
        }
      });
    }
    function removeImage(idx) {
      images.value.splice(idx, 1);
    }
    function submitFeedback() {
      if (!content.value.trim()) {
        common_vendor.index.showToast({ title: "请输入反馈内容", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中..." });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "反馈提交成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }, 1e3);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(feedbackTypes[selectedType.value] || "请选择反馈类型"),
        b: feedbackTypes,
        c: common_vendor.o(onTypeChange),
        d: contact.value,
        e: common_vendor.o(($event) => contact.value = $event.detail.value),
        f: content.value,
        g: common_vendor.o(($event) => content.value = $event.detail.value),
        h: common_vendor.t(content.value.length),
        i: common_vendor.f(images.value, (img, idx, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => removeImage(idx), idx),
            c: idx
          };
        }),
        j: images.value.length < 3
      }, images.value.length < 3 ? {
        k: common_vendor.o(chooseImage)
      } : {}, {
        l: common_vendor.o(submitFeedback)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-681d75bc"]]);
wx.createPage(MiniProgramPage);

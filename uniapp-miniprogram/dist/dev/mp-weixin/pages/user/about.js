"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "about",
  setup(__props) {
    function openLink(type) {
      switch (type) {
        case "userAgreement":
          common_vendor.index.navigateTo({ url: "/pages/user/agreement" });
          break;
        case "privacyPolicy":
          common_vendor.index.navigateTo({ url: "/pages/user/privacy" });
          break;
        case "feedback":
          common_vendor.index.navigateTo({ url: "/pages/user/feedback" });
          break;
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.o(($event) => openLink("userAgreement")),
        c: common_vendor.o(($event) => openLink("privacyPolicy")),
        d: common_vendor.o(($event) => openLink("feedback"))
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-02a7c0ad"]]);
wx.createPage(MiniProgramPage);

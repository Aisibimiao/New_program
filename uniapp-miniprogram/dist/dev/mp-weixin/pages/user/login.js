"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    async function handleWechatLogin() {
      common_vendor.index.showLoading({ title: "登录中..." });
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        if (!loginRes.code) {
          common_vendor.index.showToast({ title: "获取code失败", icon: "none" });
          return;
        }
        await userStore.wechatLogin(loginRes.code);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "登录成功", icon: "none" });
        setTimeout(() => {
          common_vendor.index.redirectTo({ url: "/pages/index/index" });
        }, 1e3);
      } catch (err) {
        common_vendor.index.hideLoading();
        console.error("登录失败:", err);
        common_vendor.index.showToast({
          title: err.message || "登录失败，请重试",
          icon: "none"
        });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          name: "chat"
        }),
        b: common_vendor.o(handleWechatLogin)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ebed24a8"]]);
wx.createPage(MiniProgramPage);

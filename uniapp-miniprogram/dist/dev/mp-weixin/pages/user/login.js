"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const email = common_vendor.ref("");
    const password = common_vendor.ref("");
    async function handleLogin() {
      if (!email.value) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      try {
        await userStore.login(email.value, password.value);
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.redirectTo({ url: "/pages/index/index" });
        }, 1e3);
      } catch (err) {
        common_vendor.index.showToast({ title: err.message || "登录失败", icon: "none" });
      }
    }
    function goToRegister() {
      common_vendor.index.navigateTo({ url: "/pages/user/register" });
    }
    function goToForget() {
      common_vendor.index.showToast({ title: "忘记密码功能开发中", icon: "none" });
    }
    return (_ctx, _cache) => {
      return {
        a: email.value,
        b: common_vendor.o(($event) => email.value = $event.detail.value),
        c: password.value,
        d: common_vendor.o(($event) => password.value = $event.detail.value),
        e: common_vendor.o(handleLogin),
        f: common_vendor.o(goToRegister),
        g: common_vendor.o(goToForget)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ebed24a8"]]);
wx.createPage(MiniProgramPage);

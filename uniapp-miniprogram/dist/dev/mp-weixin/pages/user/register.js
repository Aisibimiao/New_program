"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_auth = require("../../api/auth.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "register",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const email = common_vendor.ref("");
    const nickname = common_vendor.ref("");
    const password = common_vendor.ref("");
    const confirmPassword = common_vendor.ref("");
    const code = common_vendor.ref("");
    const codeDisabled = common_vendor.ref(false);
    const codeText = common_vendor.ref("获取验证码");
    async function getCode() {
      if (!email.value) {
        common_vendor.index.showToast({ title: "请先输入邮箱", icon: "none" });
        return;
      }
      codeDisabled.value = true;
      codeText.value = "60s后重试";
      try {
        await api_auth.sendCode(email.value);
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        let count = 60;
        const timer = setInterval(() => {
          count--;
          if (count <= 0) {
            clearInterval(timer);
            codeDisabled.value = false;
            codeText.value = "获取验证码";
          } else {
            codeText.value = `${count}s后重试`;
          }
        }, 1e3);
      } catch (err) {
        codeDisabled.value = false;
        codeText.value = "获取验证码";
        common_vendor.index.showToast({ title: "发送失败", icon: "none" });
      }
    }
    async function handleRegister() {
      if (!email.value) {
        common_vendor.index.showToast({ title: "请输入邮箱", icon: "none" });
        return;
      }
      if (!nickname.value) {
        common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      if (password.value !== confirmPassword.value) {
        common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
        return;
      }
      if (!code.value) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      try {
        await userStore.register(email.value, password.value, nickname.value, code.value);
        common_vendor.index.showToast({ title: "注册成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.redirectTo({ url: "/pages/index/index" });
        }, 1e3);
      } catch (err) {
        common_vendor.index.showToast({ title: err.message || "注册失败", icon: "none" });
      }
    }
    function goToLogin() {
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return {
        a: email.value,
        b: common_vendor.o(($event) => email.value = $event.detail.value),
        c: nickname.value,
        d: common_vendor.o(($event) => nickname.value = $event.detail.value),
        e: password.value,
        f: common_vendor.o(($event) => password.value = $event.detail.value),
        g: confirmPassword.value,
        h: common_vendor.o(($event) => confirmPassword.value = $event.detail.value),
        i: code.value,
        j: common_vendor.o(($event) => code.value = $event.detail.value),
        k: common_vendor.t(codeText.value),
        l: codeDisabled.value ? 1 : "",
        m: common_vendor.o(getCode),
        n: common_vendor.o(handleRegister),
        o: common_vendor.o(goToLogin)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-239527a3"]]);
wx.createPage(MiniProgramPage);

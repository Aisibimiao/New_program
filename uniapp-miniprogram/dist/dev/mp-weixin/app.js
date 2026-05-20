"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/goods/list.js";
  "./pages/goods/detail.js";
  "./pages/user/login.js";
  "./pages/user/profile.js";
  "./pages/user/edit.js";
  "./pages/user/settings.js";
  "./pages/goods/my-list.js";
  "./pages/order/list.js";
  "./pages/order/detail.js";
  "./pages/favorite/index.js";
  "./pages/publish/index.js";
  "./pages/publish/edit.js";
  "./pages/chat/index.js";
  "./pages/user/about.js";
  "./pages/user/feedback.js";
  "./pages/user/agreement.js";
  "./pages/user/privacy.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      console.log("App Launch");
      if (typeof common_vendor.index.cloud !== "undefined") {
        common_vendor.index.cloud.init({
          env: "cloudbase-d9dg3iiqp40c9067a"
        });
        console.log("云开发初始化成功");
      } else {
        console.log("当前环境不支持云开发");
      }
    });
    common_vendor.onShow(() => {
      console.log("App Show");
    });
    common_vendor.onHide(() => {
      console.log("App Hide");
    });
    return () => {
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;

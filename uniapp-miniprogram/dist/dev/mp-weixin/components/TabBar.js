"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "./LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "TabBar",
  setup(__props, { expose: __expose }) {
    const tabs = [
      { text: "首页", icon: "home", url: "/pages/index/index" },
      { text: "发布", icon: "plus", url: "/pages/publish/index" },
      { text: "我的", icon: "user", url: "/pages/user/profile" }
    ];
    const currentIndex = common_vendor.ref(0);
    function switchTab(index) {
      if (currentIndex.value === index) return;
      currentIndex.value = index;
      if (index === 0) {
        common_vendor.index.reLaunch({ url: tabs[index].url });
      } else {
        common_vendor.index.navigateTo({ url: tabs[index].url });
      }
    }
    function setCurrentIndex(index) {
      currentIndex.value = index;
    }
    __expose({ setCurrentIndex });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(tabs, (item, index, i0) => {
          return common_vendor.e({
            a: index === 1
          }, index === 1 ? {} : {
            b: "7d9a6b19-0-" + i0,
            c: common_vendor.p({
              name: item.icon,
              active: currentIndex.value === index
            })
          }, {
            d: common_vendor.t(item.text),
            e: index,
            f: currentIndex.value === index ? 1 : "",
            g: common_vendor.o(($event) => switchTab(index), index)
          });
        })
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d9a6b19"]]);
wx.createComponent(Component);

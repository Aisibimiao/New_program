"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "LineIcon",
  props: {
    name: {},
    active: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: _ctx.name === "home"
      }, _ctx.name === "home" ? {} : _ctx.name === "plus" ? {} : _ctx.name === "user" ? {} : _ctx.name === "chat" ? {} : _ctx.name === "heart" ? {} : _ctx.name === "share" ? {} : _ctx.name === "search" ? {} : _ctx.name === "settings" ? {} : _ctx.name === "info" ? {} : _ctx.name === "trash" ? {} : _ctx.name === "arrow-down" ? {} : _ctx.name === "arrow-up" ? {} : _ctx.name === "order" ? {} : _ctx.name === "wallet" ? {} : _ctx.name === "feedback" ? {} : _ctx.name === "bell" ? {} : _ctx.name === "users" ? {} : _ctx.name === "refresh" ? {} : _ctx.name === "lock" ? {} : _ctx.name === "file" ? {} : _ctx.name === "door" ? {} : _ctx.name === "arrow-left" ? {} : _ctx.name === "chevron-right" ? {} : _ctx.name === "close" ? {} : _ctx.name === "location" ? {} : {}, {
        b: _ctx.name === "plus",
        c: _ctx.name === "user",
        d: _ctx.name === "chat",
        e: _ctx.name === "heart",
        f: _ctx.name === "share",
        g: _ctx.name === "search",
        h: _ctx.name === "settings",
        i: _ctx.name === "info",
        j: _ctx.name === "trash",
        k: _ctx.name === "arrow-down",
        l: _ctx.name === "arrow-up",
        m: _ctx.name === "order",
        n: _ctx.name === "wallet",
        o: _ctx.name === "feedback",
        p: _ctx.name === "bell",
        q: _ctx.name === "users",
        r: _ctx.name === "refresh",
        s: _ctx.name === "lock",
        t: _ctx.name === "file",
        v: _ctx.name === "door",
        w: _ctx.name === "arrow-left",
        x: _ctx.name === "chevron-right",
        y: _ctx.name === "close",
        z: _ctx.name === "location",
        A: common_vendor.n(`icon-${_ctx.name}`),
        B: common_vendor.n({
          "icon-active": _ctx.active
        })
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f7c40b86"]]);
wx.createComponent(Component);

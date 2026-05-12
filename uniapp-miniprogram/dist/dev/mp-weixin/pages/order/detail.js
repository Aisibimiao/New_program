"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const orderId = common_vendor.ref("");
    const order = common_vendor.ref(null);
    const isSeller = common_vendor.computed(() => {
      var _a, _b, _c;
      return ((_b = (_a = order.value) == null ? void 0 : _a.goods) == null ? void 0 : _b.userId) === ((_c = userStore.user) == null ? void 0 : _c.id);
    });
    function getImageUrl(url) {
      if (!url) return "http://localhost:3000/uploads/default-avatar.png";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    function getStatusText(status) {
      const map = {
        PENDING: "待确认",
        COMPLETED: "已完成",
        CANCELLED: "已取消"
      };
      return map[status || ""] || "未知";
    }
    function getStatusClass(status) {
      const map = {
        PENDING: "pending",
        COMPLETED: "completed",
        CANCELLED: "cancelled"
      };
      return map[status || ""] || "";
    }
    function getConditionText(condition) {
      const map = {
        1: "全新",
        2: "几乎全新",
        3: "轻微使用",
        4: "明显使用"
      };
      return map[condition || 0] || "其他";
    }
    function goToGoodsDetail(goodsId) {
      if (!goodsId) return;
      common_vendor.index.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` });
    }
    async function handleCancel() {
      if (!orderId.value) return;
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定要取消该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_order.cancelOrder(orderId.value);
              common_vendor.index.showToast({ title: "取消成功", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            } catch (err) {
              common_vendor.index.showToast({ title: err.message || "取消失败", icon: "none" });
            }
          }
        }
      });
    }
    async function handleConfirm() {
      if (!orderId.value) return;
      common_vendor.index.showModal({
        title: "确认交易",
        content: "确认已收到货款并交付商品？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_order.confirmOrder(orderId.value);
              common_vendor.index.showToast({ title: "确认成功", icon: "success" });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            } catch (err) {
              common_vendor.index.showToast({ title: err.message || "确认失败", icon: "none" });
            }
          }
        }
      });
    }
    async function loadData() {
      if (!orderId.value) return;
      try {
        order.value = await api_order.getOrderDetail(orderId.value);
        common_vendor.index.setNavigationBarTitle({ title: "订单详情" });
      } catch (err) {
        console.error("加载订单详情失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    }
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.id) {
        orderId.value = options.id;
      }
    });
    common_vendor.onMounted(() => {
      loadData();
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S;
      return common_vendor.e({
        a: common_vendor.t((_a = order.value) == null ? void 0 : _a.id),
        b: common_vendor.t(getStatusText((_b = order.value) == null ? void 0 : _b.status)),
        c: common_vendor.n(getStatusClass((_c = order.value) == null ? void 0 : _c.status)),
        d: getImageUrl((_f = (_e = (_d = order.value) == null ? void 0 : _d.goods) == null ? void 0 : _e.images) == null ? void 0 : _f[0]),
        e: common_vendor.t((_h = (_g = order.value) == null ? void 0 : _g.goods) == null ? void 0 : _h.name),
        f: common_vendor.t((_j = (_i = order.value) == null ? void 0 : _i.goods) == null ? void 0 : _j.description),
        g: common_vendor.t((_l = (_k = order.value) == null ? void 0 : _k.goods) == null ? void 0 : _l.price),
        h: common_vendor.t(getConditionText((_n = (_m = order.value) == null ? void 0 : _m.goods) == null ? void 0 : _n.condition)),
        i: common_vendor.o(($event) => {
          var _a2, _b2;
          return goToGoodsDetail((_b2 = (_a2 = order.value) == null ? void 0 : _a2.goods) == null ? void 0 : _b2.id);
        }),
        j: (_p = (_o = order.value) == null ? void 0 : _o.goods) == null ? void 0 : _p.seller
      }, ((_r = (_q = order.value) == null ? void 0 : _q.goods) == null ? void 0 : _r.seller) ? {
        k: getImageUrl((_u = (_t = (_s = order.value) == null ? void 0 : _s.goods) == null ? void 0 : _t.seller) == null ? void 0 : _u.avatar),
        l: common_vendor.t(((_x = (_w = (_v = order.value) == null ? void 0 : _v.goods) == null ? void 0 : _w.seller) == null ? void 0 : _x.nickname) || ((_A = (_z = (_y = order.value) == null ? void 0 : _y.goods) == null ? void 0 : _z.seller) == null ? void 0 : _A.name) || "用户"),
        m: common_vendor.t(((_D = (_C = (_B = order.value) == null ? void 0 : _B.goods) == null ? void 0 : _C.seller) == null ? void 0 : _D.role) === "admin" ? "管理员" : "普通用户")
      } : {}, {
        n: (_E = order.value) == null ? void 0 : _E.buyer
      }, ((_F = order.value) == null ? void 0 : _F.buyer) ? {
        o: getImageUrl((_H = (_G = order.value) == null ? void 0 : _G.buyer) == null ? void 0 : _H.avatar),
        p: common_vendor.t(((_J = (_I = order.value) == null ? void 0 : _I.buyer) == null ? void 0 : _J.nickname) || ((_L = (_K = order.value) == null ? void 0 : _K.buyer) == null ? void 0 : _L.name) || "用户"),
        q: common_vendor.t(((_N = (_M = order.value) == null ? void 0 : _M.buyer) == null ? void 0 : _N.role) === "admin" ? "管理员" : "普通用户")
      } : {}, {
        r: common_vendor.t(formatDate((_O = order.value) == null ? void 0 : _O.createdAt)),
        s: common_vendor.t(getStatusText((_P = order.value) == null ? void 0 : _P.status)),
        t: common_vendor.n(getStatusClass((_Q = order.value) == null ? void 0 : _Q.status)),
        v: ((_R = order.value) == null ? void 0 : _R.status) === "PENDING"
      }, ((_S = order.value) == null ? void 0 : _S.status) === "PENDING" ? common_vendor.e({
        w: isSeller.value
      }, isSeller.value ? {
        x: common_vendor.o(handleConfirm)
      } : {}, {
        y: !isSeller.value
      }, !isSeller.value ? {
        z: common_vendor.o(handleCancel)
      } : {}) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5511cfa9"]]);
wx.createPage(MiniProgramPage);

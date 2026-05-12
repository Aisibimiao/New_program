"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const activeTab = common_vendor.ref("buy");
    const orderList = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    function getImageUrl(url) {
      if (!url) return "";
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
    function goToDetail(orderId) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
    }
    async function handleCancel(orderId) {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定要取消该订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_order.cancelOrder(orderId);
              common_vendor.index.showToast({ title: "取消成功", icon: "success" });
              loadOrders();
            } catch (err) {
              common_vendor.index.showToast({ title: err.message || "取消失败", icon: "none" });
            }
          }
        }
      });
    }
    async function handleConfirm(orderId) {
      common_vendor.index.showModal({
        title: "确认交易",
        content: "确认已收到货款并交付商品？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_order.confirmOrder(orderId);
              common_vendor.index.showToast({ title: "确认成功", icon: "success" });
              loadOrders();
            } catch (err) {
              common_vendor.index.showToast({ title: err.message || "确认失败", icon: "none" });
            }
          }
        }
      });
    }
    async function loadOrders() {
      refreshing.value = true;
      try {
        if (activeTab.value === "buy") {
          orderList.value = await api_order.getBuyOrders();
        } else {
          orderList.value = await api_order.getSellOrders();
        }
      } catch (err) {
        console.error("加载订单失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        refreshing.value = false;
      }
    }
    function onRefresh() {
      loadOrders();
    }
    common_vendor.watch(activeTab, () => {
      loadOrders();
    });
    common_vendor.onMounted(() => {
      loadOrders();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activeTab.value === "buy" ? 1 : "",
        b: common_vendor.o(($event) => activeTab.value = "buy"),
        c: activeTab.value === "sell" ? 1 : "",
        d: common_vendor.o(($event) => activeTab.value = "sell"),
        e: common_vendor.f(orderList.value, (order, k0, i0) => {
          var _a;
          return common_vendor.e({
            a: common_vendor.t(order.id),
            b: common_vendor.t(getStatusText(order.status)),
            c: common_vendor.n(getStatusClass(order.status)),
            d: getImageUrl((_a = order.goods.images) == null ? void 0 : _a[0]),
            e: common_vendor.t(order.goods.name),
            f: common_vendor.t(order.goods.description),
            g: common_vendor.t(order.goods.price),
            h: common_vendor.o(($event) => goToDetail(order.id), order.id),
            i: common_vendor.t(formatDate(order.createdAt)),
            j: order.status === "PENDING"
          }, order.status === "PENDING" ? {
            k: common_vendor.o(($event) => handleCancel(order.id), order.id)
          } : {}, {
            l: order.status === "PENDING" && activeTab.value === "sell"
          }, order.status === "PENDING" && activeTab.value === "sell" ? {
            m: common_vendor.o(($event) => handleConfirm(order.id), order.id)
          } : {}, {
            n: order.id
          });
        }),
        f: orderList.value.length === 0
      }, orderList.value.length === 0 ? {} : {}, {
        g: refreshing.value,
        h: common_vendor.o(onRefresh)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-80f8e5f8"]]);
wx.createPage(MiniProgramPage);

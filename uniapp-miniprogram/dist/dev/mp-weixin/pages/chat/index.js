"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const api_chat = require("../../api/chat.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const inputText = common_vendor.ref("");
    const messages = common_vendor.ref([]);
    const goodsId = common_vendor.ref("");
    const goodsName = common_vendor.ref("");
    const otherId = common_vendor.ref("");
    const otherAvatar = common_vendor.ref("https://api.dicebear.com/9.x/initials/png?seed=Seller&backgroundColor=b6e3f4");
    const selfAvatar = common_vendor.ref("https://api.dicebear.com/9.x/initials/png?seed=Me&backgroundColor=b6e3f4");
    common_vendor.ref(null);
    const scrollToId = common_vendor.ref("");
    const currentTime = common_vendor.ref("");
    function updateCurrentTime() {
      const now = /* @__PURE__ */ new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      currentTime.value = `${month}月${day}日 ${hours}:${minutes}`;
    }
    function getImageUrl(url) {
      if (!url) return "https://api.dicebear.com/9.x/initials/png?seed=User&backgroundColor=b6e3f4";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function formatTime(dateStr) {
      if (!dateStr) {
        const now = /* @__PURE__ */ new Date();
        return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
      }
      const date = new Date(dateStr);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    function scrollToBottom() {
      common_vendor.nextTick$1(() => {
        const lastIndex = messages.value.length - 1;
        if (lastIndex >= 0) {
          scrollToId.value = `msg-${lastIndex}`;
          setTimeout(() => {
            scrollToId.value = "";
          }, 300);
        }
      });
    }
    async function loadMessages() {
      if (!goodsId.value || !otherId.value) return;
      try {
        const result = await api_chat.getMessages(goodsId.value, otherId.value);
        const messageList2 = result.map((msg) => {
          var _a;
          return {
            content: msg.content,
            time: formatTime(msg.createdAt),
            isSelf: msg.senderId === ((_a = userStore.user) == null ? void 0 : _a.id)
          };
        });
        if (messageList2.length === 0) {
          messages.value = [
            { content: "您好，有什么问题可以问我哦", time: formatTime(), isSelf: false }
          ];
        } else {
          messages.value = messageList2;
        }
        scrollToBottom();
      } catch (err) {
        console.error("加载消息失败", err);
        if (messages.value.length === 0) {
          messages.value = [
            { content: "您好，有什么问题可以问我哦", time: formatTime(), isSelf: false }
          ];
        }
      }
    }
    async function sendMessage() {
      var _a;
      if (!inputText.value.trim()) {
        common_vendor.index.showToast({ title: "请输入消息内容", icon: "none" });
        return;
      }
      if (!userStore.token) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      if (!((_a = userStore.user) == null ? void 0 : _a.id)) {
        common_vendor.index.showToast({ title: "用户信息异常", icon: "none" });
        return;
      }
      if (!goodsId.value) {
        common_vendor.index.showToast({ title: "商品信息异常", icon: "none" });
        return;
      }
      if (!otherId.value) {
        common_vendor.index.showToast({ title: "对方信息异常", icon: "none" });
        return;
      }
      const selfMsg = {
        content: inputText.value,
        time: formatTime(),
        isSelf: true
      };
      messages.value.push(selfMsg);
      inputText.value = "";
      scrollToBottom();
      try {
        common_vendor.index.showLoading({ title: "发送中..." });
        await api_chat.sendMessage({
          goodsId: goodsId.value,
          receiverId: otherId.value,
          content: selfMsg.content
        });
        common_vendor.index.hideLoading();
        setTimeout(() => {
          messages.value.push({
            content: "感谢您的留言，卖家会尽快回复您",
            time: formatTime(),
            isSelf: false
          });
          scrollToBottom();
        }, 1e3);
      } catch (err) {
        common_vendor.index.hideLoading();
        console.error("发送消息失败", err);
        common_vendor.index.showToast({ title: err.message || "发送失败", icon: "none" });
        messages.value.pop();
      }
    }
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.goodsId) goodsId.value = options.goodsId;
      if (options == null ? void 0 : options.goodsName) goodsName.value = decodeURIComponent(options.goodsName);
      if (options == null ? void 0 : options.otherId) otherId.value = options.otherId;
      if (options == null ? void 0 : options.otherAvatar) otherAvatar.value = decodeURIComponent(options.otherAvatar) || "https://api.dicebear.com/9.x/initials/png?seed=Seller&backgroundColor=b6e3f4";
    });
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      if (userStore.user && userStore.user.avatar) {
        selfAvatar.value = userStore.user.avatar;
      } else if (userStore.user) {
        selfAvatar.value = "https://api.dicebear.com/9.x/initials/png?seed=" + encodeURIComponent(userStore.user.nickname || userStore.user.name || "Me") + "&backgroundColor=b6e3f4";
      } else {
        selfAvatar.value = "https://api.dicebear.com/9.x/initials/png?seed=Me&backgroundColor=b6e3f4";
      }
      if (!otherAvatar.value) {
        otherAvatar.value = "https://api.dicebear.com/9.x/initials/png?seed=Seller&backgroundColor=b6e3f4";
      }
      updateCurrentTime();
      common_vendor.index.setNavigationBarTitle({ title: goodsName.value || "联系卖家" });
      loadMessages();
    });
    common_vendor.onShow(() => {
      loadMessages();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(currentTime.value),
        b: common_vendor.f(messages.value, (msg, index, i0) => {
          return {
            a: msg.isSelf ? getImageUrl(selfAvatar.value) : getImageUrl(otherAvatar.value),
            b: common_vendor.t(msg.content),
            c: msg.isSelf ? 1 : "",
            d: index,
            e: `msg-${index}`
          };
        }),
        c: common_vendor.o(loadMessages),
        d: scrollToId.value,
        e: common_vendor.o(sendMessage),
        f: inputText.value,
        g: common_vendor.o(($event) => inputText.value = $event.detail.value),
        h: common_vendor.o(sendMessage)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-da04a0a0"]]);
wx.createPage(MiniProgramPage);

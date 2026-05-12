"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "edit",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const form = common_vendor.ref({
      nickname: "",
      name: "",
      studentId: "",
      phone: "",
      email: "",
      avatar: ""
    });
    function getImageUrl(url) {
      if (!url) return "http://localhost:3000/uploads/default-avatar.png";
      if (url.startsWith("http")) return url;
      return `http://localhost:3000${url}`;
    }
    function chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "上传中..." });
          try {
            const result = await uploadAvatar(tempFilePath);
            form.value.avatar = result.url;
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
          } catch (err) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "上传失败", icon: "none" });
          }
        }
      });
    }
    async function uploadAvatar(filePath) {
      const token = common_vendor.index.getStorageSync("token");
      return new Promise((resolve, reject) => {
        common_vendor.index.uploadFile({
          url: "http://localhost:3000/api/auth/avatar",
          filePath,
          name: "file",
          header: { "Authorization": `Bearer ${token}` },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(data);
              } else {
                reject(new Error(data.msg || "上传失败"));
              }
            } catch {
              reject(new Error("解析响应失败"));
            }
          },
          fail: (err) => {
            reject(new Error(err.errMsg || "上传失败"));
          }
        });
      });
    }
    function validateForm() {
      if (!form.value.nickname.trim()) {
        common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
        return false;
      }
      if (form.value.nickname.length < 2 || form.value.nickname.length > 20) {
        common_vendor.index.showToast({ title: "昵称长度应在2-20个字符之间", icon: "none" });
        return false;
      }
      if (form.value.phone && !/^1[3-9]\d{9}$/.test(form.value.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return false;
      }
      if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        common_vendor.index.showToast({ title: "请输入正确的邮箱格式", icon: "none" });
        return false;
      }
      if (form.value.studentId && !/^[A-Za-z0-9]{4,20}$/.test(form.value.studentId)) {
        common_vendor.index.showToast({ title: "学号格式不正确", icon: "none" });
        return false;
      }
      if (form.value.name && form.value.name.length > 50) {
        common_vendor.index.showToast({ title: "真实姓名不能超过50个字符", icon: "none" });
        return false;
      }
      return true;
    }
    async function handleSave() {
      if (!validateForm()) return;
      common_vendor.index.showLoading({ title: "保存中..." });
      try {
        const result = await utils_request.request({
          url: "/auth/profile",
          method: "PUT",
          data: {
            nickname: form.value.nickname.trim(),
            name: form.value.name.trim(),
            studentId: form.value.studentId.trim(),
            phone: form.value.phone.trim(),
            email: form.value.email.trim(),
            avatar: form.value.avatar
          }
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        if (result.user) {
          userStore.updateUser(result.user);
        } else {
          userStore.updateUser(form.value);
        }
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: err.message || "保存失败", icon: "none" });
      }
    }
    common_vendor.onMounted(() => {
      if (userStore.user) {
        form.value = {
          nickname: userStore.user.nickname || "",
          name: userStore.user.name || "",
          studentId: userStore.user.studentId || "",
          phone: userStore.user.phone || "",
          email: userStore.user.email || "",
          avatar: userStore.user.avatar || ""
        };
      }
    });
    return (_ctx, _cache) => {
      return {
        a: getImageUrl(form.value.avatar),
        b: common_vendor.o(chooseAvatar),
        c: form.value.nickname,
        d: common_vendor.o(($event) => form.value.nickname = $event.detail.value),
        e: form.value.name,
        f: common_vendor.o(($event) => form.value.name = $event.detail.value),
        g: form.value.studentId,
        h: common_vendor.o(($event) => form.value.studentId = $event.detail.value),
        i: form.value.phone,
        j: common_vendor.o(($event) => form.value.phone = $event.detail.value),
        k: form.value.email,
        l: common_vendor.o(($event) => form.value.email = $event.detail.value),
        m: common_vendor.o(handleSave)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cc7a2299"]]);
wx.createPage(MiniProgramPage);

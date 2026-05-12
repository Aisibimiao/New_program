"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "settings",
  setup(__props) {
    const settings = common_vendor.ref({
      notification: true,
      sound: true,
      vibration: true
    });
    const cacheSize = common_vendor.ref("0KB");
    const showPopup = common_vendor.ref(false);
    const popupTitle = common_vendor.ref("");
    const popupText = common_vendor.ref([]);
    const privacyContent = [
      "校园二手平台隐私政策",
      "",
      "更新日期：2026年5月11日",
      "",
      "一、引言",
      '校园二手平台（以下简称"我们"或"平台"）尊重并保护您的隐私。本政策旨在说明我们如何收集、使用、存储、保护和披露您的个人信息。',
      "",
      "二、信息收集",
      "1. 注册信息：用户名、手机号码、验证码、密码",
      "2. 个人资料：头像、昵称、性别、年级、院系",
      "3. 商品信息：发布的商品图片、标题、描述、价格、分类",
      "4. 交易信息：订单记录、支付记录、物流信息",
      "5. 沟通信息：与其他用户的聊天记录",
      "6. 设备信息：设备型号、操作系统、IP地址、使用日志",
      "",
      "三、信息使用",
      "1. 提供和优化平台服务",
      "2. 完成交易和支付流程",
      "3. 保障账户安全和反欺诈",
      "4. 发送服务通知和交易提醒",
      "5. 数据分析和服务改进",
      "",
      "四、信息存储",
      "1. 存储地点：中华人民共和国境内",
      "2. 存储期限：账户存续期间及注销后180天",
      "3. 安全措施：加密传输、访问控制、定期备份",
      "",
      "五、信息共享",
      "1. 不向第三方出售个人信息",
      "2. 交易对方：必要的商品和联系信息",
      "3. 法定要求：向有权机关提供",
      "4. 服务提供商：必要的技术支持（签署保密协议）",
      "",
      "六、用户权利",
      "1. 访问、更正个人信息",
      "2. 申请账户注销",
      "3. 导出个人数据",
      "4. 撤回同意（可能影响部分服务）",
      "",
      "七、未成年人保护",
      "未满18周岁用户需监护人同意，我们不主动收集未成年人信息。",
      "",
      "八、政策变更",
      "我们可能更新政策，重大变更将通知用户。",
      "",
      "九、联系我们",
      "如有疑问，请发送邮件至 support@campusmarket.com"
    ];
    const agreementContent = [
      "校园二手平台用户服务协议",
      "",
      "更新日期：2026年5月11日",
      "",
      "一、服务条款",
      "1. 用户需年满18周岁或获得监护人同意",
      "2. 用户应提供真实、准确的注册信息",
      "3. 用户对账户安全负责，不得转借账户",
      "",
      "二、信息发布规范",
      "1. 商品信息必须真实、准确、完整",
      "2. 禁止发布违法、违规商品（如管制物品）",
      "3. 禁止发布侵权商品（假冒伪劣、盗版）",
      "4. 禁止发布虚假信息和欺诈内容",
      "",
      "三、交易规则",
      "1. 交易双方应遵守诚信原则",
      "2. 买家应及时确认收货",
      "3. 卖家应保证商品质量和交付",
      "4. 交易纠纷可通过平台协商解决",
      "",
      "四、行为规范",
      "1. 禁止恶意骚扰、辱骂其他用户",
      "2. 禁止发布广告和垃圾信息",
      "3. 禁止恶意评价和诋毁",
      "4. 禁止利用平台进行违法活动",
      "",
      "五、平台权利",
      "1. 有权审核、删除违规内容",
      "2. 有权封禁违规账户",
      "3. 有权调整服务规则",
      "",
      "六、免责声明",
      "1. 平台不对商品质量作担保",
      "2. 平台不介入交易纠纷",
      "3. 因不可抗力导致服务中断不承担责任",
      "",
      "七、违约责任",
      "违反本协议将承担法律责任和赔偿义务",
      "",
      "八、协议变更",
      "平台有权更新协议，用户需定期查看",
      "",
      "九、联系我们",
      "如有疑问，请发送邮件至 support@campusmarket.com"
    ];
    common_vendor.onMounted(() => {
      const saved = common_vendor.index.getStorageSync("settings");
      if (saved) {
        settings.value = saved;
      }
      cacheSize.value = "12.5MB";
    });
    function toggleNotification() {
      settings.value.notification = !settings.value.notification;
      saveSettings();
    }
    function toggleSound() {
      settings.value.sound = !settings.value.sound;
      saveSettings();
    }
    function toggleVibration() {
      settings.value.vibration = !settings.value.vibration;
      saveSettings();
    }
    function onNotificationChange(e) {
      settings.value.notification = e.detail.value;
      saveSettings();
    }
    function onSoundChange(e) {
      settings.value.sound = e.detail.value;
      saveSettings();
    }
    function onVibrationChange(e) {
      settings.value.vibration = e.detail.value;
      saveSettings();
    }
    function saveSettings() {
      common_vendor.index.setStorageSync("settings", settings.value);
    }
    function clearCache() {
      common_vendor.index.showModal({
        title: "清除缓存",
        content: "确定要清除所有缓存吗？",
        success: (res) => {
          if (res.confirm) {
            cacheSize.value = "0KB";
            common_vendor.index.showToast({ title: "清除成功", icon: "success" });
          }
        }
      });
    }
    function checkUpdate() {
      common_vendor.index.showToast({ title: "已是最新版本", icon: "success" });
    }
    function showPrivacy() {
      popupTitle.value = "隐私政策";
      popupText.value = privacyContent;
      showPopup.value = true;
    }
    function showAgreement() {
      popupTitle.value = "用户协议";
      popupText.value = agreementContent;
      showPopup.value = true;
    }
    function showAbout() {
      common_vendor.index.showModal({
        title: "关于我们",
        content: "校园二手平台 v1.0.0\n致力于为在校学生提供便捷的闲置物品交易服务",
        showCancel: false
      });
    }
    function closePopup() {
      showPopup.value = false;
    }
    function logout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.reLaunch({ url: "/pages/user/login" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: settings.value.notification,
        b: common_vendor.o(onNotificationChange),
        c: common_vendor.o(toggleNotification),
        d: settings.value.sound,
        e: common_vendor.o(onSoundChange),
        f: common_vendor.o(toggleSound),
        g: settings.value.vibration,
        h: common_vendor.o(onVibrationChange),
        i: common_vendor.o(toggleVibration),
        j: common_vendor.t(cacheSize.value),
        k: common_vendor.o(clearCache),
        l: common_vendor.o(checkUpdate),
        m: common_vendor.o(showPrivacy),
        n: common_vendor.o(showAgreement),
        o: common_vendor.o(showAbout),
        p: common_vendor.o(logout),
        q: showPopup.value
      }, showPopup.value ? {
        r: common_vendor.t(popupTitle.value),
        s: common_vendor.f(popupText.value, (txt, idx, i0) => {
          return common_vendor.e({
            a: txt
          }, txt ? {
            b: common_vendor.t(txt)
          } : {}, {
            c: idx
          });
        }),
        t: common_vendor.o(closePopup),
        v: common_vendor.o(() => {
        }),
        w: common_vendor.o(closePopup)
      } : {});
    };
  }
});
wx.createPage(_sfc_main);

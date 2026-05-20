"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "settings",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const settings = common_vendor.ref({
      tradeReminder: true
    });
    const cacheSize = common_vendor.ref("0KB");
    const showPopup = common_vendor.ref(false);
    const popupTitle = common_vendor.ref("");
    const popupText = common_vendor.ref([]);
    const showPrivacyPopup = common_vendor.ref(false);
    const privacySetting = common_vendor.ref("all");
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
      "用户服务协议",
      "",
      "您好，您在使用过程中必须遵守以下协议条款，否则平台有权对您的账户进行限制账号功能，封禁等，对涉嫌违法犯罪的将交由公安机关和司法机关进行处罚，并因此导致第三方用户或本平台损失的，您应承担全部法律责任和赔偿责任：",
      "",
      "（以下内容约束您在小程序提交、发布的所有信息，包括但不限于商品信息、求购信息、个人信息、发布言论、以及操作行为等）",
      "",
      "1.信息条款(有以下情况视为违反)",
      "",
      "(1)违反国家法律法规、破坏国家统一、煽动民族仇恨、民族歧视、破坏民族团结的；",
      "(2)损害国家机关信誉、进行政治宣传或破坏国家宗教政策的；",
      "(3)宣扬封建迷信、淫秽、色情、赌博、暴力、凶杀、恐怖或教唆犯罪的；",
      "(4)侮辱、诽谤、恐吓、散播涉及他人隐私等侵害他人合法权益的；",
      "(5)捏造、歪曲或掩盖事实，从事欺诈、虚假不准确或误导性行为，扰乱社会秩序、平台交易秩序的；",
      "(6)侵犯他人知识产权或涉及第三方商业秘密及其他专有权利的；",
      "(7)存在可能破坏、篡改、删除、影响本平台小程序正常运行的；",
      "(8)未经授权通过病毒木马、爬虫等恶意软件、程序代码秘密获取本小程序及其他用户的数据、危害社会公共利益或公共道德的；",
      "(9)其他违背社会公共利益或公共道德的。",
      "",
      "2.行为条款(有以下情况视为违反)",
      "",
      "(1)进行骗取他人钱财的欺诈行为；",
      "(2)发布泄露他人隐私内容的行为；",
      "(3)发布诈骗他人钱财的欺诈行为；",
      "(4)发布垃圾信息行为；",
      "(5)发布闲置物品描述与实际不符的信息行为；",
      "(6)以牟利或借机进行敲诈勒索为目的的恶意行为；",
      "(7)进行其他明显违反平等、公平、自愿等交易原则的违法违规行为；",
      "(8)发布和交易国家法律法规不允许交易或者需要特殊资质方可交易的商品（包括但不限于枪支弹药、香烟、药品等）；",
      "(9)发布正在流通和销毁人民币行为；",
      "(10)发布假票或欺诈行为，进行人身攻击行为；",
      "(11)发布侮辱、诽谤他人，进行人身攻击行为；",
      "(12)其他违背社会公共利益或违反公共道德或违法的行为。",
      "",
      "3.声明条款及免责声明",
      "",
      "本平台仅提供二手闲置的信息发布和展示，也不参与用户之间二手闲置的资金交易，也不收取任何交易费用，用户双方在私下交易过程中产生的纠纷或不法侵害或造成损失的，本平台概不负责，请自行甄别信息，自行把控，您已同意和其他用户当面交易验货，本平台概不负责，请自行甄别信息，自行把控，您已同意和其他用户当面交易验货。"
    ];
    function goBack() {
      common_vendor.index.navigateBack();
    }
    common_vendor.onMounted(() => {
      const saved = common_vendor.index.getStorageSync("settings");
      if (saved) {
        settings.value = saved;
      }
      const privacy = common_vendor.index.getStorageSync("privacySetting");
      if (privacy) {
        privacySetting.value = privacy;
      }
      cacheSize.value = "12.5MB";
    });
    function onTradeReminderChange(e) {
      settings.value.tradeReminder = e.detail.value;
      saveSettings();
    }
    function saveSettings() {
      common_vendor.index.setStorageSync("settings", settings.value);
    }
    function showPrivacySettings() {
      showPrivacyPopup.value = true;
    }
    function closePrivacyPopup() {
      showPrivacyPopup.value = false;
    }
    function onPrivacyChange(e) {
      privacySetting.value = e.detail.value;
      common_vendor.index.setStorageSync("privacySetting", privacySetting.value);
    }
    function clearCache() {
      common_vendor.index.showModal({
        title: "清理缓存",
        content: "确定要清理所有缓存吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            settings.value = { tradeReminder: true };
            privacySetting.value = "all";
            cacheSize.value = "0KB";
            common_vendor.index.showToast({ title: "清理成功", icon: "success" });
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
      common_vendor.index.navigateTo({ url: "/pages/user/about" });
    }
    function closePopup() {
      showPopup.value = false;
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "退出后将无法同步收藏和发布记录，是否继续？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            userStore.logout();
            common_vendor.index.reLaunch({ url: "/pages/user/login" });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "arrow-left"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          name: "bell"
        }),
        d: settings.value.tradeReminder,
        e: common_vendor.o(onTradeReminderChange),
        f: common_vendor.p({
          name: "users"
        }),
        g: common_vendor.p({
          name: "chevron-right"
        }),
        h: common_vendor.o(showPrivacySettings),
        i: common_vendor.p({
          name: "trash"
        }),
        j: common_vendor.t(cacheSize.value),
        k: common_vendor.o(clearCache),
        l: common_vendor.p({
          name: "refresh"
        }),
        m: common_vendor.o(checkUpdate),
        n: common_vendor.p({
          name: "lock"
        }),
        o: common_vendor.p({
          name: "chevron-right"
        }),
        p: common_vendor.o(showPrivacy),
        q: common_vendor.p({
          name: "file"
        }),
        r: common_vendor.p({
          name: "chevron-right"
        }),
        s: common_vendor.o(showAgreement),
        t: common_vendor.p({
          name: "info"
        }),
        v: common_vendor.p({
          name: "chevron-right"
        }),
        w: common_vendor.o(showAbout),
        x: common_vendor.p({
          name: "door"
        }),
        y: common_vendor.o(handleLogout),
        z: showPopup.value
      }, showPopup.value ? {
        A: common_vendor.t(popupTitle.value),
        B: common_vendor.f(popupText.value, (txt, idx, i0) => {
          return common_vendor.e({
            a: txt
          }, txt ? {
            b: common_vendor.t(txt)
          } : {}, {
            c: idx
          });
        }),
        C: common_vendor.o(closePopup),
        D: common_vendor.o(() => {
        }),
        E: common_vendor.o(closePopup)
      } : {}, {
        F: showPrivacyPopup.value
      }, showPrivacyPopup.value ? {
        G: privacySetting.value === "all",
        H: privacySetting.value === "friend",
        I: privacySetting.value === "none",
        J: common_vendor.o(onPrivacyChange),
        K: common_vendor.o(closePrivacyPopup),
        L: common_vendor.o(() => {
        }),
        M: common_vendor.o(closePrivacyPopup)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-707b9ec7"]]);
wx.createPage(MiniProgramPage);

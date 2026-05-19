<template>
  <view class="line-settings-container">
    <view class="line-header-bar">
      <view class="line-back-btn" @click="goBack">
        <LineIcon name="arrow-left" />
      </view>
      <text class="line-header-title">设置</text>
      <view class="line-header-right">
        <view class="line-header-dot"></view>
      </view>
    </view>

    <scroll-view class="line-content-scroll" scroll-y>
      <view class="line-menu-group">
        <view class="line-menu-item">
          <view class="line-menu-icon">
            <LineIcon name="bell" />
          </view>
          <text class="line-menu-label">交易提醒</text>
          <switch class="line-menu-switch" :checked="settings.tradeReminder" @change="onTradeReminderChange" color="#3f37c9" />
        </view>
        <view class="line-menu-item" @click="showPrivacySettings">
          <view class="line-menu-icon">
            <LineIcon name="users" />
          </view>
          <text class="line-menu-label">允许谁联系我</text>
          <view class="line-menu-arrow">
            <LineIcon name="chevron-right" />
          </view>
        </view>
      </view>

      <view class="line-menu-group">
        <view class="line-menu-item" @click="clearCache">
          <view class="line-menu-icon">
            <LineIcon name="trash" />
          </view>
          <text class="line-menu-label">清理缓存</text>
          <text class="line-menu-value">{{ cacheSize }}</text>
        </view>
        <view class="line-menu-item" @click="checkUpdate">
          <view class="line-menu-icon">
            <LineIcon name="refresh" />
          </view>
          <text class="line-menu-label">版本更新</text>
          <text class="line-menu-value">v1.0.0</text>
        </view>
      </view>

      <view class="line-menu-group">
        <view class="line-menu-item" @click="showPrivacy">
          <view class="line-menu-icon">
            <LineIcon name="lock" />
          </view>
          <text class="line-menu-label">隐私政策</text>
          <view class="line-menu-arrow">
            <LineIcon name="chevron-right" />
          </view>
        </view>
        <view class="line-menu-item" @click="showAgreement">
          <view class="line-menu-icon">
            <LineIcon name="file" />
          </view>
          <text class="line-menu-label">用户协议</text>
          <view class="line-menu-arrow">
            <LineIcon name="chevron-right" />
          </view>
        </view>
        <view class="line-menu-item" @click="showAbout">
          <view class="line-menu-icon">
            <LineIcon name="info" />
          </view>
          <text class="line-menu-label">关于我们</text>
          <view class="line-menu-arrow">
            <LineIcon name="chevron-right" />
          </view>
        </view>
      </view>

      <view class="line-menu-group">
        <view class="line-menu-item" @click="handleLogout">
          <view class="line-menu-icon">
            <LineIcon name="door" />
          </view>
          <text class="line-menu-label line-logout-text">退出登录</text>
        </view>
      </view>

      <view class="line-bottom-space"></view>
    </scroll-view>

    <view class="line-popup-mask" v-if="showPopup" @click="closePopup">
      <view class="line-popup-content" @click.stop>
        <view class="line-popup-header">
          <text class="line-popup-title">{{ popupTitle }}</text>
        </view>
        <scroll-view class="line-popup-body" scroll-y="true">
          <view class="line-popup-text">
            <block v-for="(txt, idx) in popupText" :key="idx">
              <text class="line-text-line" v-if="txt">{{ txt }}</text>
              <view class="line-empty-line" v-else></view>
            </block>
          </view>
        </scroll-view>
        <view class="line-popup-footer">
          <view class="line-popup-btn" @click="closePopup">确认</view>
        </view>
      </view>
    </view>

    <view class="line-popup-mask" v-if="showPrivacyPopup" @click="closePrivacyPopup">
      <view class="line-popup-content" @click.stop>
        <view class="line-popup-header">
          <text class="line-popup-title">允许谁联系我</text>
        </view>
        <view class="line-popup-body">
          <radio-group @change="onPrivacyChange">
            <label class="line-privacy-option">
              <radio value="all" :checked="privacySetting === 'all'" color="#3f37c9" />
              <text class="line-privacy-label">所有人</text>
            </label>
            <label class="line-privacy-option">
              <radio value="friend" :checked="privacySetting === 'friend'" color="#3f37c9" />
              <text class="line-privacy-label">仅好友</text>
            </label>
            <label class="line-privacy-option">
              <radio value="none" :checked="privacySetting === 'none'" color="#3f37c9" />
              <text class="line-privacy-label">不允许</text>
            </label>
          </radio-group>
        </view>
        <view class="line-popup-footer">
          <view class="line-popup-btn" @click="closePrivacyPopup">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import LineIcon from '@/components/LineIcon.vue'

const userStore = useUserStore()

const settings = ref({
  tradeReminder: true
})

const cacheSize = ref('0KB')
const showPopup = ref(false)
const popupTitle = ref('')
const popupText = ref<string[]>([])
const showPrivacyPopup = ref(false)
const privacySetting = ref('all')

const privacyContent = [
  '校园二手平台隐私政策',
  '',
  '更新日期：2026年5月11日',
  '',
  '一、引言',
  '校园二手平台（以下简称"我们"或"平台"）尊重并保护您的隐私。本政策旨在说明我们如何收集、使用、存储、保护和披露您的个人信息。',
  '',
  '二、信息收集',
  '1. 注册信息：用户名、手机号码、验证码、密码',
  '2. 个人资料：头像、昵称、性别、年级、院系',
  '3. 商品信息：发布的商品图片、标题、描述、价格、分类',
  '4. 交易信息：订单记录、支付记录、物流信息',
  '5. 沟通信息：与其他用户的聊天记录',
  '6. 设备信息：设备型号、操作系统、IP地址、使用日志',
  '',
  '三、信息使用',
  '1. 提供和优化平台服务',
  '2. 完成交易和支付流程',
  '3. 保障账户安全和反欺诈',
  '4. 发送服务通知和交易提醒',
  '5. 数据分析和服务改进',
  '',
  '四、信息存储',
  '1. 存储地点：中华人民共和国境内',
  '2. 存储期限：账户存续期间及注销后180天',
  '3. 安全措施：加密传输、访问控制、定期备份',
  '',
  '五、信息共享',
  '1. 不向第三方出售个人信息',
  '2. 交易对方：必要的商品和联系信息',
  '3. 法定要求：向有权机关提供',
  '4. 服务提供商：必要的技术支持（签署保密协议）',
  '',
  '六、用户权利',
  '1. 访问、更正个人信息',
  '2. 申请账户注销',
  '3. 导出个人数据',
  '4. 撤回同意（可能影响部分服务）',
  '',
  '七、未成年人保护',
  '未满18周岁用户需监护人同意，我们不主动收集未成年人信息。',
  '',
  '八、政策变更',
  '我们可能更新政策，重大变更将通知用户。',
  '',
  '九、联系我们',
  '如有疑问，请发送邮件至 support@campusmarket.com'
]

const agreementContent = [
  '用户服务协议',
  '',
  '您好，您在使用过程中必须遵守以下协议条款，否则平台有权对您的账户进行限制账号功能，封禁等，对涉嫌违法犯罪的将交由公安机关和司法机关进行处罚，并因此导致第三方用户或本平台损失的，您应承担全部法律责任和赔偿责任：',
  '',
  '（以下内容约束您在小程序提交、发布的所有信息，包括但不限于商品信息、求购信息、个人信息、发布言论、以及操作行为等）',
  '',
  '1.信息条款(有以下情况视为违反)',
  '',
  '(1)违反国家法律法规、破坏国家统一、煽动民族仇恨、民族歧视、破坏民族团结的；',
  '(2)损害国家机关信誉、进行政治宣传或破坏国家宗教政策的；',
  '(3)宣扬封建迷信、淫秽、色情、赌博、暴力、凶杀、恐怖或教唆犯罪的；',
  '(4)侮辱、诽谤、恐吓、散播涉及他人隐私等侵害他人合法权益的；',
  '(5)捏造、歪曲或掩盖事实，从事欺诈、虚假不准确或误导性行为，扰乱社会秩序、平台交易秩序的；',
  '(6)侵犯他人知识产权或涉及第三方商业秘密及其他专有权利的；',
  '(7)存在可能破坏、篡改、删除、影响本平台小程序正常运行的；',
  '(8)未经授权通过病毒木马、爬虫等恶意软件、程序代码秘密获取本小程序及其他用户的数据、危害社会公共利益或公共道德的；',
  '(9)其他违背社会公共利益或公共道德的。',
  '',
  '2.行为条款(有以下情况视为违反)',
  '',
  '(1)进行骗取他人钱财的欺诈行为；',
  '(2)发布泄露他人隐私内容的行为；',
  '(3)发布诈骗他人钱财的欺诈行为；',
  '(4)发布垃圾信息行为；',
  '(5)发布闲置物品描述与实际不符的信息行为；',
  '(6)以牟利或借机进行敲诈勒索为目的的恶意行为；',
  '(7)进行其他明显违反平等、公平、自愿等交易原则的违法违规行为；',
  '(8)发布和交易国家法律法规不允许交易或者需要特殊资质方可交易的商品（包括但不限于枪支弹药、香烟、药品等）；',
  '(9)发布正在流通和销毁人民币行为；',
  '(10)发布假票或欺诈行为，进行人身攻击行为；',
  '(11)发布侮辱、诽谤他人，进行人身攻击行为；',
  '(12)其他违背社会公共利益或违反公共道德或违法的行为。',
  '',
  '3.声明条款及免责声明',
  '',
  '本平台仅提供二手闲置的信息发布和展示，也不参与用户之间二手闲置的资金交易，也不收取任何交易费用，用户双方在私下交易过程中产生的纠纷或不法侵害或造成损失的，本平台概不负责，请自行甄别信息，自行把控，您已同意和其他用户当面交易验货，本平台概不负责，请自行甄别信息，自行把控，您已同意和其他用户当面交易验货。'
]

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  const saved = uni.getStorageSync('settings')
  if (saved) {
    settings.value = saved
  }
  const privacy = uni.getStorageSync('privacySetting')
  if (privacy) {
    privacySetting.value = privacy
  }
  cacheSize.value = '12.5MB'
})

function onTradeReminderChange(e: any) {
  settings.value.tradeReminder = e.detail.value
  saveSettings()
}

function saveSettings() {
  uni.setStorageSync('settings', settings.value)
}

function showPrivacySettings() {
  showPrivacyPopup.value = true
}

function closePrivacyPopup() {
  showPrivacyPopup.value = false
}

function onPrivacyChange(e: any) {
  privacySetting.value = e.detail.value
  uni.setStorageSync('privacySetting', privacySetting.value)
}

function clearCache() {
  uni.showModal({
    title: '清理缓存',
    content: '确定要清理所有缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        settings.value = { tradeReminder: true }
        privacySetting.value = 'all'
        cacheSize.value = '0KB'
        uni.showToast({ title: '清理成功', icon: 'success' })
      }
    }
  })
}

function checkUpdate() {
  uni.showToast({ title: '已是最新版本', icon: 'success' })
}

function showPrivacy() {
  popupTitle.value = '隐私政策'
  popupText.value = privacyContent
  showPopup.value = true
}

function showAgreement() {
  popupTitle.value = '用户协议'
  popupText.value = agreementContent
  showPopup.value = true
}

function showAbout() {
  uni.navigateTo({ url: '/pages/user/about' })
}

function closePopup() {
  showPopup.value = false
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '退出后将无法同步收藏和发布记录，是否继续？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        userStore.logout()
        uni.reLaunch({ url: '/pages/user/login' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/line-ui.scss';

.line-settings-container {
  min-height: 100vh;
  background-color: $line-bg;
  display: flex;
  flex-direction: column;
}

.line-content-scroll {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.line-menu-group {
  background-color: #fff;
  border: $line-normal solid $line-border;
  border-radius: $line-radius;
  margin-bottom: 24rpx;
  overflow: hidden;
  position: relative;
}

.line-menu-group::before {
  content: '';
  position: absolute;
  top: -6rpx;
  left: 24rpx;
  right: 24rpx;
  height: 6rpx;
  background: repeating-linear-gradient(
    90deg,
    $line-border 0rpx,
    $line-border 8rpx,
    transparent 8rpx,
    transparent 16rpx
  );
}

.line-menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: $line-thin dashed $line-border;
  &:last-child {
    border-bottom: none;
  }
}

.line-menu-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 20rpx;
  color: $line-primary;
}

.line-menu-label {
  flex: 1;
  font-size: $line-font-md;
  color: $line-primary;
}

.line-logout-text {
  color: $line-danger;
}

.line-menu-value {
  font-size: $line-font-sm;
  color: $line-light;
  margin-right: 10rpx;
}

.line-menu-arrow {
  width: 24rpx;
  height: 24rpx;
  color: $line-light;
}

.line-menu-switch {
  transform: scale(0.9);
}

.line-bottom-space {
  height: 40rpx;
}

/* 弹窗样式 */
.line-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.line-popup-content {
  width: 680rpx;
  max-height: 80vh;
  background-color: #ffffff;
  border: $line-normal solid $line-primary;
  border-radius: $line-radius;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.line-popup-header {
  padding: 30rpx;
  text-align: center;
  background-color: #ffffff;
  border-bottom: $line-thin solid $line-border;
}

.line-popup-title {
  font-size: $line-font-lg;
  font-weight: 600;
  color: $line-primary;
}

.line-popup-body {
  flex: 1;
  padding: 30rpx 15rpx 30rpx 30rpx;
  max-height: 60vh;
  box-sizing: border-box;
  word-break: break-all;
  -webkit-overflow-scrolling: touch;
  width: calc(100% + 15rpx);
  margin-right: -5rpx;
}

.line-popup-body::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.line-popup-text {
  line-height: 1.8;
}

.line-text-line {
  display: block;
  font-size: $line-font-sm;
  color: $line-primary;
  margin-bottom: 12rpx;
}

.line-empty-line {
  height: 15rpx;
}

.line-popup-footer {
  padding: 25rpx 30rpx;
  border-top: $line-thin solid $line-border;
}

.line-popup-btn {
  text-align: center;
  padding: 25rpx;
  background-color: $line-primary;
  border: $line-normal solid $line-primary;
  color: #ffffff;
  border-radius: $line-radius-sm;
  font-size: $line-font-md;
  font-weight: 600;
}

.line-privacy-option {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: $line-thin dashed $line-border;
  &:last-child {
    border-bottom: none;
  }
}

.line-privacy-label {
  margin-left: 16rpx;
  font-size: $line-font-md;
  color: $line-primary;
}
</style>

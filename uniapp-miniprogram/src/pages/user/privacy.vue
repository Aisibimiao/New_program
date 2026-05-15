<template>
  <view class="privacy-container">
    <scroll-view class="content-scroll" scroll-y>
      <view class="content-section">
        <text class="section-title">隐私政策</text>
        <text class="section-date">更新日期：2026年5月11日</text>

        <view class="article">
          <text class="article-title">一、引言</text>
          <text class="article-content">
            校园二手平台（以下简称"我们"或"平台"）尊重并保护您的隐私。本政策旨在说明我们如何收集、使用、存储、保护和披露您的个人信息。
          </text>
        </view>

        <view class="article">
          <text class="article-title">二、信息收集</text>
          <text class="article-content">
            1. 注册信息：用户名、手机号码、验证码、密码
            2. 个人资料：头像、昵称、性别、年级、院系
            3. 商品信息：发布的商品图片、标题、描述、价格、分类
            4. 交易信息：订单记录、支付记录、物流信息
            5. 沟通信息：与其他用户的聊天记录
            6. 设备信息：设备型号、操作系统、IP地址、使用日志
          </text>
        </view>

        <view class="article">
          <text class="article-title">三、信息使用</text>
          <text class="article-content">
            1. 提供和优化平台服务
            2. 完成交易和支付流程
            3. 保障账户安全和反欺诈
            4. 发送服务通知和交易提醒
            5. 数据分析和服务改进
          </text>
        </view>

        <view class="article">
          <text class="article-title">四、信息存储</text>
          <text class="article-content">
            1. 存储地点：中华人民共和国境内
            2. 存储期限：账户存续期间及注销后180天
            3. 安全措施：加密传输、访问控制、定期备份
          </text>
        </view>

        <view class="article">
          <text class="article-title">五、信息共享</text>
          <text class="article-content">
            1. 不向第三方出售个人信息
            2. 交易对方：必要的商品和联系信息
            3. 法定要求：向有权机关提供
            4. 服务提供商：必要的技术支持（签署保密协议）
          </text>
        </view>

        <view class="article">
          <text class="article-title">六、用户权利</text>
          <text class="article-content">
            1. 访问、更正个人信息
            2. 申请账户注销
            3. 导出个人数据
            4. 撤回同意（可能影响部分服务）
          </text>
        </view>

        <view class="article">
          <text class="article-title">七、未成年人保护</text>
          <text class="article-content">
            未满18周岁用户需监护人同意，我们不主动收集未成年人信息。
          </text>
        </view>

        <view class="article">
          <text class="article-title">八、政策变更</text>
          <text class="article-content">
            我们可能更新政策，重大变更将通知用户。
          </text>
        </view>

        <view class="article">
          <text class="article-title">九、联系我们</text>
          <text class="article-content">
            如有疑问，请发送邮件至 support@campus-market.com
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.privacy-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content-scroll {
  height: 100vh;
}

.content-section {
  padding: 30rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
}

.section-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 15rpx;
}

.section-date {
  display: block;
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
}

.article {
  margin-bottom: 40rpx;
}

.article-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.article-content {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  text-align: justify;
}
</style>
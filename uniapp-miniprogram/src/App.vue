<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 初始化云开发
  if (typeof uni.cloud !== 'undefined') {
    uni.cloud.init({
      env: 'cloudbase-d9dg3iiqp40c9067a'
    })
    console.log('云开发初始化成功')
  } else {
    console.log('当前环境不支持云开发')
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './styles/variables.scss';

page {
  background-color: $bg-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.5;
  box-sizing: border-box;
}

view, text, image {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  outline: none;
}

button::after {
  border: none;
}

input {
  outline: none;
}

scroll-view {
  -webkit-overflow-scrolling: touch;
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>

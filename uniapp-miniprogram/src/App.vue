<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
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

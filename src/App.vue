<template>
  <div id="nav">
    <router-link to="/">天气预报</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view/>
</template>

<style lang="less">
@import '~@assets/styles/less/common.less';
@import '~@assets/styles/less/custom.less';

// 避免vw的副作用
img {
    content: normal !important;
}

#app {
  height: 100%;
  font-size: 28px;
}

#nav {
  height: 100px;
  padding: 30px;
  // 测试less全局变量
  .selfColor(#f01010);
  // 测试自动添加前缀
  border-radius: 10px;
  
  a {
    font-weight: bold;
    color: @text-color;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

</style>

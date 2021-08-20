<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style lang="less" scoped>
.about {
    .selfColor(yellow);
    // 解决1px
    .border-1px(#000, 10px, all);
    // 修复图片模糊
    // .avatar();
}
</style>

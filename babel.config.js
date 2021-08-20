module.exports = {
  presets: [
    ['@vue/app',{
      polyfills: [
        'es.promise',
        'es.symbol'
      ]
    }]
  ]
  // presets: [
  //   '@vue/cli-plugin-babel/preset'
  // ]
}

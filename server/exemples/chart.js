const asciichart = require ('asciichart')

module.exports = function (list, size='l') {
  let s0 = new Array(list.length);

  for (let i = 0; i < list.length; i++){
    s0[i] = list[i]
  }

  let height = (size ==='s') ? 20 : 30
  if(size==='xs') height = 10;
  console.log (asciichart.plot(s0, {
    height:height,
    precision:8
  }))
}
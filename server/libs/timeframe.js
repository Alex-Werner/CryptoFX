const specs = [
  //If our tick are too big to fulfill less than 1mn
  //Eg : Each tick are separed by 1m, but we ask 20s, what do we do ?
  //For now, just comment them
  {name: '20s', margin: 20},
  {name: '40s', margin: 40},
  {name: '1m', margin: 60},
  {name: '2m', margin: 2 * 60 },
  {name: '5m', margin: 5 * 60 },
  {name: '15m', margin: 15 * 60 },
  {name: '30m', margin: 30 * 60 },
  {name: '1h', margin: 1 * 60 * 60 },
  {name: '2h', margin: 2 * 60 * 60 },
  {name: '3h', margin: 3 * 60 * 60},
  {name: '4h', margin: 4 * 60 * 60 },
  {name: '6h', margin: 6 * 60 * 60 },
  {name: '8h', margin: 8 * 60 * 60 },
  {name: '1d', margin: 24 * 60 * 60},
  {name: '1w', margin: 7 * 24 * 60 * 60}
]
class Timeframe {
  constructor(name){
    /*if(input){
      if(input.constructor.name=='String'){
        this.name = input;
        this.margin =
      }
    }*/
    let find = specs.filter(function (el) {
      return(el.name===name)
    })[0]

    this.name = find.name;
    this.margin =find.margin
  }
}

module.exports = Timeframe;
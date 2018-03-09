class Logger {
  //If a path is set, we log in file TODO
  constructor(options={level:'INFO'}) {
    let self = this;
    let LEVELS = [
      'FATAL',
      'ERROR',
      'WARN',
      'NOTICE',
      'INFO',
      'DEBUG',
      'VERBOSE'
    ];
    this.log = function () {
      let _log = "";
      let level = 4;//By default we display from info to fatal.
      let args = Array.prototype.slice.call(arguments);

      //We need to check if the first args is one of the level designed.
      if (args && args.length > 1 && LEVELS.indexOf(args[0].toUpperCase()) > -1) {
        level = LEVELS.indexOf(args[0].toUpperCase());
        args.shift();//Remove the level in order to avoid displaying it.
      }
      args.forEach(function (el) {
        if (typeof el === 'string') {
          _log += " " + el;
        } else {
          _log += ' ' + util.inspect(el, false, null);
        }
      });
      if (level <= self.level) {
        console.log(_log);
      }
    };

    //We create function for each of the different type of levels
    LEVELS.forEach(function (name, index) {
      self[name] = index;
      self[name.toLowerCase()] = function () {
        let args = Array.prototype.slice.call(arguments);//We take all args passed by
        args.unshift(name);//We add the level as first args
        self.log.apply(null,args);//And we convert again to arguments
      };
    });

    this.level = self[options.level] || self['INFO'];
  }
}

module.exports = Logger;
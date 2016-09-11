var serverRequire = {
    reqRoot: function (dirname) {
        var path = require('path');
        var appDir = path.dirname(require.main.filename);
        var isWin = /^win/.test(process.platform);
        
        if (isWin) {
            var appRootPath = appDir + "\\";
        } else {
            var appRootPath = appDir + "/";
        }
        
        return require(appRootPath + dirname);
    }
    
}

module.exports = serverRequire.reqRoot;
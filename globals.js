var Globals = {
    reqRoot:require('./globals.require.js'),
    import:function(){
        for (var i = 0,n=Object.keys(Globals);i<n.length; i++){
            var key = n[i];
            if(key=='import')
                continue;
            if(key=='Promise'){
                //Special overwrite as global.Promise already exist
                global[key]=Globals[key];
                continue;
            }
            if(!global.hasOwnProperty(key) && Globals.hasOwnProperty(key)){
                global[key]=Globals[key];
                console.info('Importing global.'+key);
            }else{
                var alreadyExist = global.hasOwnProperty(key);
                var doNotExist = Globals.hasOwnProperty(key);
                
                console.error('Failed to import global.'+key);
            }
            
        }
    },
    /**
     * Works like console.log, but it return the args passed.
     *
     * If no arg passed, it just return the time
     * If only one arg is passed, it return the arg, if many it return array
     * @returns {Arguments}
     */
    cl:function(){
        if(arguments.length==0){
            var t = new Date().getTime();
            console.log(t);
            return t;
        }
        console.log.apply(console, arguments);
        if(arguments.length==1){
            return arguments[0];
        }
        return arguments;
    },
    // async:require('asyncawait/async'),
    // await:require('asyncawait/await'),
    // Promise:require('bluebird')
};
module.exports = Globals;
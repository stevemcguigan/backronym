module.exports.randomNumber = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
} 

module.exports.compare = function( a, b ) {
  if ( a.score< b.score ){
    return -1;
  }
  if ( a.score > b.score ){
    return 1;
  }
  return 0;
}

module.exports.guid = function () { 
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

module.exports.coinFlip = function() {
    return (Math.floor(Math.random() * 2) == 0);
}

module.exports.randomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
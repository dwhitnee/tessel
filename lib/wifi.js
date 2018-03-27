/* the wifi-cc3000 library is bundled in with Tessel's firmware,
 * so there's no need for an npm install. It's similar
 * to how require('tessel') works.
 */

var wifi = require('wifi-cc3000');
var network = "whitney";  // David's iPhone";   // SSID
var pass = "hihihihi"; // "12345678";     // FIXME: put in your password here, or leave blank for unsecured
var security = 'wpa2';     // other options are 'wep', 'wpa', or 'unsecured'
var timeouts = 0;

wifi.on('connect', function(data){
  console.log("Wifi connected to " + data.ssid + " on " + data.ip);
});

wifi.on('disconnect', function(data){
  console.log("Wifi disconnected", data);
  reconnect();
});


wifi.on('timeout', function(err) {
  // tried to connect but couldn't, retry
  console.log("timeout connecting to wifi");
  timeouts++;
  if (timeouts > 2) {
    powerCycle();    // reset the wifi chip if we've timed out too many times
  } else {
    reconnect();
  }
});


wifi.on('error', function(err){
  // one of the following happened
  // 1. tried to disconnect while not connected
  // 2. tried to disconnect while in the middle of trying to connect
  // 3. tried to initialize a connection without first waiting for a timeout or a disconnect
  console.log("Wifi error", err);
});


// reset the wifi chip progammatically
function powerCycle(){
  // when the wifi chip resets, it will automatically try to reconnect
  // to the last saved network

  wifi.reset( function() {
    timeouts = 0; // reset timeouts
    console.log("done power cycling");

    // give it some time to auto reconnect
    setTimeout(function(){
      if (!wifi.isConnected()) {
        reconnect();
      }
      }, 20 *1000); // 20 second wait
  });
}


function reconnect(){
  console.log("Connecting to wifi ("+network+")...");

  wifi.connect({
    security: security,
    ssid: network,
    password: pass,
    timeout: 30 // in seconds
  });
}

// connect wifi now, if not already connected
if (!wifi.isConnected()) {
  reconnect();
}


module.exports = wifi;

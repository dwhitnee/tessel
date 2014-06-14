//----------------------------------------------------------------------
//  A simple web server to run on a Tessel that will blink when hit
//----------------------------------------------------------------------

var tessel = require('tessel');  // the hardware
var http = require('http');      // the interwebs
var url = require('url');

var port = 8000;

var Tessel = {
  //----------------------------------------
  blink: function( blinks ) {
    tessel.led[0].output(1);  // turn one on
    blinks = blinks || 10;

    var toggle = function() {
      tessel.led[0].toggle();
      tessel.led[1].toggle();
      if (--blinks > 0) {
        setTimeout( toggle, 200 );
      }
    };

    setTimeout( toggle, 200 );
  }
};

//----------------------------------------
var Responses = {
  blink: function( response ) {
//    Tessel.blink( 20 );
    response.writeHead( 200, {"Content-Type": "text/html"});
    response.write("<b>Hello, I'm David's Tessel, what are we going to do tonight?<b>");
  },
  sorry404: function( response ) {
    response.writeHead( 404, {"Content-Type": "text/html"});
    response.write("<b>Sorry, my weak human masters have not taught me that yet.<b>");
  }
  
};

//----------------------------------------------------------------------
//  handle all http requests
//----------------------------------------------------------------------
var listener = function( request, response ) {
  console.log("Got a request to " + request.url );
//  console.log( JSON.stringify( request ));

  var req = url.parse( request.url, true );
//  console.log( JSON.stringify( req ));

  if ((request.url === "/") ||
    (request.url === "/blink"))
  {
    Responses.blink( response );
  } else {
    Responses.sorry404( response );
  }
  response.end("\n");
};

//----------------------------------------------------------------------
// start the server
//----------------------------------------------------------------------
var server = http.createServer( listener ).listen( port );
console.log("\nServer running at http://127.0.0.1:" + port);
console.log("");
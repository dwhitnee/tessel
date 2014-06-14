//----------------------------------------------------------------------
//  A simple web server to run on a Tessel that will blink when hit
//
// 2014 David Whitney
//----------------------------------------------------------------------

var port = 8000;

var tessel = require('tessel');  // the hardware
var http = require('http');      // the interwebs
var url = require('url');
var fs = require('fs');

var servo = require('./lib/servo')( tessel, 1, 'A' );

var Tessel = {
  //----------------------------------------
  allLEDs: function( state ) {
    for (var i = 0; i< 4; i++) {
      tessel.led[i].output( state );
    }
  },
  flash: function() {
    Tessel.allLEDs( 1 );
    setTimeout( function() { Tessel.allLEDs(0); }, 1000 );
  },

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
    Tessel.flash();
    response.writeHead( 200, {"Content-Type": "text/html"});
    response.write("<b>Hello, I'm David's <a href=https://tessel.io/>Tessel</a>, what are we going to do tonight?</b>");
  },
  servoStatus: function( response ) {
    response.writeHead( 200, {"Content-Type": "text/html"});
    response.write("<b>Servo is at position " + servo.position + "</b>");
    response.write("<br/>");
    response.write("<a href=/servo/left>Left</a> | <a href=/servo/center>Center</a> | <a href=/servo/right>Right</a>");
  },

  sorry404: function( response ) {
    response.writeHead( 404, {"Content-Type": "text/html"});
    response.write("<b>Sorry, my weak human masters have not taught me that yet.</b>");
  }  
};

//----------------------------------------------------------------------
//  handle all http requests
//----------------------------------------------------------------------
var listener = function( request, response ) {
  console.log("Got a request to " + request.url );
//  console.log( JSON.stringify( request ));

  var req = url.parse( request.url, true );
//  console.log( JSON.stringify( req ));  // why doesn't this do params right?

  if ((request.url === "/") ||
    (request.url === "/blink"))
  {
    Responses.blink( response );

  } else if (request.url.match( /servo/ )) {
    if (request.url === "/servo/left") servo.left();
    if (request.url === "/servo/right") servo.right();
    if (request.url === "/servo/center") servo.center();
    Responses.servoStatus( response );

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
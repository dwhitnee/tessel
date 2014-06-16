//----------------------------------------------------------------------
//  A simple web server to run on a Tessel that will blink when hit
//
// 2014 David Whitney
//----------------------------------------------------------------------

var port = 8000;

var http = require('http');      // the interwebs
var url = require('url');
var $q = require('q');  // promises

// this gives Tessel heartburn
// var nodestatic = require('node-static');
// var file = new(nodestatic.Server)("public");

var servo, tessel;

if (mock) {
  var dummy = function() {};
  servo = { move: dummy, right: dummy, left: dummy, center: dummy };
  tessel = { led: [] }; 
} else {
  servo = require('./lib/servo')( tessel, 1, 'A' );
  tessel = require('tessel');  // the hardware
}


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
    response.writeHead( 200 );

    response.write("<b>Hello, I'm David's <a href=https://tessel.io/>Tessel</a>, what are we going to do tonight?</b>");
  },
  servoStatus: function( response ) {
    response.writeHead( 200 );
    var output = [];
    response.write("<b>Servo is at position " + servo.position + "</b>");
    response.write("<br/>");
    response.write("<a href=/servo/lleft>|&lt;</a>");
    response.write(" <a href=/servo/left>Left</a> | <a href=/servo/center>Center</a> | <a href=/servo/right>Right</a> ");
    response.write("<a href=/servo/rright>&gt;|</a>");
    // response.write( output.join("") );
  },

  sorry404: function( response ) {
    response.writeHead( 404 );
    response.write("<b>Sorry, my weak human masters have not taught me that yet.</b>");
  }  
};

//----------------------------------------------------------------------
//  handle all http requests
//----------------------------------------------------------------------
var listener = function( request, response ) {
  response.setHeader('Connection', 'Transfer-Encoding');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Transfer-Encoding', 'chunked');

  // ?
  // $q.invoke( handleRequest )
  // .then( finish );
  
  console.log("Got a request to " + request.url );

  var req = url.parse( request.url, true );

  if ((request.url === "/") ||
    (request.url === "/blink"))
  {
    Responses.blink( response );

  } else if (request.url.match( /servo/ )) {
    if (request.url === "/servo/lleft")  servo.move(1);
    if (request.url === "/servo/left")   servo.left();
    if (request.url === "/servo/right")  servo.right();
    if (request.url === "/servo/rright") servo.move(0);
    if (request.url === "/servo/center") servo.center();
    Responses.servoStatus( response );

  } else if (request.url.match( /ico|html/ )) {
    // file.serve(request, response);

  } else {
    Responses.sorry404( response );
  }

  response.end("\n");
  console.log("request end")
};

//----------------------------------------------------------------------
// start the server
//----------------------------------------------------------------------
var server = http.createServer( listener ).listen( port );
console.log("\nServer running at http://127.0.0.1:" + port);
console.log("");
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

var servo, tessel, mock = false;

if (mock) {
  var dummy = function() {};
  servo = { move: dummy, right: dummy, left: dummy, center: dummy };
  tessel = { led: [] }; 
} else {
  tessel = require('tessel');  // the hardware
  servo = require('./lib/servo')( tessel, 1, 'A' );
}


var Tessel = {
  //----------------------------------------
  allLEDs: function( state ) {
    for (var i = 0; i< tessel.led.length; i++) {
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
    Responses.writeHeader( response, 200 );

    response.write('<b>Gee, what are we going to do tonight?</b>\n');
    response.write('<div style="padding: 3em">Are you thinking what <a href="servo">I\'m thinking</a>?</div>\n');
  },
  servoStatus: function( response ) {
    Responses.writeHeader( response, 200 );

    response.write("<b>Servo is at position " + servo.position + "</b>\n");
    response.write("<br/><br/>\n");
    response.write("<a href=/servo/lleft>|&lt;</a>\n");
    response.write(" <a href=/servo/left>Left</a>\n");
    response.write("| <a href=/servo/center>Center</a> \n");
    response.write("| <a href=/servo/right>Right</a>\n");
    response.write(" <a href=/servo/rright>&gt;|</a>\n");
  },

  sorry404: function( response ) {
    Responses.writeHeader( response, 404 );
    response.write("<b>Sorry, my weak human masters have not taught me that yet.</b>");
  },

  writeHeader: function( response, status ) {
    response.writeHead( status );
    response.write("<html><head>\n");
    response.write('<link rel="icon" type="image/png" href="http://start.tessel.io/favicon.ico">\n');
    response.write("<title>My Tessel!</title>\n");
    response.write('<body style="font-family: sans-serif;">\n');
    response.write('<div style="opacity: .2; z-index: -1; width: 100%; height: 10em; position: absolute; background: url(https://s3.amazonaws.com/technicalmachine-assets/technical-io/tessel-name.png) no-repeat scroll 0 0 / contain"></div>\n');

    response.write('<div style="padding: 2em;">');
  },
  writeFooter: function( response ) {
    response.write("</div>");
    response.write('<code style="font: sans-serif; float: right; padding: 3em;">');
    response.write('powered by <a href="https://tessel.io/">tessel</a></code>');
    response.end("</body><html>\n");
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

  Responses.writeFooter( response );
};

//----------------------------------------------------------------------
// start the server
//----------------------------------------------------------------------
var server = http.createServer( listener ).listen( port );
console.log("\nServer running at http://127.0.0.1:" + port);
console.log("");
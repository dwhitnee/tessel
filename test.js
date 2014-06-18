//----------------------------------------------------------------------
//  A simple web server to run on a Tessel to see how much data is
//  flushed on each request
//
// 2014 David Whitney
//----------------------------------------------------------------------

var port = 8000;
var requests = 0;
var http = require('http');      // the interwebs

//----------------------------------------------------------------------
//  handle all http requests
//----------------------------------------------------------------------
var listener = function( request, response ) {
  var start = Date.now();
  response.setHeader('Connection', 'Transfer-Encoding');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Transfer-Encoding', 'chunked');
  response.writeHead( 200 );

  console.log("Got a request to " + request.url );

  response.write("<!DOCTYPE html>");
  response.write("<html><body>");
  response.write("<div>I've served " + ++requests + " requests</div>\n");

  var loops = 10;
  for (var i=1; i<= loops; i++) {
    response.write("<div>" + i + " of " + loops + "</div>\n");
  }

  response.write("<div></div>");
  response.write("<div>Time: " + Math.floor(Date.now() - start) + "ms</div>\n");
  response.end("</body></html>\n");

};

//----------------------------------------------------------------------
// start the server
//----------------------------------------------------------------------
var server = http.createServer( listener ).listen( port );

console.log("\nServer running at http://127.0.0.1:" + port + "\n");

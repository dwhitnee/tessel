/** 
 * Control a Tessel Servo!  Pass in which servo id (1-16) and which 
 * Tessel Port the Servo mocule is on (defaults to the A pins)
 * 
 * http://start.tessel.io/modules/servo
 * 
 * 2014 David Whitney
 */

module.exports = function( tessel, id, port ) {
  var servolib = require('servo-pca9685');
  port = port || 'A';    
  var servos = servolib.use( tessel.port[port] );
   
  var Servo = {
    id: id,
    position: 0,     // Servo arm position 0 to 1
    right: function( delta ) {
      delta = delta || .1;
      Servo.move( Servo.position - delta );
    },
    left: function( delta ) {
      delta = delta || .1;
      Servo.move( Servo.position + delta );
    },
    center: function() {
      Servo.move( 0.5 );
    },
    move: function( pos ) {
      Servo.position = pos;
      if (Servo.position > 1) Servo.position = 1;
      if (Servo.position < 0) Servo.position = 0;
      servos.move( Servo.id, Servo.position );
    },
    
    //  Set the minimum and maximum duty cycle for servo 1.
    //  If the servo doesn't move to its full extent or stalls out
    //  and gets hot, try tuning these values (0.05 and 0.12).
    //  Moving them towards each other = less movement range
    //  Moving them apart = more range, more likely to stall and burn out
    init: function() {
      servos.on('ready', 
                function () {
                  servos.configure( Servo.id, 0.05, 0.12, Servo.center );
                  console.log("Servos ready!");
                });
    }
  };

  Servo.init();
  return Servo;
};


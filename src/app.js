/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var moment = require('moment');

// Refresh timer
var refreshTimer;

// Create info card
var startCard = new UI.Card({
  title: "Getting Location",
  body: "Please Wait..."
});
startCard.show();

function busSuccess(json) {
  console.log(json);
  var timeMoment = moment(json.next_bus.time);
  var timeTil = timeMoment.fromNow();
  var timeActual = timeMoment.format('HH:mm');
  var infoCard = new UI.Card({
    title: "Next Bus is",
    body: timeTil + '\n(' + timeActual + ')\nFrom:\n' + json.stop.name
  }); 
  infoCard.show();
  
  // Update location on click
  infoCard.on('click', 'select', function() {
    infoCard.hide();
    getLocation();
  });
  
  function updateCard() {
    var timeTil = timeMoment.fromNow();
    var timeActual = timeMoment.format('HH:mm');
    infoCard.body(timeTil + '\n(' + timeActual + ')\nFrom:\n' + json.stop.name);
    
    if (timeMoment.isAfter()) refreshTimer = setTimeout(updateCard, 500);
  }
  
  refreshTimer = setTimeout(updateCard, 500);
}

function busError(err) {
  console.log(err);
  var busCard = new UI.Card({
    title: 'Whoops',
    body: 'Shit something went wrong'
  });
  busCard.show();
}

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function locationSuccess(pos) {
  var locationCard = new UI.Card({
    title: "Location is",
    body: 'lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude
  });
  locationCard.show();
  ajax({
    url: 'https://u1.jerix.co.uk/nearest?lat=' + pos.coords.latitude + '&lon=' + pos.coords.longitude,
    type: 'json'
  },
    function(json) {
       locationCard.hide();
       busSuccess(json);
     },
    function(err) {
       locationCard.hide();
       busError(err);
     }
  );
}

function locationError(err) {
  var locationCard = new UI.Card({
    title: "Location Error",
    body: err.message
  });
  locationCard.show();
}

function getLocation() {
  // Make an asynchronous request
  console.log('Getting Location');
  clearTimeout(refreshTimer);
  startCard.show();
  navigator.geolocation.getCurrentPosition(
    function(data) {
       startCard.hide();
       locationSuccess(data);
     },
    function(data) {
       startCard.hide();
       locationError(data);
     },
    locationOptions);
}

getLocation();
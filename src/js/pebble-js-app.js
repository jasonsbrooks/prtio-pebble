
// Fetch saved symbol from local storage (using standard localStorage webAPI)
var   symbol = "Prtio";
var allSongs = [];

var outgoing = {};

var API_URL = "http://prtio.com";
// var API_URL = "http://prtio.herokuapp.com";
// var API_URL = "http://7705977c.ngrok.com";
var MY_PARTY_KEY = "pennapps";

var ACTION_APPROVE = "approved";
var ACTION_DENY = "denied";

// setInterval(fetchSongInfo,10000);

  function updateSongs() {

    // allSongs.forEach(function (element, index, array) {

    // });
      var nextSong = null;
      if (allSongs.length > 0) {
        nextSong = allSongs[0];

        var song;
        var artist;

        title = nextSong.title;
        artist = nextSong.artist;

        console.log(artist + "  -  " + title);



        Pebble.sendAppMessage({
          "song" : title,
          "artist" : artist
        });

        console.log( JSON.stringify(allSongs, ",", "   "));
        console.log( JSON.stringify(outgoing, ",", "   "));
      } else {
          Pebble.sendAppMessage({
            "song" : "",
            "artist" : "Add more songs!"
        });
      }
  }

  function popAndUpdate() {
    if (allSongs.length > 0) {
      out = allSongs.shift();
      outgoing[out.id] = out;
      updateSongs();
    }

  }



  function fetchSongInfo() {
  var response;
  var req = new XMLHttpRequest();
  // build the GET request
  // req.setRequestHeader("X-Parse-Application-Id", "sXIk77EAWSgkshjxgdIi8IoxQq3rbnmtYxwxQUVh");
  // req.setRequestHeader("X-Parse-REST-API-Key", "2FWetS0DFSM4b0znuXmEECgc0UuKLpKiZEzEtBmR");
  req.setRequestHeader("Content-Type", "application/json");

  req.open('POST', API_URL + "/party/get_pending" , true);
  var data = {"partykey" : MY_PARTY_KEY};
  req.onload = function(e) {
    if (req.readyState == 4) {
      // 200 - HTTP OK
      if(req.status == 200) {
        console.log(req.responseText);
        response = JSON.parse(req.responseText);
        if (response) {
          // data found, look for LastPrice

          if (response.length > 0)
            allSongs = response;
            updateSongs();
        }
      } else {
        console.log("Request returned error code " + req.status.toString());
      }
    }
  };

  req.send(JSON.stringify(data));
}

function sendPostRequest(id, action) {
  var response;
  var req = new XMLHttpRequest();
  // build the GET request
  // req.setRequestHeader("X-Parse-Application-Id", "sXIk77EAWSgkshjxgdIi8IoxQq3rbnmtYxwxQUVh");
  // req.setRequestHeader("X-Parse-REST-API-Key", "2FWetS0DFSM4b0znuXmEECgc0UuKLpKiZEzEtBmR");
  req.setRequestHeader("Content-Type", "application/json");
  var data = {
    "id" : id,
    "action" : action
  };

  req.open('POST', API_URL + "/party/approval", true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      // 200 - HTTP OK
      if(req.status == 200) {
        console.log(req.responseText);
        // response = JSON.parse(req.responseText);
        console.log("Post Successful!");

        // if (response.success != "true") {
        //   // data found, look for LastPrice
        //   console.log("Re-adding item after failure.");
        //   allSongs.unshift(outgoing[id]);
        //   delete outgoing[id];
        // }
      } else {
        console.log("Request returned error code " + req.status.toString());
      }
    }
  };

  popAndUpdate();


  req.send(JSON.stringify(data));
}


// Set callback for the app ready event
Pebble.addEventListener("ready",
                        function(e) {
                          console.log("connect!" + e.ready);
                          console.log(e.type);
                        });

// Set callback for appmessage events
Pebble.addEventListener("appmessage",
                        function(e) {
                          if (e.payload.fetch == 1) {
                            fetchSongInfo();
                          }
                          else if (e.payload.fetch == 2) {
                            console.log("UP BUTTON PRESSED");
                            if(allSongs.length > 0) {
                              sendPostRequest(allSongs[0].id, ACTION_APPROVE);
                            }
                          }
                          else if (e.payload.fetch == 3) {
                              console.log("DOWN BUTTON PRESSED");
                              if(allSongs.length > 0)
                                sendPostRequest( allSongs[0].id, ACTION_DENY);
                          }
                        });


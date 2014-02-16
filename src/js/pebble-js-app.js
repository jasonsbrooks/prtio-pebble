
// Fetch saved symbol from local storage (using standard localStorage webAPI)
var   symbol = "Prtio";
var allSongs = [];

var outgoing = {};

var url = "http://4532aa04.ngrok.com";


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
  req.setRequestHeader("X-Parse-Application-Id", "sXIk77EAWSgkshjxgdIi8IoxQq3rbnmtYxwxQUVh");
  req.setRequestHeader("X-Parse-REST-API-Key", "2FWetS0DFSM4b0znuXmEECgc0UuKLpKiZEzEtBmR");
  req.setRequestHeader("Content-Type", "application/json");

  req.open('POST', "https://api.parse.com/1/functions/getSongs", true);
  var data = {};
  req.onload = function(e) {
    if (req.readyState == 4) {
      // 200 - HTTP OK
      if(req.status == 200) {
        response = JSON.parse(req.responseText);

        if (response) {
          // data found, look for LastPrice

          if (response.result.length > 0)
            allSongs = JSON.parse(response.result);
            updateSongs();
        }
      } else {
        console.log("Request returned error code " + req.status.toString());
      }
    }
  };

  req.send(JSON.stringify(data));
}

function sendPostRequest1(endpoint, id) {
  var response;
  var req = new XMLHttpRequest();
  // build the GET request
  req.setRequestHeader("X-Parse-Application-Id", "sXIk77EAWSgkshjxgdIi8IoxQq3rbnmtYxwxQUVh");
  req.setRequestHeader("X-Parse-REST-API-Key", "2FWetS0DFSM4b0znuXmEECgc0UuKLpKiZEzEtBmR");
  req.setRequestHeader("Content-Type", "application/json");
  var data = {
    "title" : "When You Were Young",
    'artist': "The Killers",
    "id" : '1235323432'
  };

  req.open('POST', "http://5634aa3e.ngrok.com/add", true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      // 200 - HTTP OK
      if(req.status == 200) {
        response = JSON.parse(req.responseText);
        console.log("Post Successful!");

        console.log("data is : " + response);
        /*var song;
        var artist;

        if (response) {
          // data found, look for LastPrice
          song = response.data.title;
          artist = response.data.artist;

          Pebble.sendAppMessage({
            "song": song,
            "artist" : artist
          });
        }  else{
          // the merkitondemand API sends a response with a Message
          // field when the symbol is not found
          // Pebble.sendAppMessage({
          //   "price": "Not Found"});
         }
         */
         popAndUpdate();
      } else {
        console.log("Request returned error code " + req.status.toString());
      }
    }
  };

  req.send(JSON.stringify(data));
}

function sendPostRequest(endpoint, id) {
  var response;
  var req = new XMLHttpRequest();
  // build the GET request
  req.setRequestHeader("X-Parse-Application-Id", "sXIk77EAWSgkshjxgdIi8IoxQq3rbnmtYxwxQUVh");
  req.setRequestHeader("X-Parse-REST-API-Key", "2FWetS0DFSM4b0znuXmEECgc0UuKLpKiZEzEtBmR");
  req.setRequestHeader("Content-Type", "application/json");
  var data = {
    'id': id,
  };

  req.open('POST', "https://api.parse.com/1/functions/" + endpoint, true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      // 200 - HTTP OK
      if(req.status == 200) {
        response = JSON.parse(req.responseText);
        console.log("Post Successful!");
        // console.log("data is : " + response);
        /*var song;
        var artist;

        if (response) {
          // data found, look for LastPrice
          song = response.data.title;
          artist = response.data.artist;

          Pebble.sendAppMessage({
            "song": song,
            "artist" : artist
          });
        }  else{
          // the merkitondemand API sends a response with a Message
          // field when the symbol is not found
          // Pebble.sendAppMessage({
          //   "price": "Not Found"});
         }
         */
         popAndUpdate();
      } else {
        console.log("Request returned error code " + req.status.toString());
      }
    }
  };

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
                            sendPostRequest("approve", "123");
                          }
                          else if (e.payload.fetch == 3) {
                              console.log("DOWN BUTTON PRESSED");
                              sendPostRequest("deny", "123");
                          }
                        });


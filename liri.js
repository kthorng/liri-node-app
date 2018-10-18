// Require our dotenv package
require("dotenv").config();

var keys = require('./keys.js');
var request = require('request');
var moment = require('moment');
var fs = require('fs');
var action = process.argv[2];
var value = process.argv[3];
// switch to run each argument ======================================================
function commands (action, value) {
    switch (action) {
    case "concert-this":
        bands(value);
        break;
    case "spotify-this-song":
        getSong(value);
        break;
    case "movie-this":
        movie(value);
        break;
    case "do-what-it-says":
        random();
        break;

    //If no command is entered, this is the default message to user
    default:
        console.log('===================================================================================================================================');
        console.log("'concert-this' = search an Artist's tour dates, 'spotify-this-song' = search for a song title, 'movie-this' = Search a movie title.");
        console.log('===================================================================================================================================');
    }
}
// end of switch ====================================================================
// ----------------------------------------------------------------------------------
// concert-this start ===============================================================
function bands(value) {

   var artist = value;

    request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=6b3942edbbb34a5e87b66b6edd6d6ba6", function(error, response, body) {
        // if an error occurs
        if (error) {
        console.log('error:', error); // Print the error if one occurred
        } else {
            // Print the response status code if a response was received
            // console.log('statusCode:', response && response.statusCode); 
            // Print the HTML for the Google homepage.
            var arrayResult = JSON.parse(body);
            // loop through our objects to get multiple outputs
            for (var i = 0; i < arrayResult.length; i++ ) {
                    // display the text
                    console.log('-------------------------------------------------------')
                    console.log("Venue name:     " + arrayResult[i].venue.name);
                    console.log("Venue location: " + arrayResult[i].venue.city);
                    console.log("Date of Event:  " +  moment(arrayResult[i].datetime).format("MM/DD/YYYY"));
                    console.log('-------------------------------------------------------')
                }
         };
    });
    console.log('-------------------------------------------------------')
    console.log("You searched for: " + artist);

}
// concert-this end ================================================================
// ---------------------------------------------------------------------------------
// spotify-this-song start =========================================================
// Create spotify function
function getSong(songName) {

    if (!songName) {
        songName = "The Sign Ace of Base" + '&limit=1&';
    };
    // Varibles for spotify    
    var Spotify = require('node-spotify-api');
    var spotify = new Spotify(keys.spotify);
    // declare our search cuntion
    spotify.search({ type: 'track', query: songName + '&limit=10&' }, function(err, data) {
    // if an error occurs, display default item
    if (err) {
        spotify.search({ type: 'track', query: "The Sign Ace of Base" }, function(err, data) {
            if (err) {
                console.log('');
            };
          console.log('-------------------------------------------------------')
          console.log("Artist:  " + data.tracks.items[0].artists[0].name); 
          console.log("Song:    " + data.tracks.items[0].name); 
          console.log("Preview: " + data.tracks.items[0].preview_url); 
          console.log("Album:   " + data.tracks.items[0].album.name); 
          console.log('-------------------------------------------------------')
          });
                console.log("Error occurred but here is something you might like: ");
                // else log the below
    }
    else {
        // Loop through our objects to get multiple objects
        for (var i = 0; i < data.tracks.items.length; i++ ) {
            // display the text
            console.log('-------------------------------------------------------')
            console.log("Artist:  " + data.tracks.items[i].artists[0].name); 
            console.log("Song:    " + data.tracks.items[i].name); 
            console.log("Preview: " + data.tracks.items[i].preview_url); 
            console.log("Album:   " + data.tracks.items[i].album.name); 
            console.log('-------------------------------------------------------')
          }
        };      
     });
     console.log('-------------------------------------------------------')
     console.log("You searched for: " + songName);
}
// spotify-this-song end ============================================================
// ----------------------------------------------------------------------------------
// movie-this start =================================================================
function movie(movieName) {

    if (!movieName) {
        movieName = 'Mr. Nobody';
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=def076ee";

    request(queryUrl, function(error, response, body) {

        if (!error && response.statusCode === 200) {
        
        var result  =  JSON.parse(body);
        console.log('-------------------------------------------------------')
        console.log("Title:           " + result.Title);
        console.log("Year:            " + result.Released);
        console.log("IMDB Rating:     " + result.imdbRating );
        // console.log("Rotten Tomatoes: " + result.Ratings[1].Value);
        // since all movies do not have Rotten Tomattoes Ratings, build a for loop to crosscheck if there is one
        for(var i = 0; i < result.Ratings.length; i++) {
	    	if(result.Ratings[i].Source === "Rotten Tomatoes") {
	    		console.log("Rotten Tomatoes: " + result.Ratings[i].Value);
                } else if(result.Ratings[i].Website !== undefined) {
	    			console.log("Rotten Tomatoes: " + result.Ratings[i].Website)
            }            
        };
        console.log("Country:         " + result.Country);
        console.log("Language:        " + result.Language);
        console.log("Plot:            " + result.Plot);
        console.log("Actors:          " + result.Actors);
        console.log('-------------------------------------------------------')
        

        }
    });
    console.log('-------------------------------------------------------')
    console.log("You searched for: " + movieName);

}
// movie-this end== =================================================================
// ----------------------------------------------------------------------------------
// do-what-it-says start ============================================================
function random() {

    fs.readFile('random.txt', 'utf8', function(err, data) {
        if (err) {
            return console.log(error);
        }
        else {
            console.log(data);
    
            //creates a variable for data in random.txt
            var randomData = data.split(",");
            //passes data into getSong function
            commands(randomData[0], randomData[1]);
            }
    })
}
// do-what-it-says end ==============================================================
// ----------------------------------------------------------------------------------

// run our commands at start up
commands(action,value);
// start of inquirer.js =============================================================
var inquirer = require("inquirer");
inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like Liri to do for you today?",
            choices: ["spotify-this-song", "movie-this", "concert-this"],
            name: "question"
        },
        {
            type: "input",
            message: "Now, what would you like Liri to search for?",
            name: "search"
        },
        {
            type: "confirm",
            message: "Are you sure?",
            name: "confirm",
            default: true
        },
    ])
    .then(function(inquirerResponse) {
        if (inquirerResponse.confirm) {
            commands(inquirerResponse.question, inquirerResponse.search);
        } else {
            console.log('=======================================================')
            console.log("Not sure huh? here is something totally RANDOM!");       
            console.log('=======================================================')
            random()
        }
    });
    // End of inquirer.js ===============================================================

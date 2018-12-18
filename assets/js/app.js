VanillaTilt.init(document.querySelector(".bouga"), {
    reverse: false,  // reverse the tilt direction
    max: 5,     // max tilt rotation (degrees)
    perspective: 500,   // Transform perspective, the lower the more extreme the tilt gets.
    scale: 1,      // 2 = 200%, 1.5 = 150%, etc..
    speed: 300,    // Speed of the enter/exit transition
    transition: true,   // Set a transition on enter/exit.
    axis: null,   // What axis should be disabled. Can be X or Y.
    reset: true,    // If the tilt effect has to be reset on exit.
    easing: "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
    glare: false   // if it should have a "glare" effect
});

function makeRequest(method, url, done) {
    var xhttp = new XMLHttpRequest();
    xhttp.open(method, url);
    xhttp.onload = function() {
        done(null, xhttp.response);
    };
    xhttp.onerror = function() {
        done(xhttp.response);
    };
    xhttp.send();
}

function findMovies(id) {
    // Input field.
    var inputBox = document.getElementById("search");
    // Movie name.
    var searchTerm = id || inputBox.value;
    console.log(`searching for ${searchTerm}...`);
    var query = "";
    if (id) {
        query = `https://api.themoviedb.org/3/movie/${id}?api_key=d3449ff6ec0c027623bf6b6f5fff78b3&language=en-US`;
    } else {
        query = `https://api.themoviedb.org/3/search/movie?api_key=d3449ff6ec0c027623bf6b6f5fff78b3&language=en-US&query=${searchTerm}&page=1&include_adult=false`;
    }
    makeRequest('GET', query, function(error, data) {
        if (error) {
            throw error;
        } else {
            var result = JSON.parse(data);
            var movie = [];
            var movies = [];
            if (result.results) {
                movies = result.results;
            } else {
                movie = result;
            }
            // ID of top result.
            var movieId;
            var related;
            if (movies.length > 0) {
                movieId = movies[0].id;
                related = movies.splice(1);
            } else {
                movieId = movie.id;
                related = [];
            }
            // Other movies that matched the query besides the top result.
            makeRequest(
                'GET',
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=d3449ff6ec0c027623bf6b6f5fff78b3&language=en-US`,
                function(error, data) {
                    // console.log('data:',JSON.parse(data))
                    //           Define feature movie.
                    var featureMovie = JSON.parse(data);
                    // if (movies.length > 0) {
                    //   featureMovie = movies[0];
                    // } else if (movie) {
                    //   featureMovie = movie;
                    // }
                    console.log("feature movie:", featureMovie);
                    // Sets backdrop image.
                    var changeBackdrop = function() {
                        var container = document.getElementById("container");
                        var backdropPath = featureMovie.backdrop_path;
                        var background = "";

                        if (backdropPath != null) {
                            background = `linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%), url(https://image.tmdb.org/t/p/w1280${backdropPath}) no-repeat center center`;
                        } else {
                            background = "rgb(16, 16, 16)";
                        }

                        container.style.background = background;
                        container.style.backgroundSize = "cover";
                    };
                    changeBackdrop();
                    // Top result is set as the new movie card.
                    var changeMovieCard = function() {
                        // Build a list of related movies.
                        var relatedMoviesList = "";
                        related.forEach(function(movie) {
                            relatedMoviesList += `<li><span onclick="findMovies(${movie.id})">${movie.title}</span> (${movie.release_date.split(
                                "-"
                            )[0]})</li>`;
                        });
//             Formats the runtime.
                        function formatRuntime(runtime){
                            var minutes = runtime % 60;
                            var hours = Math.floor(runtime / 60);
                            return (`${hours} ${hours>1?'hours':'hour'} ${minutes} minutes`);
                        }
                        var runtimeString = formatRuntime(featureMovie.runtime);
                        // Aggregate the genres.
                        var genreNames = [];
                        if (featureMovie.genres) {
                            featureMovie.genres.forEach(function(genre) {
                                genreNames.push(genre.name);
                            });
                        }
                        var genreString = genreNames.join(", ");
//             Aggregate the production companies.
                        var productionCompanies = [];
                        if(featureMovie.production_companies){
                            featureMovie.production_companies.forEach(function(company){
                                productionCompanies.push(company.name);
                            });
                        }
                        var companyString = productionCompanies.join(', ');
                        //             Aggregate the production countries.
                        var productionCountries = [];
                        if(featureMovie.production_countries){
                            featureMovie.production_countries.forEach(function(country){
                                productionCountries.push(country.name);
                            });
                        }
                        var countries = productionCountries.join(', ');
//             Format release date.
                        function formatDate(date){
                            var dateArray = date.split('-').reverse();
                            // console.log(parseInt(dateArray[1]))
                            var day = dateArray[0];
                            var month ='';
                            switch(parseInt(dateArray[1])){
                                case 1:
                                    month = 'January';
                                    break;
                                case 2:
                                    month = 'February';
                                    break;
                                case 3:
                                    month = 'March';
                                    break;
                                case 4:
                                    month = 'April';
                                    break;
                                case 5:
                                    month = 'May';
                                    break;
                                case 6:
                                    month = 'June';
                                    break;
                                case 7:
                                    month = 'July';
                                    break;
                                case 8:
                                    month = 'August';
                                    break;
                                case 9:
                                    month = 'September';
                                    break;
                                case 10:
                                    month = 'October';
                                    break;
                                case 11:
                                    month = 'November';
                                    break;
                                case 12:
                                    month = 'December';
                                    break;
                                default:
                                    month = '';
                            }
                            var year = dateArray[2];
                            return `${day} ${month} ${year}`;
                        }
                        var releaseDate = formatDate(featureMovie.release_date);
                        // Build movie card template.


                        document.getElementById("results").innerHTML = template;
                    };
                    changeMovieCard();
                }
            );
        }
    });
}
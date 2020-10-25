$(document).ready(() => {
    var recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    var currentCityWeather;

    //If there are any cities, set the current city to the last city in the array otherwise ''
    var currentCity = (recentCities.length > 0 ? recentCities[recentCities.length - 1] : '');
    var currentWeatherDiv = $('.current-weather');

    //Get the current day's weather
    function getWeather() {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity + "&appid=" + apiKey;
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then((response) => {
            //Update the current city weather
            currentCityWeather = response;
            //Update the page with weather information
            updateCurrentWeather();
            //Add the city to the recent cities up to 10
            addCityToRecent();
            //Get the cities uv index
            getUVIndex();
            //Get the 5 day forecast
            get5DayForecast();
        }).fail((error) => {
            $("<div class='error-div'><h1>" + currentCity + " was not found</h1></div>").css({
                position: "absolute",
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
                zIndex: 1000000,  // to be on the safe side
                background: '#ffffff',
                textAlign: 'center',
                verticalAlign: 'middle',
            }).appendTo($(".current-weather").css("position", "relative"));
            
            feedbackTimeout = setTimeout(() => {
                $('.error-div').remove();
            }, 1500);
        })
    }

    //Update the page with the weather information
    function updateCurrentWeather() {
        //Clear the div
        currentWeatherDiv.empty();

        //Get the image of the current weather
        var weatherIcon = $('<img>').attr('src', getWeatherIcon(currentCityWeather));

        //Get the city and date and append the weatherIcon
        var cityEl = $('<h2>').html(currentCityWeather.name + ' (' + moment(currentCityWeather.dt*1000).format('MM/DD/YYYY') + ')');
        cityEl.append(weatherIcon);

        //Get the temperature and convert it to farenheit
        var temp = (currentCityWeather.main.temp - 273.15) * 1.80 + 32;
        temp = temp.toFixed(2);
        var temperatureEl = $('<p>').html("Temperature: " + temp + "&#8457;");

        //Get the humidity
        var humidityEl = $('<p>').html("Humidty: " + currentCityWeather.main.humidity + "%");

        //Get the Wind speed
        var windSpeedEl = $('<p>').html("Wind Speed: " + currentCityWeather.wind.speed + " MPH");

        //Append the information to the today's weather div
        currentWeatherDiv.append(cityEl);
        currentWeatherDiv.append(temperatureEl);
        currentWeatherDiv.append(humidityEl);
        currentWeatherDiv.append(windSpeedEl);
    }

    function getUVIndex() {
        var queryURL = "http://api.openweathermap.org/data/2.5/uvi?lat=" + currentCityWeather.coord.lat + "&lon=" + currentCityWeather.coord.lon + "&appid=" + apiKey;
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then((response) => {
            var uvIndex = response.value;
            //If it's less than 3 green, less than 6 yellow, less than 8 red, less than 11 purple, else blue
            var color = uvIndex < 3 ? '#00ff00' : uvIndex < 6 ? '#ffff00' : uvIndex < 8 ? '#ff0000' : uvIndex < 11 ? '#800080' : '#0000ff';

            //Add the item to the page
            var uvIndexEl = $('<p>').html('UV Index: <span style="background-color: ' + color + '">' + uvIndex + '</span>');
            currentWeatherDiv.append(uvIndexEl);
        });
    }

    function get5DayForecast() {
        var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + currentCity + "&appid=" + apiKey;
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then((response) => {
            console.log(response);
            var forecastArray = response.list;
            var forecastDiv = $('.forecast');
            forecastDiv.empty();
            for(var i = 0; i < 5; i++)
            {
                var daysForecast = forecastArray[i*8];
                var forecastCard = $('<div class="card text-left col-md-2 text-light bg-primary">');
                forecastCard.append('<h4>').text(moment(daysForecast.dt*1000).format('MM/DD/YYYY'));
                
                //Get the image of the forecast weather
                var weatherIcon = $('<img>').attr('src', getWeatherIcon(daysForecast)).addClass('mr-auto');
                forecastCard.append(weatherIcon);

                //Get the temperature and convert it to farenheit
                var temp = (daysForecast.main.temp - 273.15) * 1.80 + 32;
                temp = temp.toFixed(2);
                var temperatureEl = $('<p>').html("Temperature: " + temp + "&#8457;");
                forecastCard.append(temperatureEl);

                //Get the humidity
                var humidityEl = $('<p>').html("Humidty: " + daysForecast.main.humidity + "%");
                forecastCard.append(humidityEl);

                forecastDiv.append(forecastCard);
            }
        });
        //api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    }

    function addCityToRecent() {
        //Update the recentCities, we will pull up the last city in the array when the page loads
        if(recentCities.indexOf(currentCity) > -1)
        {
            recentCities.splice(recentCities.indexOf(currentCity), 1);
            recentCities.push(currentCity);
        }
        else{
            recentCities.push(currentCity);
        }
        
        //If there are more than 10 cities in the list remove the oldest item (the first item in the array)
        if(recentCities.length > 10)
            recentCities.splice(0, 1);

        showRecentCities();

        //Save it to local storage
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    //Render the recent cities
    function showRecentCities() {
        $('.cities').empty();
        for(i in recentCities) {
            $('.cities').prepend($('<button type="button" class="list-group-item list-group-item-action">').html(recentCities[i]).attr('data-city', recentCities[i]));
        }
    }

    //Get the current weather icon
    function getWeatherIcon(weather) {
        return 'https://openweathermap.org/img/wn/' + weather.weather[0].icon + '.png'
    }

    //When they search add the city to the recentCities and call getWeather
    $('.search').on('submit', (event) => {
        event.preventDefault();

        //Update the search term, unless there is no value
        currentCity = $(".city-search").val() || currentCity;

        //Get the current weather
        getWeather();
    });

    $('.cities').on('click', function(event) {
        currentCity = $(event.target).data('city');
        getWeather();
    });

    showRecentCities();
    getWeather();

});

var apiKey = '9c23bd877544f16f02526405a58786d3';
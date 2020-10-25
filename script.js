$(document).ready(() => {
    var currentCityWeather;
    var currentWeatherDiv = $('.current-weather');

    function getWeather() {
        var currentCity = $(".city-search").val();

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity + "&appid=" + apiKey;
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then((response) => {
            currentCityWeather = response;
            console.log(response);
            updateCurrentWeather();
        })
    }

    function updateCurrentWeather() {
        //Clear the div
        currentWeatherDiv.empty();

        //Get the image of the current weather
        var weatherIcon = $('<img>').attr('src', 'https://openweathermap.org/img/wn/' + currentCityWeather.weather[0].icon + '.png');

        //Get the city and date and append the weatherIcon
        var cityEl = $('<h2>').html(currentCityWeather.name + ' (' + moment(currentCityWeather.dt*1000).format('MM/DD/YYYY') + ')');
        cityEl.append(weatherIcon);

        //Append the city to the div
        currentWeatherDiv.append(cityEl);
    }

    $(".city-search").val('Salt Lake City');
    getWeather();

});

var apiKey = '9c23bd877544f16f02526405a58786d3';
//api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
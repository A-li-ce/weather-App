let cityInput = document.querySelector(".city-input");
let searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
let currentWeatherDiv = document.querySelector(".current-weather");
let weatherCardDiv = document.querySelector(".weather-cards");

const API_KEY = "c7db4908554f2d73481b6b6544f612cb";

// step :4
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                <h2>${cityName}(${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-img">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <h4>${weatherItem.weather[0].description}</h4>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-img" >
                
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    // Use axios to fetch weather details
    axios.get(WEATHER_API_URL)
        .then(response => {
            const data = response.data;

            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clearing previous weather data
            cityInput.value = " ";
            currentWeatherDiv.innerHTML = " ";
            weatherCardDiv.innerHTML = " ";

            console.log(fiveDaysForecast);

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(err => {
            alert("An error occurred while fetching the weather forecast!");
            console.log(err);
        });
};

// step:2
const getCityCoordinates = () => {
    let cityName = cityInput.value.trim();
    if (!cityName) return; // return if cityName is empty

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Use axios to fetch coordinates
    axios.get(GEOCODING_API_URL)
        .then(response => {
            const data = response.data;
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(err => {
            alert("An error occurred while fetching the coordinates!");
            console.log(err);
        });
};

// Last step!
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            // Use axios to fetch reverse geocoding info
            axios.get(REVERSE_GEOCODING_URL)
                .then(response => {
                    const data = response.data;
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(err => {
                    alert("An error occurred while fetching the city!");
                    console.log(err);
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location to grant access again.");
            }
        }
    );
};

locationBtn.addEventListener('click', getUserCoordinates); // last step!
searchBtn.addEventListener('click', getCityCoordinates);  // step: 1

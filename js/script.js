// API key for OpenWeatherMap - Replace with your actual API key
const apiKey = "4cc45c38e57c6db1c816015accf4d293"; // Free OpenWeatherMap API key

// Global variables
let currentUnit = 'metric'; // Default unit (metric = Celsius)
let currentCity = 'Delhi';
let currentWeatherData = null;

// DOM elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const getLocationButton = document.getElementById('get-location');
const celsiusButton = document.getElementById('celsius');
const fahrenheitButton = document.getElementById('fahrenheit');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const temperatureElement = document.getElementById('temperature');
const feelsLikeElement = document.getElementById('feels-like');
const descriptionElement = document.getElementById('description');
const weatherIconElement = document.getElementById('weather-icon');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const forecastContainer = document.getElementById('forecast');

// Event listeners
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

getLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        getLocationButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
                getLocationButton.innerHTML = '<i class="fas fa-location-dot"></i>';
            },
            (error) => {
                showError('Unable to retrieve your location');
                getLocationButton.innerHTML = '<i class="fas fa-location-dot"></i>';
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

celsiusButton.addEventListener('click', () => {
    if (currentUnit !== 'metric') {
        currentUnit = 'metric';
        updateUnitButtons();
        if (currentWeatherData) {
            // Convert stored temperatures from Fahrenheit to Celsius
            const convertedData = convertTemperatures(currentWeatherData, 'imperial', 'metric');
            updateUIWithWeatherData(convertedData);
            
            // Convert forecast data instead of fetching new data
            if (storedForecastData.length > 0) {
                const convertedForecast = convertForecastTemperatures(storedForecastData, 'imperial', 'metric');
                displayForecast(convertedForecast);
            } else {
                updateForecast(currentCity);
            }
        }
    }
});

fahrenheitButton.addEventListener('click', () => {
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial';
        updateUnitButtons();
        if (currentWeatherData) {
            // Convert stored temperatures from Celsius to Fahrenheit
            const convertedData = convertTemperatures(currentWeatherData, 'metric', 'imperial');
            updateUIWithWeatherData(convertedData);
            
            // Convert forecast data instead of fetching new data
            if (storedForecastData.length > 0) {
                const convertedForecast = convertForecastTemperatures(storedForecastData, 'metric', 'imperial');
                displayForecast(convertedForecast);
            } else {
                updateForecast(currentCity);
            }
        }
    }
});

// Function to convert temperatures in forecast data
function convertForecastTemperatures(forecastData, fromUnit, toUnit) {
    // Create a deep copy of the data to avoid modifying the original
    const convertedForecast = JSON.parse(JSON.stringify(forecastData));
    
    convertedForecast.forEach(forecast => {
        if (fromUnit === 'metric' && toUnit === 'imperial') {
            // Convert from Celsius to Fahrenheit: (C * 9/5) + 32
            forecast.main.temp = (forecast.main.temp * 9/5) + 32;
            forecast.main.feels_like = (forecast.main.feels_like * 9/5) + 32;
            forecast.main.temp_min = (forecast.main.temp_min * 9/5) + 32;
            forecast.main.temp_max = (forecast.main.temp_max * 9/5) + 32;
        } else if (fromUnit === 'imperial' && toUnit === 'metric') {
            // Convert from Fahrenheit to Celsius: (F - 32) * 5/9
            forecast.main.temp = (forecast.main.temp - 32) * 5/9;
            forecast.main.feels_like = (forecast.main.feels_like - 32) * 5/9;
            forecast.main.temp_min = (forecast.main.temp_min - 32) * 5/9;
            forecast.main.temp_max = (forecast.main.temp_max - 32) * 5/9;
        }
    });
    
    return convertedForecast;
}

// Function to convert temperatures in the weather data object
function convertTemperatures(data, fromUnit, toUnit) {
    // Create a deep copy of the data to avoid modifying the original
    const convertedData = JSON.parse(JSON.stringify(data));
    
    if (fromUnit === 'metric' && toUnit === 'imperial') {
        // Convert from Celsius to Fahrenheit: (C * 9/5) + 32
        convertedData.main.temp = (data.main.temp * 9/5) + 32;
        convertedData.main.feels_like = (data.main.feels_like * 9/5) + 32;
        convertedData.main.temp_min = (data.main.temp_min * 9/5) + 32;
        convertedData.main.temp_max = (data.main.temp_max * 9/5) + 32;
    } else if (fromUnit === 'imperial' && toUnit === 'metric') {
        // Convert from Fahrenheit to Celsius: (F - 32) * 5/9
        convertedData.main.temp = (data.main.temp - 32) * 5/9;
        convertedData.main.feels_like = (data.main.feels_like - 32) * 5/9;
        convertedData.main.temp_min = (data.main.temp_min - 32) * 5/9;
        convertedData.main.temp_max = (data.main.temp_max - 32) * 5/9;
    }
    
    return convertedData;
}

// Format date
function formatDate(date) {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time (for sunrise/sunset)
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Format day for forecast
function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Update UI with weather data
function updateUIWithWeatherData(data) {
    currentWeatherData = data;
    
    // Location and date
    cityElement.textContent = `${data.name}, ${data.sys.country}`;
    dateElement.textContent = formatDate(new Date());
    
    // Temperature and description
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    
    temperatureElement.textContent = `${temp}${tempUnit}`;
    feelsLikeElement.textContent = `${feelsLike}${tempUnit}`;
    descriptionElement.textContent = data.weather[0].description;
    
    // Weather details
    humidityElement.textContent = `${data.main.humidity}%`;
    
    const windSpeed = currentUnit === 'metric' 
        ? `${Math.round(data.wind.speed * 3.6)} km/h` // Convert m/s to km/h
        : `${Math.round(data.wind.speed)} mph`;
    
    windSpeedElement.textContent = windSpeed;
    pressureElement.textContent = `${data.main.pressure} hPa`;
    
    // Visibility (convert from meters)
    const visibility = currentUnit === 'metric'
        ? `${(data.visibility / 1000).toFixed(1)} km`
        : `${Math.round(data.visibility / 1609.34)} mi`;
    
    visibilityElement.textContent = visibility;
    
    // Sunrise and sunset times
    sunriseElement.textContent = formatTime(data.sys.sunrise);
    sunsetElement.textContent = formatTime(data.sys.sunset);
    
    // Update weather icon based on weather condition
    updateWeatherIcon(data.weather[0].id);
    
    // Update background video based on weather condition
    updateBackgroundVideo(data.weather[0].id);
    
    // Save current city for forecast updates
    currentCity = data.name;
}

// Update background video based on weather condition
function updateBackgroundVideo(weatherId) {
    const videoElement = document.getElementById('background-video');
    const videoSource = videoElement.querySelector('source');
    let videoUrl = '';
    
    // Select video based on weather condition
    if (weatherId >= 200 && weatherId < 300) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-lightning-strikes-in-the-middle-of-a-city-4720-large.mp4'; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 500) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-4872-large.mp4'; // Drizzle
    } else if (weatherId >= 500 && weatherId < 600) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-road-1204-large.mp4'; // Rain
    } else if (weatherId >= 600 && weatherId < 700) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-snowy-forest-in-winter-1362-large.mp4'; // Snow
    } else if (weatherId >= 700 && weatherId < 800) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-fog-in-the-woods-4236-large.mp4'; // Atmosphere (fog, mist, etc.)
    } else if (weatherId === 800) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4'; // Clear sky
    } else if (weatherId > 800) {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4'; // Clouds
    }
    
    // Update video source and reload the video
    if (videoUrl && videoSource.src !== videoUrl) {
        videoSource.src = videoUrl;
        videoElement.load();
        videoElement.play();
    }
}

// Update weather icon based on condition code
function updateWeatherIcon(weatherId) {
    let iconClass = '';
    
    if (weatherId >= 200 && weatherId < 300) {
        iconClass = 'fa-bolt'; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 500) {
        iconClass = 'fa-cloud-rain'; // Drizzle
    } else if (weatherId >= 500 && weatherId < 600) {
        iconClass = 'fa-cloud-showers-heavy'; // Rain
    } else if (weatherId >= 600 && weatherId < 700) {
        iconClass = 'fa-snowflake'; // Snow
    } else if (weatherId >= 700 && weatherId < 800) {
        iconClass = 'fa-smog'; // Atmosphere (fog, mist, etc.)
    } else if (weatherId === 800) {
        iconClass = 'fa-sun'; // Clear sky
    } else if (weatherId > 800) {
        iconClass = 'fa-cloud-sun'; // Clouds
    }
    
    weatherIconElement.innerHTML = `<i class="fas ${iconClass}"></i>`;
}

// Update unit buttons
function updateUnitButtons() {
    if (currentUnit === 'metric') {
        celsiusButton.classList.add('active');
        fahrenheitButton.classList.remove('active');
    } else {
        celsiusButton.classList.remove('active');
        fahrenheitButton.classList.add('active');
    }
}

// Show error message
function showError(message) {
    alert(message);
}

// Fetch weather data by city name
async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('City not found. Please try again.');
        }
        
        const data = await response.json();
        // Store the original data with its unit
        currentWeatherData = data;
        updateUIWithWeatherData(data);
        
        // Get forecast data
        updateForecast(city);
        
        // Clear search input
        searchInput.value = '';
    } catch (error) {
        showError(error.message);
    }
}

// Fetch weather data by coordinates
async function getWeatherDataByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather data for your location');
        }
        
        const data = await response.json();
        // Store the original data with its unit
        currentWeatherData = data;
        updateUIWithWeatherData(data);
        
        // Get forecast using city name from current weather data
        updateForecast(data.name);
    } catch (error) {
        showError(error.message);
    }
}

// Fetch and update 5-day forecast
async function updateForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('Unable to fetch forecast data');
        }
        
        const data = await response.json();
        // Store the forecast data for unit conversion
        storeForecastData(data.list);
        displayForecast(data.list);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

// Store forecast data for unit conversion
let storedForecastData = [];
let storedForecastUnit = 'metric';

function storeForecastData(forecastData) {
    storedForecastData = JSON.parse(JSON.stringify(forecastData));
    storedForecastUnit = currentUnit;
}

// Display 5-day forecast
function displayForecast(forecastData) {
    // Clear previous forecast
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (data comes in 3-hour intervals)
    const dailyData = forecastData.filter((forecast, index) => index % 8 === 0);
    
    // Create forecast items (limit to 5 days)
    dailyData.slice(0, 5).forEach(forecast => {
        const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${formatDay(forecast.dt)}</div>
            <div class="forecast-icon">
                <i class="fas ${getIconClass(forecast.weather[0].id)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}${tempUnit}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Get icon class for forecast
function getIconClass(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return 'fa-bolt';
    if (weatherId >= 300 && weatherId < 500) return 'fa-cloud-rain';
    if (weatherId >= 500 && weatherId < 600) return 'fa-cloud-showers-heavy';
    if (weatherId >= 600 && weatherId < 700) return 'fa-snowflake';
    if (weatherId >= 700 && weatherId < 800) return 'fa-smog';
    if (weatherId === 800) return 'fa-sun';
    if (weatherId > 800) return 'fa-cloud-sun';
    return 'fa-cloud';
}

// Initialize with default city
window.addEventListener('load', () => {
    // Try to get user's location first
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                // Fall back to default city if geolocation fails
                getWeatherData('New York');
            }
        );
    } else {
        // Fall back to default city if geolocation is not supported
        getWeatherData('New York');
    }
});

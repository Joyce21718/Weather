const apiKey = 'b1b15e88fa797225412429c1c50c122a1';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';

const searchBox = document.getElementById('city-search');
const searchBtn = document.getElementById('search-button');

const weatherIcon = document.querySelector('.weather-icon');
const cityElement = document.querySelector('.city');
const tempElement = document.querySelector('.temp');
const humidityElement = document.querySelector('.humidity');
const windElement = document.querySelector('.wind');
const weatherDetails = document.querySelector('.weather-details');
const descriptionElement = document.querySelector('.description');

weatherDetails.style.display = 'none';

// Speak weather info
function speakWeatherInfo(city, temp, humidity, wind, description) {
    const message = `Weather in ${city}. 
        Temperature is ${temp}. 
        Humidity is ${humidity}. 
        Wind speed is ${wind}. 
        Condition: ${description}.`;

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'en-US';
    window.speechSynthesis.speak(speech);
}

// Fetch and display weather
async function checkWeather(city) {
    city = city.trim();
    if (!city) {
        weatherDetails.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (data.cod === 200) {
            weatherDetails.style.display = 'block';

            const weatherDesc = data.weather[0].description.toLowerCase();

            cityElement.textContent = data.name;
            tempElement.textContent = Math.round(data.main.temp) + '°C';
            humidityElement.textContent = data.main.humidity + '%';
            windElement.textContent = data.wind.speed + ' km/h';
            descriptionElement.textContent = data.weather[0].description;

            speakWeatherInfo(
                data.name,
                tempElement.textContent,
                humidityElement.textContent,
                windElement.textContent,
                data.weather[0].description
            );

            // Set weather icon
            if (weatherDesc.includes('rain')) {
                weatherIcon.src = 'assets/img/rain.svg';
            } else if (weatherDesc.includes('drizzle')) {
                weatherIcon.src = 'assets/img/cloud-drizzle.svg';
            } else if (weatherDesc.includes('mist')) {
                weatherIcon.src = 'assets/img/mist.svg';
            } else if (weatherDesc.includes('snow')) {
                weatherIcon.src = 'assets/img/snow.svg';
            } else if (weatherDesc.includes('clear')) {
                weatherIcon.src = 'assets/img/clear.svg';
            } else if (weatherDesc.includes('cloud') || weatherDesc.includes('overcast clouds')) {
                weatherIcon.src = 'assets/img/overcast.svg';
            } else {
                weatherIcon.src = 'assets/img/default.svg';
            }

        } else {
            weatherDetails.style.display = 'none';
            alert("City not found!");
        }
    } catch (error) {
        weatherDetails.style.display = 'none';
        alert("Failed to fetch weather data.");
        console.error('Fetch error:', error);
    }
}

// Handle text input
searchBtn.addEventListener('click', () => {
    checkWeather(searchBox.value);
});

searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkWeather(searchBox.value);
    }
});

// Voice input
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    // Start voice
    searchBtn.addEventListener('click', () => {
        recognition.start();
    });

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Transcript:", transcript);

        //  "weather in [city]"
        const match = transcript.match(/(?:weather\s*(in|for)?\s*)([a-zA-Z\s]+)/);
        let city = '';

        if (match && match[2]) {
            city = match[2].trim();
        } else {
            city = transcript.trim(); // fallback to full phrase
        }

        searchBox.value = city;
        checkWeather(city);
    };

    recognition.onerror = function (event) {
        alert("Speech recognition error: " + event.error);
    };
} else {
    alert("Speech recognition not supported in this browser.");
}

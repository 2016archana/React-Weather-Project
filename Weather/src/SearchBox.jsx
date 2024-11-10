import TextField from '@mui/material/TextField';
import { useState } from "react";
import Button from '@mui/material/Button';
import "./SearchBox.css";
import WeatherInfo from "./WeatherInfo";

export default function SearchBox() {
    const API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const API_KEY = import.meta.env.VITE_API_KEY;
    
    const [weatherData, setWeatherData] = useState(null);
    const [City, setCity] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [weatherClass, setWeatherClass] = useState("");

    const getWeatherClass = (weatherDescription) => {
        const weather = weatherDescription.toLowerCase();
        if (weather.includes('clear')) {
            return 'clear-sky';
        } else if (weather.includes('cloud')) {
            return 'clouds';
        } else if (weather.includes('rain') || weather.includes('drizzle')) {
            return 'rain';
        } else if (weather.includes('snow')) {
            return 'snow';
        } else if (weather.includes('thunderstorm')) {
            return 'thunderstorm';
        } else if (weather.includes('mist') || weather.includes('fog') || weather.includes('haze')) {
            return 'mist';
        }
        return '';
    };

    let getWeatherInfo = async () => {
        setIsLoading(true);
        setError(null);
        setWeatherData(null);

        try {
            let response = await fetch(`${API_URL}?q=${City}&appid=${API_KEY}&units=metric`);
            let jsonResponse = await response.json();
            
            if (jsonResponse.cod === 200) {
                let result = {
                    temp: jsonResponse.main.temp,
                    tempMin: jsonResponse.main.temp_min,
                    tempMax: jsonResponse.main.temp_max,
                    humidity: jsonResponse.main.humidity,
                    feelsLike: jsonResponse.main.feels_like,
                    weather: jsonResponse.weather[0].description,
                    city: jsonResponse.name,
                    country: jsonResponse.sys.country
                }
                setWeatherData(result);
                setWeatherClass(getWeatherClass(jsonResponse.weather[0].description));
                setError(null);
            } else {
                setWeatherData(null);
                setWeatherClass("");
                setError(
                    <div className="error-content">
                        <p className="error-title">City Not Found! 🔍</p>
                        <ul className="error-suggestions">
                            <li>"{City}" is not a valid city in our database</li>
                            <li>Please check the spelling of the city name</li>
                            <li>Try searching for a major city nearby</li>
                            <li>Make sure you're using the correct city name in English</li>
                        </ul>
                    </div>
                );
            }
        } catch (err) {
            setWeatherClass("");
            setError("Unable to connect to weather service. Please check your internet connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }

    let handleChange = (evt) => {
        setCity(evt.target.value);
        if (error) setError(null);
    };

    let handleSubmit = (evt) => {
        evt.preventDefault();
        if (City.trim() === "") {
            setError(
                <div className="error-content">
                    <p className="error-title">Empty Input! ⚠️</p>
                    <p>Please enter a city name to search for weather information.</p>
                </div>
            );
            return;
        }
        getWeatherInfo();
    };

    return (
        <div className="SearchBox">
            <h1>Search for Weather</h1>
            <form onSubmit={handleSubmit}>
                <TextField
                    id="city"
                    label="Enter city name"
                    variant="outlined"
                    required
                    value={City}
                    onChange={handleChange}
                    error={!!error}
                    disabled={isLoading}
                    InputProps={{
                        style: {
                            fontSize: '1.1rem',
                            padding: '12px 14px',
                            borderRadius: '10px',
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            fontSize: '1.1rem',
                        }
                    }}
                />
                <br />
                <br />
                <Button 
                    variant="contained" 
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Searching..." : "Search"}
                </Button>
            </form>

            {error && (
                <div className="error-container">
                    {error}
                </div>
            )}

            {weatherData && <WeatherInfo data={weatherData} />}
        </div>
    );
}

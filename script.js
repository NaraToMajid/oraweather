// Konfigurasi API
const API_KEY = '8f4b732d02c14a9d89762031252712';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Elemen DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocation = document.getElementById('currentLocation');
const weatherContent = document.getElementById('weatherContent');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

// State aplikasi
let currentUnit = 'c';
let currentWeatherData = null;

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Silakan masukkan nama kota');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'c') {
        setUnit('c');
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'f') {
        setUnit('f');
    }
});

// Fungsi untuk mengatur unit suhu
function setUnit(unit) {
    currentUnit = unit;
    
    if (unit === 'c') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        celsiusBtn.classList.remove('active');
        fahrenheitBtn.classList.add('active');
    }
    
    if (currentWeatherData) {
        renderWeatherData(currentWeatherData);
    }
}

// Fungsi untuk mendapatkan data cuaca
async function getWeatherData(city) {
    try {
        // Tampilkan loading state
        weatherContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p class="loading-text">Mencari data cuaca untuk ${city}...</p>
            </div>
        `;
        
        // Fetch data dari API
        const response = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`
        );
        
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Kota tidak ditemukan. Silakan coba dengan nama kota lain.');
            } else if (response.status === 403) {
                throw new Error('Akses API terbatas. Silakan coba lagi nanti.');
            } else {
                throw new Error('Terjadi kesalahan jaringan. Periksa koneksi internet Anda.');
            }
        }
        
        const data = await response.json();
        currentWeatherData = data;
        
        // Render data cuaca
        renderWeatherData(data);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
    }
}

// Fungsi untuk menampilkan error
function showError(message) {
    weatherContent.innerHTML = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="error-title">Terjadi Kesalahan</h3>
            <p class="error-message">${message}</p>
            <button onclick="getWeatherData('Jakarta')" class="retry-btn">
                <i class="fas fa-redo"></i>
                <span>Coba Jakarta</span>
            </button>
        </div>
    `;
}

// Fungsi untuk merender data cuaca
function renderWeatherData(data) {
    const { location, current, forecast } = data;
    
    // Update lokasi saat ini
    currentLocation.textContent = `${location.name}, ${location.country}`;
    
    // Tentukan unit suhu
    const tempUnit = currentUnit === 'c' ? '°C' : '°F';
    const tempValue = currentUnit === 'c' ? current.temp_c : current.temp_f;
    const feelsLikeValue = currentUnit === 'c' ? current.feelslike_c : current.feelslike_f;
    const windUnit = currentUnit === 'c' ? 'km/jam' : 'mil/jam';
    const windValue = currentUnit === 'c' ? current.wind_kph : current.wind_mph;
    const visibilityUnit = currentUnit === 'c' ? 'km' : 'mil';
    const visibilityValue = currentUnit === 'c' ? current.vis_km : current.vis_miles;
    
    // Dapatkan ikon cuaca
    const weatherIcon = getWeatherIcon(current.condition.code, current.is_day);
    
    // Format waktu lokal
    const localTime = new Date(location.localtime);
    const timeString = localTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateString = localTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Buat HTML untuk cuaca saat ini
    const currentWeatherHTML = `
        <div class="current-weather-container">
            <div class="weather-header">
                <div class="location-time">
                    <h2 class="current-location">${location.name}, ${location.country}</h2>
                    <div class="current-time">
                        <i class="fas fa-clock"></i>
                        <span>${timeString} • ${dateString}</span>
                    </div>
                </div>
            </div>
            
            <div class="weather-main-card">
                <div class="weather-condition">
                    <div class="condition-icon">
                        <i class="${weatherIcon}"></i>
                    </div>
                    <div class="condition-text">${current.condition.text}</div>
                </div>
                
                <div class="temperature-display">
                    <div class="current-temp">${Math.round(tempValue)}${tempUnit}</div>
                    <div class="feels-like">Terasa seperti ${Math.round(feelsLikeValue)}${tempUnit}</div>
                </div>
                
                <div class="weather-details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-wind"></i>
                        </div>
                        <div class="detail-info">
                            <h3>Angin</h3>
                            <p>${windValue} ${windUnit}</p>
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-tint"></i>
                        </div>
                        <div class="detail-info">
                            <h3>Kelembaban</h3>
                            <p>${current.humidity}%</p>
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-compress-alt"></i>
                        </div>
                        <div class="detail-info">
                            <h3>Tekanan</h3>
                            <p>${current.pressure_mb} mb</p>
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="detail-info">
                            <h3>Pandangan</h3>
                            <p>${visibilityValue} ${visibilityUnit}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Buat HTML untuk ramalan cuaca
    let forecastHTML = '';
    forecast.forecastday.forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
        const formattedDate = `${date.getDate()} ${date.toLocaleDateString('id-ID', { month: 'short' })}`;
        const forecastIcon = getWeatherIcon(day.day.condition.code, 1);
        const maxTemp = currentUnit === 'c' ? day.day.maxtemp_c : day.day.maxtemp_f;
        const minTemp = currentUnit === 'c' ? day.day.mintemp_c : day.day.mintemp_f;
        
        forecastHTML += `
            <div class="forecast-card">
                <div class="forecast-day">${index === 0 ? 'HARI INI' : dayName.toUpperCase()}</div>
                <div class="forecast-date">${formattedDate}</div>
                <div class="forecast-icon">
                    <i class="${forecastIcon}"></i>
                </div>
                <div class="forecast-condition">${day.day.condition.text}</div>
                <div class="forecast-temp">
                    <div class="temp-high">
                        <div class="temp-value">${Math.round(maxTemp)}°</div>
                        <div class="temp-label">Tinggi</div>
                    </div>
                    <div class="temp-low">
                        <div class="temp-value">${Math.round(minTemp)}°</div>
                        <div class="temp-label">Rendah</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Buat HTML untuk informasi tambahan
    const additionalInfoHTML = `
        <div class="additional-info">
            <div class="info-card">
                <h3>UV Index</h3>
                <div class="value">${current.uv}</div>
                <div class="unit">Level ${getUVLevel(current.uv)}</div>
            </div>
            
            <div class="info-card">
                <h3>Curah Hujan</h3>
                <div class="value">${current.precip_mm}</div>
                <div class="unit">mm</div>
            </div>
            
            <div class="info-card">
                <h3>Awan</h3>
                <div class="value">${current.cloud}</div>
                <div class="unit">%</div>
            </div>
            
            <div class="info-card">
                <h3>Angin</h3>
                <div class="value">${current.wind_degree}°</div>
                <div class="unit">${current.wind_dir}</div>
            </div>
            
            <div class="sun-times">
                <div class="sun-time">
                    <div class="label">
                        <i class="fas fa-sunrise"></i>
                        <span>Terbit</span>
                    </div>
                    <div class="time">${forecast.forecastday[0].astro.sunrise}</div>
                </div>
                <div class="sun-time">
                    <div class="label">
                        <i class="fas fa-sunset"></i>
                        <span>Terbenam</span>
                    </div>
                    <div class="time">${forecast.forecastday[0].astro.sunset}</div>
                </div>
            </div>
        </div>
    `;
    
    // Gabungkan semua HTML
    weatherContent.innerHTML = `
        ${currentWeatherHTML}
        <section class="forecast-section">
            <h2 class="section-title">
                <i class="fas fa-calendar-alt"></i>
                <span>Ramalan 5 Hari</span>
            </h2>
            <div class="forecast-scroll">
                ${forecastHTML}
            </div>
        </section>
        ${additionalInfoHTML}
    `;
}

// Fungsi untuk mendapatkan level UV
function getUVLevel(uvIndex) {
    if (uvIndex <= 2) return 'Rendah';
    if (uvIndex <= 5) return 'Sedang';
    if (uvIndex <= 7) return 'Tinggi';
    if (uvIndex <= 10) return 'Sangat Tinggi';
    return 'Ekstrem';
}

// Fungsi untuk mendapatkan ikon cuaca
function getWeatherIcon(code, isDay) {
    // Mapping kode kondisi WeatherAPI ke ikon FontAwesome
    const iconMap = {
        1000: isDay ? 'fas fa-sun' : 'fas fa-moon',
        1003: isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon',
        1006: 'fas fa-cloud',
        1009: 'fas fa-cloud',
        1030: 'fas fa-smog',
        1063: 'fas fa-cloud-rain',
        1066: 'fas fa-snowflake',
        1069: 'fas fa-cloud-meatball',
        1087: 'fas fa-bolt',
        1114: 'fas fa-wind',
        1117: 'fas fa-snowflake',
        1135: 'fas fa-smog',
        1147: 'fas fa-smog',
        1150: 'fas fa-cloud-rain',
        1153: 'fas fa-cloud-rain',
        1168: 'fas fa-icicles',
        1171: 'fas fa-icicles',
        1180: 'fas fa-cloud-rain',
        1183: 'fas fa-cloud-rain',
        1186: 'fas fa-cloud-showers-heavy',
        1189: 'fas fa-cloud-showers-heavy',
        1192: 'fas fa-cloud-showers-heavy',
        1195: 'fas fa-cloud-showers-heavy',
        1198: 'fas fa-icicles',
        1201: 'fas fa-icicles',
        1204: 'fas fa-cloud-meatball',
        1207: 'fas fa-cloud-meatball',
        1210: 'fas fa-snowflake',
        1213: 'fas fa-snowflake',
        1216: 'fas fa-snowflake',
        1219: 'fas fa-snowflake',
        1222: 'fas fa-snowflake',
        1225: 'fas fa-snowflake',
        1237: 'fas fa-cloud-meatball',
        1240: 'fas fa-cloud-rain',
        1243: 'fas fa-cloud-showers-heavy',
        1246: 'fas fa-cloud-showers-heavy',
        1249: 'fas fa-cloud-meatball',
        1252: 'fas fa-cloud-meatball',
        1255: 'fas fa-snowflake',
        1258: 'fas fa-snowflake',
        1261: 'fas fa-cloud-meatball',
        1264: 'fas fa-cloud-meatball',
        1273: 'fas fa-bolt',
        1276: 'fas fa-poo-storm',
        1279: 'fas fa-snowflake',
        1282: 'fas fa-snowflake'
    };
    
    return iconMap[code] || (isDay ? 'fas fa-sun' : 'fas fa-moon');
}

// Inisialisasi dengan cuaca Jakarta
window.onload = function() {
    getWeatherData('Jakarta');
    
    // Fokus pada input pencarian
    setTimeout(() => {
        cityInput.focus();
    }, 800);
};

// Tambahkan efek ketik untuk input
cityInput.addEventListener('input', function() {
    if (this.value.length > 0) {
        this.style.color = 'var(--text-primary)';
    } else {
        this.style.color = '';
    }
});

// Tambahkan fitur geolocation (opsional)
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherData(`${lat},${lon}`);
            },
            (error) => {
                console.error('Geolocation error:', error);
                getWeatherData('Jakarta');
            }
        );
    } else {
        getWeatherData('Jakarta');
    }
}

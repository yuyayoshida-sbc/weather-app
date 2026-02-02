"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  cityName: string;
  timezone: string;
  localTime: string;
  timeDifferenceFromJapan: number;
}

interface DailyForecast {
  date: string;
  dayOfWeek: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

interface GeoData {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

interface PresetCity {
  name: string;
  nameJa: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

const presetCities: PresetCity[] = [
  { name: "Tokyo", nameJa: "東京", latitude: 35.6762, longitude: 139.6503, country: "日本", timezone: "Asia/Tokyo" },
  { name: "New York", nameJa: "ニューヨーク", latitude: 40.7128, longitude: -74.006, country: "アメリカ", timezone: "America/New_York" },
  { name: "London", nameJa: "ロンドン", latitude: 51.5074, longitude: -0.1278, country: "イギリス", timezone: "Europe/London" },
  { name: "Paris", nameJa: "パリ", latitude: 48.8566, longitude: 2.3522, country: "フランス", timezone: "Europe/Paris" },
  { name: "Sydney", nameJa: "シドニー", latitude: -33.8688, longitude: 151.2093, country: "オーストラリア", timezone: "Australia/Sydney" },
  { name: "Singapore", nameJa: "シンガポール", latitude: 1.3521, longitude: 103.8198, country: "シンガポール", timezone: "Asia/Singapore" },
  { name: "Dubai", nameJa: "ドバイ", latitude: 25.2048, longitude: 55.2708, country: "UAE", timezone: "Asia/Dubai" },
  { name: "Los Angeles", nameJa: "ロサンゼルス", latitude: 34.0522, longitude: -118.2437, country: "アメリカ", timezone: "America/Los_Angeles" },
];

const weatherDescriptions: Record<number, { description: string; icon: string }> = {
  0: { description: "快晴", icon: "☀️" },
  1: { description: "晴れ", icon: "🌤️" },
  2: { description: "一部曇り", icon: "⛅" },
  3: { description: "曇り", icon: "☁️" },
  45: { description: "霧", icon: "🌫️" },
  48: { description: "霧氷", icon: "🌫️" },
  51: { description: "小雨", icon: "🌧️" },
  53: { description: "雨", icon: "🌧️" },
  55: { description: "強い雨", icon: "🌧️" },
  61: { description: "小雨", icon: "🌧️" },
  63: { description: "雨", icon: "🌧️" },
  65: { description: "大雨", icon: "🌧️" },
  71: { description: "小雪", icon: "🌨️" },
  73: { description: "雪", icon: "🌨️" },
  75: { description: "大雪", icon: "🌨️" },
  80: { description: "にわか雨", icon: "🌦️" },
  81: { description: "にわか雨", icon: "🌦️" },
  82: { description: "激しいにわか雨", icon: "⛈️" },
  95: { description: "雷雨", icon: "⛈️" },
  96: { description: "雷雨（雹）", icon: "⛈️" },
  99: { description: "激しい雷雨", icon: "⛈️" },
};

function getWeatherInfo(code: number) {
  return weatherDescriptions[code] || { description: "不明", icon: "❓" };
}

function getLocalTime(timezone: string): string {
  return new Date().toLocaleTimeString("ja-JP", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeDifferenceFromJapan(timezone: string): number {
  const now = new Date();
  const japanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return Math.round((localTime.getTime() - japanTime.getTime()) / (1000 * 60 * 60));
}

function formatTimeDifference(hours: number): string {
  if (hours === 0) return "日本と同じ";
  const sign = hours > 0 ? "+" : "";
  return `日本 ${sign}${hours}時間`;
}

function getDayOfWeek(dateString: string, timezone: string): string {
  const date = new Date(dateString + "T00:00:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const dayIndex = new Date(date.toLocaleString("en-US", { timeZone: timezone })).getDay();
  return days[dayIndex];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const STORAGE_KEY = "weather-app-recent-cities";

function loadRecentCities(): PresetCity[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveRecentCities(cities: PresetCity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  } catch {
    // localStorage unavailable
  }
}

export default function WeatherApp() {
  const [customCity, setCustomCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [recentCities, setRecentCities] = useState<PresetCity[]>([]);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);

  // 初回ロード時にlocalStorageから履歴を読み込む
  useEffect(() => {
    setRecentCities(loadRecentCities());
  }, []);

  // 現地時間をリアルタイム更新
  useEffect(() => {
    if (!weather) return;

    const updateTime = () => {
      setCurrentTime(getLocalTime(weather.timezone));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [weather]);

  const fetchWeather = async (latitude: number, longitude: number, cityName: string, timezone: string) => {
    setLoading(true);
    setError("");
    setForecast([]);

    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=${encodeURIComponent(timezone)}`
      );
      const weatherData = await weatherResponse.json();

      const timeDiff = getTimeDifferenceFromJapan(timezone);

      setWeather({
        temperature: weatherData.current.temperature_2m,
        weatherCode: weatherData.current.weather_code,
        windSpeed: weatherData.current.wind_speed_10m,
        humidity: weatherData.current.relative_humidity_2m,
        cityName,
        timezone,
        localTime: getLocalTime(timezone),
        timeDifferenceFromJapan: timeDiff,
      });

      // 7日間予報を設定
      const dailyData: DailyForecast[] = weatherData.daily.time.map((date: string, index: number) => ({
        date: formatDate(date),
        dayOfWeek: getDayOfWeek(date, timezone),
        weatherCode: weatherData.daily.weather_code[index],
        tempMax: Math.round(weatherData.daily.temperature_2m_max[index]),
        tempMin: Math.round(weatherData.daily.temperature_2m_min[index]),
      }));
      setForecast(dailyData);
    } catch {
      setError("天気情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetCityClick = (city: PresetCity) => {
    fetchWeather(city.latitude, city.longitude, `${city.nameJa}, ${city.country}`, city.timezone);
  };

  const searchCustomCity = async () => {
    if (!customCity.trim()) {
      setError("都市名を入力してください");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(customCity)}&count=1&language=ja`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("都市が見つかりませんでした");
        setLoading(false);
        return;
      }

      const location: GeoData = geoData.results[0];

      // 検索履歴に追加
      const newCity: PresetCity = {
        name: location.name,
        nameJa: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        timezone: location.timezone,
      };

      // 重複チェック（プリセットと履歴の両方）
      const isInPreset = presetCities.some(
        (c) => c.latitude === newCity.latitude && c.longitude === newCity.longitude
      );
      const isInRecent = recentCities.some(
        (c) => c.latitude === newCity.latitude && c.longitude === newCity.longitude
      );

      if (!isInPreset && !isInRecent) {
        const updatedRecent = [newCity, ...recentCities].slice(0, 5); // 最大5件
        setRecentCities(updatedRecent);
        saveRecentCities(updatedRecent);
      }

      await fetchWeather(
        location.latitude,
        location.longitude,
        `${location.name}, ${location.country}`,
        location.timezone
      );
      setCustomCity("");
    } catch {
      setError("天気情報の取得に失敗しました");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchCustomCity();
    }
  };

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        世界の天気アプリ
      </h1>

      {/* プリセット都市ボタン */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">都市を選択:</p>
        <div className="flex flex-wrap gap-2">
          {presetCities.map((city) => (
            <button
              key={city.name}
              onClick={() => handlePresetCityClick(city)}
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              {city.nameJa}
            </button>
          ))}
          {recentCities.map((city) => (
            <button
              key={`recent-${city.name}-${city.latitude}`}
              onClick={() => handlePresetCityClick(city)}
              disabled={loading}
              className="px-4 py-2 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full text-sm text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 hover:border-green-400 dark:hover:border-green-600 transition-colors disabled:opacity-50"
            >
              {city.nameJa}
            </button>
          ))}
        </div>
      </div>

      {/* カスタム検索 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">または都市名で検索:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="都市名を入力（例: バンコク）"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchCustomCity}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "..." : "検索"}
          </button>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* 天気情報 */}
      {weather && weatherInfo && (
        <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl text-white shadow-lg">
          <div className="text-center mb-4">
            <p className="text-lg opacity-90">{weather.cityName}</p>
            <div className="text-7xl my-4">{weatherInfo.icon}</div>
            <p className="text-5xl font-bold">{weather.temperature}°C</p>
            <p className="text-xl mt-2">{weatherInfo.description}</p>
          </div>

          {/* 時間情報 */}
          <div className="mt-6 pt-4 border-t border-white/30">
            <div className="text-center mb-4">
              <p className="text-sm opacity-75">現地時間</p>
              <p className="text-3xl font-bold">{currentTime}</p>
              <p className="text-sm mt-1 opacity-90">
                {formatTimeDifference(weather.timeDifferenceFromJapan)}
              </p>
            </div>
          </div>

          {/* その他の情報 */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/30">
            <div className="text-center">
              <p className="text-sm opacity-75">湿度</p>
              <p className="text-xl font-semibold">{weather.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-75">風速</p>
              <p className="text-xl font-semibold">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      )}

      {/* 1週間予報 */}
      {forecast.length > 0 && (
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">1週間予報</h2>
          <div className="space-y-3">
            {forecast.map((day, index) => {
              const dayWeatherInfo = getWeatherInfo(day.weatherCode);
              const isToday = index === 0;
              return (
                <div
                  key={day.date}
                  className={`flex items-center justify-between py-2 ${
                    index !== forecast.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 w-24">
                    <span className={`text-sm ${isToday ? "font-bold text-blue-500" : "text-gray-600 dark:text-gray-400"}`}>
                      {isToday ? "今日" : `${day.date}(${day.dayOfWeek})`}
                    </span>
                  </div>
                  <div className="text-2xl">{dayWeatherInfo.icon}</div>
                  <div className="flex items-center gap-2 w-24 justify-end">
                    <span className="text-red-500 font-semibold">{day.tempMax}°</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-blue-500 font-semibold">{day.tempMin}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 初期状態のヒント */}
      {!weather && !error && !loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-6xl mb-4">🌍</p>
          <p>上のボタンから都市を選ぶか、検索してみましょう</p>
        </div>
      )}
    </div>
  );
}

const axios = require("axios");

async function getGeoLocation(city) {
  try {
    const { data } = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: city,
          appid: process.env.OPEN_WEATHER_TOKEN,
          limit: 5,
        },
      }
    );

    const arr = data.length > 1 ? removeDublicates(data) : data;
    return arr.map((itm) => {
      return {
        name: getName(itm),
        lat: itm.lat,
        lon: itm.lon,
      };
    });
  } catch (err) {
    throw formatOpenWeatherError(err, "geocoding");
  }
}

async function getWeather(city, type) {
  try {
    const { lat, lon } = city;

    if (type === "current") {
      const { data } = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            lat: lat,
            lon: lon,
            appid: process.env.OPEN_WEATHER_TOKEN,
            lang: "ru",
            units: "metric",
          },
        }
      );

      return {
        current: {
          dt: getLongDate(data.dt),
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          pressure: Math.round(data.main.pressure * 0.75),
          wind_speed: data.wind?.speed || "",
          wind_gust: data.wind?.gust || "",
          wind_deg: data.wind?.deg !== undefined ? getWindDirection(data.wind.deg) : "",
          weather: data.weather?.length ? data.weather : [{ main: "" }],
          humidity: data.main.humidity,
          clouds: data.clouds?.all || "",
          precipitation: getPrecipitation(data),
          sunrise: getTime(data.sys?.sunrise),
          sunset: getTime(data.sys?.sunset),
        },
      };
    } else if (type === "daily") {
      const { data } = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params: {
            lat: lat,
            lon: lon,
            appid: process.env.OPEN_WEATHER_TOKEN,
            lang: "ru",
            units: "metric",
          },
        }
      );
      return { daily: mapForecastToDaily(data) };
    }

    return {};
  } catch (err) {
    throw formatOpenWeatherError(err, "weather");
  }
}

function formatTemperature(temp) {
  let t = Math.round(temp).toString();

  switch (t.length) {
    case 1:
      t = `  ${t}`;
      break;
    case 2:
      t = ` ${t}`;
      break;
  }
  return t;
}

function removeDublicates(arr) {
  const result = arr.reduce((acc, v) => {
    if (
      !acc.find(
        (itm) =>
          (itm.lat === v.lat && itm.lon === v.lon) ||
          (itm.name === v.name &&
            itm.country === v.country &&
            itm.state === v.state)
      )
    ) {
      acc.push(v);
    }
    return acc;
  }, []);
  return result;
}

function formatOpenWeatherError(err, api) {
  if (!axios.isAxiosError(err)) {
    return err;
  }

  const status = err.response?.status;
  const message = err.response?.data?.message;

  return new Error(
    `OpenWeather ${api} request failed${status ? ` (${status})` : ""}${
      message ? `: ${message}` : ""
    }`
  );
}

function getName(data) {
  return data.state
    ? `${data.name}, ${data.country}, ${data.state}`
    : `${data.name}, ${data.country}`;
}

function getWindDirection(value) {
  const direction = [
    "С",
    "С/СВ",
    "СВ",
    "В/СВ",
    "В",
    "В/ЮВ",
    "ЮВ",
    "Ю/ЮВ",
    "Ю",
    "Ю/ЮЗ",
    "ЮЗ",
    "З/ЮЗ",
    "З",
    "З/СЗ",
    "СЗ",
    "С/СЗ",
    "С",
  ];
  return direction[(value / 22.5).toFixed(0)];
}

function getPrecipitation(data) {
  const { snow, rain } = data;
  let value = "";
  if (!(rain || snow)) return "";

  if (rain) {
    if (typeof rain === "number") value = rain;
    else value = rain["1h"] || rain["3h"] || "";
    return value;
  }

  if (snow) {
    if (typeof snow === "number") value = snow;
    else value = snow["1h"] || snow["3h"] || "";
    return value;
  }
}

function getShortDate(value) {
  return new Date(value * 1000).toLocaleDateString("ru", {
    day: "numeric",
    month: "numeric",
  });
}

function getLongDate(value) {
  return new Date(value * 1000).toLocaleDateString("ru");
}

function getTime(value) {
  if (!value) return "";

  let hours = new Date(value * 1000).getHours();
  let minutes = new Date(value * 1000).getMinutes();

  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;

  return `${hours}:${minutes}`;
}

function getWeekDay(value) {
  return new Date(value * 1000).toLocaleDateString("ru", { weekday: "short" });
}

function mapForecastToDaily(forecast) {
  const list = forecast.list || [];
  const timezoneOffset = forecast.city?.timezone || 0;
  const sunrise = forecast.city?.sunrise;
  const sunset = forecast.city?.sunset;

  const grouped = list.reduce((acc, itm) => {
    const dayKey = getDayKey(itm.dt, timezoneOffset);
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(itm);
    return acc;
  }, {});

  return Object.keys(grouped)
    .slice(0, 5)
    .map((dayKey) => {
      const items = grouped[dayKey];
      const morn = getClosestHourItem(items, timezoneOffset, 6);
      const day = getClosestHourItem(items, timezoneOffset, 12);
      const eve = getClosestHourItem(items, timezoneOffset, 18);
      const night = getClosestHourItem(items, timezoneOffset, 0);

      const source = day || items[0];
      const pressure = getAverage(items, (itm) => itm.main?.pressure);
      const humidity = getAverage(items, (itm) => itm.main?.humidity);
      const clouds = getAverage(items, (itm) => itm.clouds?.all);
      const windSpeed = getAverage(items, (itm) => itm.wind?.speed);
      const gustValues = items
        .map((itm) => itm.wind?.gust)
        .filter((itm) => typeof itm === "number");
      const windGust = gustValues.length ? Math.max(...gustValues) : "";
      const precipitation = getSum(items, (itm) => getPrecipitation(itm));

      return {
        dt: getShortDate(source.dt),
        w: getWeekDay(source.dt),
        temp: {
          morn: Math.round(morn.main.temp),
          day: Math.round(day.main.temp),
          eve: Math.round(eve.main.temp),
          night: Math.round(night.main.temp),
        },
        feels_like: {
          morn: formatTemperature(morn.main.feels_like),
          day: formatTemperature(day.main.feels_like),
          eve: formatTemperature(eve.main.feels_like),
          night: formatTemperature(night.main.feels_like),
        },
        pressure: pressure === "" ? "" : Math.round(pressure * 0.75),
        wind_speed: windSpeed === "" ? "" : Math.round(windSpeed * 10) / 10,
        wind_gust: windGust === "" ? "" : Math.round(windGust * 10) / 10,
        wind_deg:
          source.wind?.deg !== undefined ? getWindDirection(source.wind.deg) : "",
        weather: source.weather?.length ? source.weather : [{ main: "" }],
        humidity: humidity === "" ? "" : Math.round(humidity),
        clouds: clouds === "" ? "" : Math.round(clouds),
        precipitation:
          precipitation === 0 ? "" : Math.round(precipitation * 100) / 100,
        sunrise: getTime(sunrise),
        sunset: getTime(sunset),
        moon_phase: "",
      };
    });
}

function getDayKey(timestamp, offset) {
  const local = new Date((timestamp + offset) * 1000);
  const year = local.getUTCFullYear();
  const month = `${local.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${local.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalHour(timestamp, offset) {
  const local = new Date((timestamp + offset) * 1000);
  return local.getUTCHours();
}

function getClosestHourItem(items, offset, targetHour) {
  return items.reduce((best, current) => {
    if (!best) return current;

    const bestDiff = Math.abs(getLocalHour(best.dt, offset) - targetHour);
    const currentDiff = Math.abs(getLocalHour(current.dt, offset) - targetHour);
    return currentDiff < bestDiff ? current : best;
  }, null);
}

function getAverage(items, extractor) {
  const values = items.map(extractor).filter((itm) => typeof itm === "number");
  if (!values.length) return "";
  return values.reduce((acc, itm) => acc + itm, 0) / values.length;
}

function getSum(items, extractor) {
  const values = items.map(extractor).filter((itm) => typeof itm === "number");
  if (!values.length) return 0;
  return values.reduce((acc, itm) => acc + itm, 0);
}

module.exports = {
  getGeoLocation,
  getWeather,
};

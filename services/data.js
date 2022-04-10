const axios = require('axios')

async function getGeoLocation(city) {
  try {
    const { data } = await axios.get(
      'http://api.openweathermap.org/geo/1.0/direct',
      {
        params: {
          q: city,
          appid: process.env.OPEN_WEATHER_TOKEN,
          limit: 5,
        },
      }
    )

    const arr = data.length > 1 ? removeDublicates(data) : data
    return arr.map((itm) => {
      return {
        name: getName(itm),
        lat: itm.lat,
        lon: itm.lon,
      }
    })
  } catch (err) {
    console.error(err)
  }
}

async function getWeather(city, type) {
  try {
    const { lat, lon } = city
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/onecall',
      {
        params: {
          lat: lat,
          lon: lon,
          appid: process.env.OPEN_WEATHER_TOKEN,
          lang: 'ru',
          units: 'metric',
          exclude: getTypeOfWeatherData(type),
        },
      }
    )
    if (type === 'current') {
      data.current.dt = getLongDate(data.current.dt)
      data.current.temp = Math.round(data.current.temp)
      data.current.feels_like = Math.round(data.current.feels_like)
      data.current.pressure = Math.round(data.current.pressure * 0.75)
      data.current.wind_gust = data.current.wind_gust
        ? data.current.wind_gust
        : ''
      data.current.wind_deg = getWindDirection(data.current.wind_deg)
      data.current.precipitation = getPrecipitation(data.current)
      data.current.sunrise = getTime(data.current.sunrise)
      data.current.sunset = getTime(data.current.sunset)
    } else if (type === 'daily') {
      data.daily.forEach((itm) => {
        itm.w = getWeekDay(itm.dt)
        itm.dt = getShortDate(itm.dt)
        itm.temp.morn = Math.round(itm.temp.morn)
        itm.temp.day = Math.round(itm.temp.day)
        itm.temp.eve = Math.round(itm.temp.eve)
        itm.temp.night = Math.round(itm.temp.night)

        itm.feels_like.morn = formatTemperature(itm.feels_like.morn)
        itm.feels_like.day = formatTemperature(itm.feels_like.day)
        itm.feels_like.eve = formatTemperature(itm.feels_like.eve)
        itm.feels_like.night = formatTemperature(itm.feels_like.night)

        itm.pressure = Math.round(itm.pressure * 0.75)
        itm.wind_deg = getWindDirection(itm.wind_deg)
        itm.sunrise = getTime(itm.sunrise)
        itm.sunset = getTime(itm.sunset)
        itm.precipitation = itm.rain || itm.snow ? itm.rain || itm.snow : ''
      })
    }
    return data
  } catch (err) {
    console.error(err)
  }
}

function formatTemperature(temp) {
  let t = Math.round(temp).toString()

  switch (t.length) {
    case 1:
      t = `  ${t}`
      break
    case 2:
      t = ` ${t}`
      break
  }
  return t
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
      acc.push(v)
    }
    return acc
  }, [])
  return result
}

function getTypeOfWeatherData(type) {
  const arr = ['current', 'minutley', 'hourly', 'daily', 'alerts']

  return arr.filter((itm) => itm !== type).join()
}

function getName(data) {
  return data.state
    ? `${data.name}, ${data.country}, ${data.state}`
    : `${data.name}, ${data.country}`
}

function getWindDirection(value) {
  const direction = [
    'С',
    'С/СВ',
    'СВ',
    'В/СВ',
    'В',
    'В/ЮВ',
    'ЮВ',
    'Ю/ЮВ',
    'Ю',
    'Ю/ЮЗ',
    'ЮЗ',
    'З/ЮЗ',
    'З',
    'З/СЗ',
    'СЗ',
    'С/СЗ',
    'С',
  ]
  return direction[(value / 22.5).toFixed(0)]
}

function getPrecipitation(data) {
  const { snow, rain } = data
  let value = 0
  if (!(rain || snow)) return ''

  if (rain) {
    rain['1h'] ? (value = rain['1h']) : (value = rain)
    return value
  }

  if (snow) {
    snow['1h'] ? (value = snow['1h']) : (value = snow)
    return value
  }
}

function getShortDate(value) {
  return new Date(value * 1000).toLocaleDateString('ru', {
    day: 'numeric',
    month: 'numeric',
  })
}

function getLongDate(value) {
  return new Date(value * 1000).toLocaleDateString('ru')
}

function getTime(value) {
  let hours = new Date(value * 1000).getHours()
  let minutes = new Date(value * 1000).getMinutes()

  if (hours < 10) hours = `0${hours}`
  if (minutes < 10) minutes = `0${minutes}`

  return `${hours}:${minutes}`
}

function getWeekDay(value) {
  return new Date(value * 1000).toLocaleDateString('ru', { weekday: 'short' })
}

module.exports = {
  getGeoLocation,
  getWeather,
}

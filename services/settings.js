const { isExist } = require('../helpers/utils')
const { writeToken, readSettings, writeSettings } = require('./io')
const { getGeoLocation } = require('./data')
const {
  saveTokenPrompt,
  enterCityPrompt,
  confirmCityPrompt,
} = require('./prompt')
const { ENV_PATH, SETTINGS_PATH } = require('./constants')

async function getConfiguration() {
  let settings = {}
  if (!(await isExist(SETTINGS_PATH))) return settings

  settings = await readSettings(SETTINGS_PATH)

  return settings
}

function getCityByName(cityName, list) {
  return list
    .filter((itm) => itm.name === cityName)
    .map((itm) => {
      return {
        name: itm.name,
        lat: itm.lat,
        lon: itm.lon,
      }
    })[0]
}

async function saveToken(token) {
  let t
  typeof token !== 'boolean' && token !== undefined
    ? (t = token)
    : (t = await saveTokenPrompt())
  await writeToken(ENV_PATH, t)
}

async function processDefaultCity(args) {
  const settings = await getConfiguration()

  let c
  let city

  if (args) {
    typeof args.c === 'boolean'
      ? (c = await enterCityPrompt())
      : args._.length
      ? (c = `${args.c ? args.c : ''} ${args._.join(' ')}`)
      : (c = args.c)
  } else {
    if (!settings.defaultCity) {
      c = await enterCityPrompt()
    }
  }

  if (c) {
    const cities = await getGeoLocation(c)

    if (!cities.length) {
      console.log('Введенный город не найден')
      await processDefaultCity()
      return
    }

    if (cities.length === 1) {
      city = cities[0]
    } else {
      const selected = await confirmCityPrompt(cities)
      city = getCityByName(selected, cities)
    }

    if (settings.cities) {
      settings.cities = settings.cities.filter((itm) => {
        return itm.lat !== city.lat && itm.lon !== city.lon
      })
    }

    settings.defaultCity = city
    await writeSettings(SETTINGS_PATH, settings)

    return city
  }

  return settings.defaultCity
}

async function processListOfCities(args) {
  const settings = await getConfiguration()

  let city

  if (args.l) {
    const { cities } = settings

    if (!cities)
      return console.log('Список последних просмотренных городов пуст')

    const selected = await confirmCityPrompt(cities)
    city = getCityByName(selected, cities)
    return city
  } else {
    const input = args._.join(' ')
    const { defaultCity } = settings
    if (!defaultCity) return await processDefaultCity(args)

    const cities = await getGeoLocation(input)

    if (!cities.length) {
      console.log('Введенный город не найден')
      city = await enterCityPrompt()
      args._ = [city]
      return await processListOfCities(args)
    }

    if (cities.length === 1) {
      city = cities[0]
    } else {
      const selected = await confirmCityPrompt(cities)
      city = getCityByName(selected, cities)
    }

    const isDefault =
      city.lat === defaultCity.lat && city.lon === defaultCity.lon
    if (isDefault) return city

    if (settings.cities) {
      const dublicate = settings.cities.filter(
        (itm) => itm.lat === city.lat && itm.lon === city.lon
      )
      if (dublicate.length) return dublicate[0]
    } else {
      settings.cities = []
    }

    settings.cities.push(city)

    if (settings.cities.length > 5) {
      settings.cities = settings.cities.slice(1)
    }

    await writeSettings(SETTINGS_PATH, settings)

    return city
  }
}

module.exports = {
  saveToken,
  processDefaultCity,
  processListOfCities,
}

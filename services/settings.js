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

module.exports = {
  saveToken,
  processDefaultCity,
}

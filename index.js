#!/usr/bin/env node

const args = require('./services/args')
const { isExist } = require('./helpers/utils')
const { ENV_PATH } = require('./services/constants')
const {
  versionLog,
  helpLog,
  currentWeatherLog,
  dailyWeatherLog,
} = require('./services/log')
const { saveToken, processDefaultCity } = require('./services/settings')
const { getWeather } = require('./services/data')

initCli()

async function initCli() {
  //-------------------------------------------------- Обрабатываем weather -v ---------------
  //------------------------------------------------------------------------------------------
  if (args.v) {
    versionLog()
    return
  }

  //-------------------------------------------------- Обрабатываем weather -h ---------------
  //------------------------------------------------------------------------------------------
  if (args.h) {
    helpLog()
    return
  }

  //-------------------------------------------------- Обрабатываем weather -t [<token>] -----
  //------------------------------------------------------------------------------------------
  if (args.t) {
    await saveToken(args.t)
    return
  }

  //-------------------------------------------------- Записываем токен при первом запуске ---
  //------------------------------------------------------------------------------------------
  const isEnv = await isExist(ENV_PATH)
  if (!isEnv) await saveToken()
  require('dotenv').config({ path: ENV_PATH })

  //-------------------------------------------------- Обрабатываем weather -c [<city>] ------
  //------------------------------------------------------------------------------------------
  if (args.c) {
    await processDefaultCity(args)
    return
  }

  //-------------------------------------------------- Обрабатываем weather [-d] -------------
  //------------------------------------------------------------------------------------------
  if (process.argv.length === 2 || (args._.length === 0 && args.d)) {
    const city = await processDefaultCity()

    if (args.d) {
      const weatherData = await getWeather(city, 'daily')
      weatherData.name = city.name
      dailyWeatherLog(weatherData)
    } else {
      const weatherData = await getWeather(city, 'current')
      weatherData.name = city.name
      currentWeatherLog(weatherData)
    }
    return
  }
}

const ui = require('cliui')()
const { clearConsole } = require('../helpers/utils')
const pkg = require('../package')

function versionLog() {
  clearConsole()

  console.log(getTitle())
}

function helpLog() {
  ui.div({
    text: getTitle(),
    width: 80,
    padding: [0, 0, 1, 0],
    align: 'left',
  })

  ui.div({
    text: 'Usage: weather [<city>] [options]',
  })

  ui.div({
    text: 'Options:',
    padding: [1, 0, 1, 0],
  })

  ui.div(
    {
      text: `-d, --daily
             -h, --help
             -v, --version
             -t, --set-token
             -c, --set-city
             -l, --list-of-cities`,
      width: 30,
      padding: [0, 2, 0, 2],
    },
    {
      text: `Показать погоду на неделю
             Показать справочную информацию
             Показать версию приложения
             Сохранить токен для доступа к OpenWeather api
             Сохранить город в качестве города по умолчанию
             Показать список последних просмотренных городов`,
      width: 50,
    }
  )

  clearConsole()
  console.log(ui.toString())
}

function getTitle() {
  const pkg = require('../package')
  const name = pkg.name.split('/')[1]
  return `${name} (v.${pkg.version})`
}

function currentWeatherLog(data) {
  ui.div({
    text: data.name,
    width: 35,
    padding: [1, 0, 0, 0],
    align: 'right',
  })

  ui.div({
    text: data.current.dt,
    width: 35,
    padding: [0, 0, 1, 0],
    align: 'right',
  })

  ui.div(
    {
      text: `Температура, 'C:
             Ощущается, 'C:
             
             Атм. давление, мм:
             
             Ветер, м/с:
             Порывы ветра, м/с:
             Направление ветра:

             Погодные условия:
             Влажность, %:
             Облачность, %:
             Осадки, мм:

             Восход:
             Закат:
           `,
      width: 25,
    },
    {
      text: `${data.current.temp}
             ${data.current.feels_like}

             ${data.current.pressure}

             ${data.current.wind_speed}
             ${data.current.wind_gust}
             ${data.current.wind_deg}

             ${data.current.weather[0].main}
             ${data.current.humidity}
             ${data.current.clouds}
             ${data.current.precipitation}

             ${data.current.sunrise}
             ${data.current.sunset}
             `,
      width: 10,
      align: 'right',
    }
  )

  clearConsole()
  console.log(ui.toString())
}

function dailyWeatherLog(data) {
  const { daily } = data

  const headerArgs = []
  const tempArgs = []
  const weatherArgs = []

  daily.forEach((itm) => {
    headerArgs.push({
      width: 12,
      align: 'right',
      text: `${itm.dt}
             ${itm.w}`,
    })

    tempArgs.push(
      {
        width: 6,
        align: 'right',
        text: `
             ${itm.temp.morn}
             ${itm.temp.day}
             ${itm.temp.eve}
             ${itm.temp.night}`,
      },
      {
        width: 6,
        align: 'right',
        text: `
             (${itm.feels_like.morn})
             (${itm.feels_like.day})
             (${itm.feels_like.eve})
             (${itm.feels_like.night})
             `,
      }
    )

    weatherArgs.push({
      width: 12,
      align: 'right',
      text: `${itm.pressure}

             ${itm.wind_speed}
             ${itm.wind_gust}
             ${itm.wind_deg}

             ${itm.weather[0].main}
             ${itm.humidity}
             ${itm.clouds}
             ${itm.precipitation}

             ${itm.sunrise}
             ${itm.sunset}
             ${itm.moon_phase}`,
    })
  })

  ui.div({
    text: data.name,
    width: 116,
    padding: [1, 0, 1, 0],
    align: 'right',
  })

  ui.div(
    {
      text: `
    `,
      width: 20,
    },
    ...headerArgs
  )

  ui.div(
    {
      text: `Температура, 'C:
           --Утро:
           --День:
           --Вечер:
           --Ночь:
           `,
      width: 20,
    },
    ...tempArgs
  )

  ui.div(
    {
      text: `Атм. давление, мм:

            Ветер, м/с:
            Порывы ветра, м/с:
            Направление ветра:

            Погодные условия:
            Влажность, %:
            Облачность, %:
            Осадки, мм:

            Восход:
            Закат:
            Фаза луны:

    `,
      width: 20,
    },
    ...weatherArgs
  )

  clearConsole()
  console.log(ui.toString())
}

module.exports = {
  versionLog,
  helpLog,
  currentWeatherLog,
  dailyWeatherLog,
}

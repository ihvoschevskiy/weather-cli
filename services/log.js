const ui = require('cliui')()
const { clearConsole } = require('../helpers/utils')
const pkg = require('../package')

function versionLog() {
  clearConsole()

  console.log(getTitle())
}

function helpLog() {
  clearConsole()
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

module.exports = {
  versionLog,
  helpLog,
}

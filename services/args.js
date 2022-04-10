const args = require('yargs/yargs')(process.argv.slice(2))
  .version(false)
  .help(false)
  .option('d', {
    alias: 'daily',
    description: 'Показать погоду на неделю',
  })
  .option('v', {
    alias: 'version',
    description: 'Показать версию приложения',
  })
  .option('h', {
    alias: 'help',
    description: 'Показать справочную информацию',
  })
  .option('t', {
    alias: 'save-token',
    description: 'Сохранить токен для доступа к OpenWeather api',
  })
  .option('c', {
    alias: 'save-city',
    description: 'Сохранить город в качестве города по умолчанию',
  })
  .option('l', {
    alias: 'list-of-cites',
    description: 'Показать список последних просмотренных городов',
  }).argv

module.exports = args

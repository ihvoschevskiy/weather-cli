const { homedir } = require('os')
const { join } = require('path')

const ENV_PATH = join(homedir(), '.weather-cli', '.env')
const SETTINGS_PATH = join(homedir(), '.weather-cli', 'weather.json')

module.exports = {
  ENV_PATH,
  SETTINGS_PATH,
}

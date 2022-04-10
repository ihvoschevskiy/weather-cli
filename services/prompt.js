const { prompt } = require('enquirer')

async function saveTokenPrompt() {
  try {
    const response = await prompt({
      type: 'password',
      name: 'token',
      message: 'Введите ваш токен для доступа к OpenWeather api',
    })

    const token = response.token.trim()
    if (!token.length) return saveTokenPrompt()

    return token
  } catch (err) {
    process.exit()
  }
}

async function enterCityPrompt() {
  try {
    const response = await prompt({
      type: 'input',
      name: 'city',
      message: 'Введите название города',
    })

    const city = response.city.trim()
    if (!city.length) return await setCityPrompt()

    return city
  } catch (err) {
    process.exit()
  }
}

async function confirmCityPrompt(data) {
  const arr = data.map((itm) => itm.name)
  try {
    const response = await prompt({
      type: 'select',
      name: 'city',
      message: 'Подтвердите ваш выбор',
      choices: arr,
    })

    return response.city
  } catch (err) {
    process.exit()
  }
}

module.exports = {
  saveTokenPrompt,
  enterCityPrompt,
  confirmCityPrompt,
}

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

module.exports = {
  saveTokenPrompt,
}

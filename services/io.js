const { dirname } = require('path')
const { promises } = require('fs')
const { isExist } = require('../helpers/utils')

async function writeToken(path, token) {
  try {
    const dir = dirname(path)

    if (!(await isExist(dir))) {
      await promises.mkdir(dir, { recursive: true })
    }
    await promises.writeFile(path, `OPEN_WEATHER_TOKEN=${token}`)
  } catch (err) {
    console.error(err)
  }
}

async function writeSettings(path, data) {
  try {
    const dir = dirname(path)
    if (!(await isExist(dir))) {
      await promises.mkdir(dir, { recursive: true })
    }
    await promises.writeFile(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

async function readSettings(path) {
  try {
    if (!(await isExist(path))) return

    const data = await promises.readFile(path)
    return JSON.parse(data)
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  writeToken,
  writeSettings,
  readSettings,
}

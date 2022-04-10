const { homedir } = require('os')
const { join, dirname } = require('path')
const { promises } = require('fs')
const { isExist } = require('../helpers/utils')
const { writeToken, writeSettings, readSettings } = require('../services/io')

async function removeTestingData(path) {
  const dir = dirname(path)
  if (await isExist(dir)) {
    await promises.rm(dir, { recursive: true, force: true })
  }
}

describe('io.js', () => {
  const envPath = join(homedir(), 'tests', '.weather-cli', '.env')
  const setPath = join(homedir(), 'tests', '.weather-cli', 'weather.json')

  describe('writeToken', () => {
    afterAll(async () => {
      await removeTestingData(envPath)
    })

    it('запишет переданный токен в файл по заданному пути', async () => {
      const token = 'token1234'
      await writeToken(envPath, token)
      const data = await promises.readFile(envPath)
      expect(data.toString()).toBe(`OPEN_WEATHER_TOKEN=${token}`)
    })
  })

  describe('writeSettings and readSettings', () => {
    const data = { a: 'a', b: [{ c: 'c' }, { d: 'd' }] }
    afterAll(async () => {
      await removeTestingData(setPath)
    })

    it('запишет данные в файл с настройками и прочитает их', async () => {
      await writeSettings(setPath, data)
      const read = await readSettings(setPath)
      expect(read).toEqual(data)
    })
  })
})

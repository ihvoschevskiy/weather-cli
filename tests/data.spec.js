const { homedir } = require('os')
const { join, dirname } = require('path')
const { promises } = require('fs')
const { isExist } = require('../helpers/utils')
const { writeToken } = require('../services/io')
const { getGeoLocation, getWeather } = require('../services/data')

const token = ''

async function removeTestingData(path) {
  const dir = dirname(path)
  if (await isExist(dir)) {
    await promises.rm(dir, { recursive: true, force: true })
  }
}

describe('data.js', () => {
  const envPath = join(homedir(), 'tests', '.weather-cli', '.env')

  const city = {
    name: 'Abakan, RU, Republic of Khakassia',
    lat: 53.7206497,
    lon: 91.4403553,
  }

  beforeAll(async () => {
    await writeToken(envPath, token)
    require('dotenv').config({ path: envPath })
  })

  afterAll(async () => {
    await removeTestingData(envPath)
  })

  describe('getGeolocation', () => {
    it('вернет массив объектов с геолокационными данными для указанного города', async () => {
      const data = await getGeoLocation('abakan')
      expect(data[0]).toEqual(city)
    })
    it('проверит количество элементов в списке городов', async () => {
      expect(await getGeoLocation('abakan')).toHaveLength(1)
      expect(await getGeoLocation('moskow')).toHaveLength(3)
    })
  })

  describe('getWeather', () => {
    it('вернет текущую погоду для заданного города', async () => {
      const data = await getWeather(city, 'current')
      expect(data).toHaveProperty('current')
    })

    it('вернет данные о погоде на неделю', async () => {
      const data = await getWeather(city, 'daily')
      expect(data).toHaveProperty('daily')
      expect(data.daily).toHaveLength(8)
    })
  })
})

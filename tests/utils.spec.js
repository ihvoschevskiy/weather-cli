const { join } = require('path')
const { isExist } = require('../helpers/utils')

describe('utils.js', () => {
  describe('isExist', () => {
    it('вернет true, обнаружив package.json', async () => {
      expect(await isExist(join(__dirname, '..', 'package.json'))).toBeTruthy()
    })
    it('вернет false, не обнаружив package.js', async () => {
      expect(await isExist(join(__dirname, '..', 'package.js'))).toBeFalsy()
    })
    it('вернет true, обнаружив директорию services', async () => {
      expect(await isExist(join(__dirname, '..', 'services'))).toBeTruthy()
    })
    it('вернет false, не обнаружив директорию directory', async () => {
      expect(await isExist(join(__dirname, 'directory'))).toBeFalsy()
    })
  })
})

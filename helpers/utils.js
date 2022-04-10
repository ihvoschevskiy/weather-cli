const { promises, constants } = require('fs')

async function isExist(path) {
  try {
    await promises.access(path, constants.F_OK)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false

    console.error(err)
  }
}
module.exports = {
  isExist,
}

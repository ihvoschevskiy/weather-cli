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

function clearConsole() {
  process.platform ===
    process.stdout.write(
      process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
    )
}

module.exports = {
  isExist,
  clearConsole,
}

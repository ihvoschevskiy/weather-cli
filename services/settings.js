const { isExist } = require('../helpers/utils')
const { writeToken } = require('./io')
const { saveTokenPrompt } = require('./prompt')
const { ENV_PATH } = require('./constants')

async function saveToken(token) {
  let t
  typeof token !== 'boolean' && token !== undefined
    ? (t = token)
    : (t = await saveTokenPrompt())
  await writeToken(ENV_PATH, t)
}

module.exports = {
  saveToken,
}

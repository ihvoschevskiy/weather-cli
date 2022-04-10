#!/usr/bin/env node

const args = require('./services/args')
const { isExist } = require('./helpers/utils')
const { ENV_PATH } = require('./services/constants')
const { versionLog, helpLog } = require('./services/log')
const { saveToken } = require('./services/settings')

initCli()

async function initCli() {
  //-------------------------------------------------- Обрабатываем weather -v ---------------
  //------------------------------------------------------------------------------------------
  if (args.v) {
    versionLog()
    return
  }

  //-------------------------------------------------- Обрабатываем weather -h ---------------
  //------------------------------------------------------------------------------------------
  if (args.h) {
    helpLog()
    return
  }

  //-------------------------------------------------- Обрабатываем weather -t [<token>] -----
  //------------------------------------------------------------------------------------------
  if (args.t) {
    await saveToken(args.t)
    return
  }

  //-------------------------------------------------- Записываем токен при первом запуске ---
  //------------------------------------------------------------------------------------------
  const isEnv = await isExist(ENV_PATH)
  if (!isEnv) await saveToken()
  require('dotenv').config({ path: ENV_PATH })
}

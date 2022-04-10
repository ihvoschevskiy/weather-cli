#!/usr/bin/env node

const args = require('./services/args')
const { versionLog, helpLog } = require('./services/log')

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
}

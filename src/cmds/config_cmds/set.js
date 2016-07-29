const themes = require('../../themes')
const tools = require('../../tools')

const chalk = require('chalk')
const dot = require('dotty')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'set <key> <value>'
exports.desc = 'Set a config value'
exports.builder = {}
exports.handler = (argv) => {
  const key = argv.key
  let value = argv.value
  value = tools.checkBoolean(value)
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Configuration', theme, null)
  if (dot.exists(config, key)) {
    if (/\./i.test(key)) {
      if (/^\w*\.date/i.test(key)) {
        throw new Error("API limits hardcoded, can't set this key.")
      } else {
        dot.put(config, key, value)
      }
    } else {
      config[key] = value
    }
  } else {
    throw new Error(`Option ${key} not found.`)
  }
  noon.save(CFILE, config)
  console.log(`Set option ${chalk.white.bold(key)} to ${chalk.white.bold(value)}.`)
}

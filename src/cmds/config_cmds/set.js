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
      dot.put(config, key, value)
    } else {
      config[key] = value
    }
  } else {
    console.error(chalk.red.bold(`Option ${key} not found.`))
    process.exit(1)
  }
  noon.save(CFILE, config)
  console.log(`Set option ${chalk.white.bold(key)} to ${chalk.white.bold(value)}.`)
}

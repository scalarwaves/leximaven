const themes = require('../../themes')

const chalk = require('chalk')
const fs = require('fs')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'init'
exports.desc = 'Initialize config file'
exports.builder = {
  force: {
    alias: 'f',
    desc: 'Force overwriting configuration file',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  const obj = noon.load('default.config.noon')
  obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
  obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
  obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
  obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
  let fileExists = null
  try {
    fs.statSync(CFILE)
    fileExists = true
  } catch (e) {
    if (e.code === 'ENOENT') {
      fileExists = false
    }
  }
  if (fileExists) {
    if (argv.f) {
      console.log(`Overwrote ${chalk.white.bold(CFILE)}.`)
      noon.save(CFILE, obj)
    } else {
      console.log(`Using configuration at ${chalk.white.bold(CFILE)}.`)
    }
  } else if (!fileExists) {
    console.log(`Created ${chalk.white.bold(CFILE)}.`)
    noon.save(CFILE, obj)
  }
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Configuration', theme, null)
  console.log('Your current configuration is:')
  console.log(noon.stringify(config, {
    indent: 2,
    align: true,
    maxalign: 32,
    sort: true,
    colors: true,
  }))
}

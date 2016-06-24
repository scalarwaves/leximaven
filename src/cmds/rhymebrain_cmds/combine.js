const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'combine <query>'
exports.desc = 'Rhymebrain portmanteaus'
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string',
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean',
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean',
  },
  lang: {
    alias: 'l',
    desc: 'ISO 639-1 language code',
    default: 'en',
    type: 'string',
  },
  max: {
    alias: 'm',
    desc: 'Max results to return',
    default: 5,
    type: 'number',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    combine: {
      lang: argv.l,
      max: argv.m,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Rhymebrain', theme, null)
  const query = argv.query
  const task = 'Portmanteaus'
  const prefix = 'http://rhymebrain.com/talk?function=get'
  const uri = `${prefix}${task}&word=${query}&`
  const pcont = []
  pcont.push(`lang=${config.combine.lang}&`)
  pcont.push(`maxResults=${config.combine.max}&`)
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  themes.labelDown('Portmanteaus', theme, null)
  const tofile = { type: 'portmanteau', source: 'http://rhymebrain.com' }
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const list = response.body
      for (let i = 0; i <= list.length - 1; i++) {
        const item = list[i]
        themes.labelRight(item.source, theme, item.combined)
        tofile[[`set${i}`]] = item.source
        tofile[[`portmanteau${i}`]] = item.combined
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

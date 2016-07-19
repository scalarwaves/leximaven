const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'urban <query>'
exports.desc = 'Urban Dictionary definitions'
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
  limit: {
    alias: 'l',
    desc: 'Limit number of results',
    default: 5,
    type: 'number',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    urban: {
      limit: argv.l,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Urban Dictionary', theme, null)
  const ucont = []
  ucont.push(argv.query)
  if (argv._.length > 1) {
    for (let i = 1; i <= argv._.length - 1; i++) {
      ucont.push(argv._[i])
    }
  }
  let words = ''
  if (ucont.length > 1) {
    words = ucont.join('+')
  } else {
    words = ucont[0]
  }
  let url = `http://api.urbandictionary.com/v0/define?term=${words}`
  url = encodeURI(url)
  const tofile = {
    type: 'urban',
    source: 'http://www.urbandictionary.com',
    url,
  }
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const limit = config.urban.limit
      const list = response.body.list.slice(0, limit)
      for (let i = 0; i <= list.length - 1; i++) {
        const result = list[i]
        themes.labelDown('Definition', theme, result.definition)
        tofile[[`definition${i}`]] = result.definition
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

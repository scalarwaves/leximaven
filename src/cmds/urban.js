/* eslint max-len:0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const http = require('good-guy-http')()
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
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Urban Dictionary')
  const ucont = []
  ucont.push(argv.query)
  if (argv._.length > 1) {
    _.each(argv._, (value) => {
      if (value !== 'urban') ucont.push(value)
    })
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
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      const limit = config.urban.limit
      const list = body.list.slice(0, limit)
      for (let i = 0; i <= list.length - 1; i++) {
        const result = list[i]
        themes.label(theme, 'down', 'Definition', result.definition)
        tofile[[`definition${i}`]] = result.definition
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    } else {
      throw new Error(`HTTP ${response.statusCode}: ${error}`)
    }
  })
}

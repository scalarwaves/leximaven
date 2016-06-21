const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'define <word>'
exports.desc = 'Wordnik definitions'
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
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean',
  },
  defdict: {
    alias: 'd',
    desc: "CSV list of dictionaries or 'all'",
    default: 'all',
    type: 'string',
  },
  part: {
    alias: 'p',
    desc: 'CSV list of parts of speech. See http://developer.wordnik.com/docs.html for list of parts.',
    default: '',
    type: 'string',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    define: {
      canon: argv.c,
      limit: argv.l,
      defdict: argv.d,
      part: argv.p,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Wordnik', theme, null)
  const word = argv.word
  const task = 'definitions'
  const prefix = 'http://api.wordnik.com:80/v4/word.json/'
  const apikey = process.env.WORDNIK
  const uri = `${prefix}${word}/${task}?`
  const pcont = []
  pcont.push(`useCanonical=${config.define.canon}&`)
  pcont.push(`sourceDictionaries=${config.define.defdict}&`)
  pcont.push('includeRelated=false&')
  pcont.push('includeTags=false&')
  pcont.push(`limit=${config.define.limit}&`)
  pcont.push(`partOfSpeech=${config.define.part}&`)
  pcont.push(`api_key=${apikey}`)
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  const tofile = { type: 'definition', source: 'http://www.wordnik.com' }
  const cstyle = _.get(chalk, theme.connector.style)
  const ctstyle = _.get(chalk, theme.content.style)
  const uline = _.get(chalk, `${theme.content.style}.underline`)
  const conn = cstyle(theme.connector.str)
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const list = response.body
      for (let i = 0; i <= list.length - 1; i++) {
        const item = list[i]
        const icont = []
        icont.push(ctstyle(`${item.text} `))
        icont.push(uline(item.partOfSpeech))
        icont.push(conn)
        icont.push(ctstyle(item.sourceDictionary))
        themes.labelRight('Definition', theme, icont.join(''))
        tofile[[`text${i}`]] = item.text
        tofile[[`deftype${i}`]] = item.partOfSpeech
        tofile[[`source${i}`]] = item.sourceDictionary
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

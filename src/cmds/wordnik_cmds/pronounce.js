const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'pronounce <word>'
exports.desc = 'Wordnik pronunciations'
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
  dict: {
    alias: 'd',
    desc: 'Dictionary: ahd, century, cmu, macmillan, wiktionary, webster, wordnet',
    default: '',
    type: 'string',
  },
  type: {
    alias: 't',
    desc: 'Type: ahd, arpabet, gcide-diacritical, ipa',
    default: '',
    type: 'string',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    pronounce: {
      canon: argv.c,
      dict: argv.d,
      type: argv.t,
      limit: argv.l,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Wordnik', theme, null)
  const word = argv.word
  const task = 'pronunciations'
  const prefix = 'http://api.wordnik.com:80/v4/word.json/'
  const apikey = process.env.WORDNIK
  const uri = `${prefix}${word}/${task}?`
  const pcont = []
  pcont.push(`useCanonical=${config.pronounce.canon}&`)
  if (config.pronounce.dict !== '') pcont.push(`sourceDictionary=${config.pronounce.dict}&`)
  if (config.pronounce.type !== '') pcont.push(`typeFormat=${config.pronounce.type}&`)
  pcont.push(`limit=${config.pronounce.limit}&`)
  pcont.push(`api_key=${apikey}`)
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  themes.labelDown('Pronunciations', theme, null)
  const tofile = { type: 'pronunciation', source: 'http://www.wordnik.com' }
  tofile.word = word
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const list = response.body
      for (let i = 0; i <= list.length - 1; i++) {
        const item = list[i]
        themes.labelRight(word, theme, `${item.raw} - Type - ${item.rawType}`)
        tofile[[`pronunciation${i}`]] = item.raw
        tofile[[`type${i}`]] = item.rawType
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

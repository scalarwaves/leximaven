const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'relate <word>'
exports.desc = 'Wordnik related words'
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
    desc: 'Limit results = require(type option',
    default: 10,
    type: 'number',
  },
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean',
  },
  type: {
    alias: 't',
    desc: 'Relationship types to limit',
    default: '',
    type: 'string',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    relate: {
      canon: argv.c,
      type: argv.t,
      limit: argv.l,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Wordnik', theme, null)
  const word = argv.word
  const task = 'relatedWords'
  const prefix = 'http://api.wordnik.com:80/v4/word.json/'
  const apikey = process.env.WORDNIK
  const uri = `${prefix}${word}/${task}?`
  const pcont = []
  pcont.push(`useCanonical=${config.relate.canon}&`)
  if (config.relate.type !== '') {
    pcont.push(`relationshipTypes=${config.relate.type}&`)
  }
  pcont.push(`limitPerRelationshipType=${config.relate.limit}&`)
  pcont.push(`api_key=${apikey}`)
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  themes.labelDown('Related words', theme, null)
  const tofile = { type: 'related words', source: 'http://www.wordnik.com' }
  tofile.word = word
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const list = response.body
      for (let i = 0; i <= list.length - 1; i++) {
        const item = list[i]
        themes.labelRight(item.relationshipType, theme, `${item.words.join(', ')}`)
        tofile[[`type${i}`]] = item.relationshipType
        tofile[[`words${i}`]] = item.words.join(', ')
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}
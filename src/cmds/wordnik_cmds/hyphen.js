const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'hyphen <word>'
exports.desc = 'Wordnik hyphenations'
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
    desc: 'Source dictionary ahd, century, wiktionary, webster, wordnet',
    default: 'all',
    type: 'string',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    hyphen: {
      canon: argv.c,
      dict: argv.d,
      limit: argv.l,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Wordnik', theme, null)
  const word = argv.word
  const task = 'hyphenation'
  const prefix = 'http://api.wordnik.com:80/v4/word.json/'
  const apikey = process.env.WORDNIK
  const uri = `${prefix}${word}/${task}?`
  const pcont = []
  pcont.push(`useCanonical=${config.hyphen.canon}&`)
  if (argv.d !== 'all') pcont.push(`sourceDictionary=${config.hyphen.dict}&`)
  pcont.push(`limit=${config.hyphen.limit}&`)
  pcont.push(`api_key=${apikey}`)
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  const tofile = { type: 'hyphenation', source: 'http://www.wordnik.com' }
  const ctstyle = _.get(chalk, theme.content.style)
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const list = response.body
      themes.labelRight('Hyphenation', theme, null)
      for (let i = 0; i <= list.length - 1; i++) {
        const item = list[i]
        if (item.type === 'stress') {
          process.stdout.write(`${chalk.red.bold(item.text)}`)
          tofile[[`stress${i}`]] = item.text
        } else if (item.type === 'secondary stress') {
          process.stdout.write(ctstyle(item.text))
          tofile[[`secondary${i}`]] = item.text
        } else {
          process.stdout.write(ctstyle(item.text))
          tofile[[`syllable${i}`]] = item.text
        }
        if (i < list.length - 1) {
          process.stdout.write(ctstyle('-'))
        }
      }
      console.log('')
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

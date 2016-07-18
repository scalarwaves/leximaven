/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
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
  let proceed = false
  const stamp = new Date(config.wordnik.date.stamp)
  const now = new Date
  const diff = moment(now).diff(stamp, 'minutes')
  const reset = 60 - diff
  if (diff < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1
    noon.save(CFILE, config)
  } else if (diff >= 60) {
    config.wordnik.date.stamp = moment().format()
    config.wordnik.date.remain = config.wordnik.date.limit
    console.log(chalk.white(`Reset API limit to ${config.wordnik.date.limit}/${config.wordnik.date.interval}.`))
    config.wordnik.date.remain = config.wordnik.date.remain - 1
    noon.save(CFILE, config)
  }
  if (config.wordnik.date.remain === 0) {
    proceed = false
  } else if (config.wordnik.date.remain < 0) {
    proceed = false
    config.wordnik.date.remain = 0
    noon.save(CFILE, config)
  } else {
    proceed = true
  }
  if (proceed) {
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
    pcont.push(`useCanonical=${config.wordnik.hyphen.canon}&`)
    if (argv.d !== 'all') pcont.push(`sourceDictionary=${config.wordnik.hyphen.dict}&`)
    pcont.push(`limit=${config.wordnik.hyphen.limit}&`)
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
        console.log(`${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour, will reset in ${reset} minutes.`)
      } else {
        console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
      }
    })
  } else {
    console.error(chalk.red(`Reached this hour's usage limit of ${config.wordnik.date.limit}.`))
    process.exit(1)
  }
}

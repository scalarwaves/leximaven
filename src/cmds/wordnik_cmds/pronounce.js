/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const moment = require('moment')
const http = require('good-guy-http')()
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
  let proceed = false
  let reset = false
  const stamp = new Date(config.wordnik.date.stamp)
  const minutes = moment(new Date).diff(stamp, 'minutes')
  const checkStamp = tools.limitWordnik(config)
  config = checkStamp[0]
  proceed = checkStamp[1]
  reset = checkStamp[2]
  if (proceed) {
    const userConfig = {
      wordnik: {
        pronounce: {
          canon: argv.c,
          dict: argv.d,
          type: argv.t,
          limit: argv.l,
        },
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Wordnik')
    const word = argv.word
    const task = 'pronunciations'
    const prefix = 'http://api.wordnik.com:80/v4/word.json/'
    const apikey = process.env.WORDNIK
    const uri = `${prefix}${word}/${task}?`
    const pcont = []
    pcont.push(`useCanonical=${config.wordnik.pronounce.canon}&`)
    if (config.wordnik.pronounce.dict !== '') pcont.push(`sourceDictionary=${config.wordnik.pronounce.dict}&`)
    if (config.wordnik.pronounce.type !== '') pcont.push(`typeFormat=${config.wordnik.pronounce.type}&`)
    pcont.push(`limit=${config.wordnik.pronounce.limit}&`)
    pcont.push(`api_key=${apikey}`)
    const rest = pcont.join('')
    let url = `${uri}${rest}`
    url = encodeURI(url)
    themes.label(theme, 'down', 'Pronunciations')
    const tofile = {
      type: 'pronunciation',
      source: 'http://www.wordnik.com',
    }
    tofile.word = word
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        if (response.headers['x-gg-state'] === 'cached') {
          config.wordnik.date.remain++
          noon.save(CFILE, config)
          if (config.usage) console.log('Cached response, not decrementing usage.')
        }
        const list = JSON.parse(response.body)
        for (let i = 0; i <= list.length - 1; i++) {
          const item = list[i]
          themes.label(theme, 'right', word, `${item.raw} - Type - ${item.rawType}`)
          tofile[[`pronunciation${i}`]] = item.raw
          tofile[[`type${i}`]] = item.rawType
        }
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (config.usage) reset ? console.log(`Timestamp expired, not decrementing usage.\n${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour.`) : console.log(`${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
      } else throw new Error(`HTTP ${response.statusCode}: ${error}`)
    })
  } else throw new Error(`Reached this hour's usage limit of ${config.wordnik.date.limit}.`)
}

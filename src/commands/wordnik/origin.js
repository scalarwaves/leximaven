/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')
const xml2js = require('xml2js')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'origin <word>'
exports.aliases = ['or', 'etymology']
exports.desc = 'Wordnik etymologies'
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string'
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean'
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean'
  },
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean'
  }
}
exports.handler = (argv) => {
  if (process.env.WORDNIK === undefined) throw new Error('Put an API key in environment variable WORDNIK per documentation.')
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let proceed = false
  let reset = false
  const stamp = new Date(config.wordnik.date.stamp)
  const minutes = moment(new Date()).diff(stamp, 'minutes')
  const checkStamp = tools.limitWordnik(config)
  config = checkStamp[0]
  proceed = checkStamp[1]
  reset = checkStamp[2]
  if (proceed) {
    const userConfig = {
      wordnik: {
        origin: {
          canon: argv.c
        }
      }
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Wordnik')
    const word = argv.word
    const task = 'etymologies'
    const prefix = 'http://api.wordnik.com:80/v4/word.json/'
    const apikey = process.env.WORDNIK
    const uri = `${prefix}${word}/${task}?`
    const pcont = []
    pcont.push(`useCanonical=${config.wordnik.origin.canon}&`)
    pcont.push(`api_key=${apikey}`)
    const rest = pcont.join('')
    let url = `${uri}${rest}`
    url = encodeURI(url)
    const parser = new xml2js.Parser()
    const tofile = {
      type: 'etymology',
      source: 'http://www.wordnik.com'
    }
    const ctstyle = _.get(chalk, theme.content.style)
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        if (response.headers['x-gg-state'] === 'cached') {
          config.wordnik.date.remain++
          noon.save(CFILE, config)
          if (config.usage) console.log('Cached response, not decrementing usage.')
        }
        const resp = JSON.parse(response.body)
        const origin = resp[0]
        parser.parseString(origin, (err, result) => {
          if (!err) {
            const root = result.ety
            const content = root._
            let ets = root.ets
            ets = ets.join(', ')
            themes.label(theme, 'right', 'Etymology', ctstyle(`${content} ${ets}`))
            tofile.etymology = content
            tofile.origin = ets
          } else {
            throw new Error(err)
          }
        })
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (config.usage) reset ? console.log(`Timestamp expired, not decrementing usage.\n${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour.`) : console.log(`${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
      } else throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    })
  } else throw new Error(`Reached this hour's usage limit of ${config.wordnik.date.limit}.`)
}

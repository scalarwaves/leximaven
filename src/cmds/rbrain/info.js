/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'info <word>'
exports.desc = 'Rhymebrain word info'
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
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let proceed = false
  let reset = false
  const stamp = new Date(config.rbrain.date.stamp)
  const minutes = moment(new Date).diff(stamp, 'minutes')
  const checkStamp = tools.limitRbrain(config)
  config = checkStamp[0]
  proceed = checkStamp[1]
  reset = checkStamp[2]
  if (proceed) {
    const userConfig = {
      rbrain: {
        info: {
          lang: argv.l,
        },
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Rhymebrain')
    const word = argv.word
    const task = 'WordInfo'
    const prefix = 'http://rhymebrain.com/talk?function=get'
    const uri = `${prefix}${task}&word=${word}&lang=${config.rbrain.info.lang}`
    const url = encodeURI(uri)
    themes.label(theme, 'down', 'Word Info')
    const tofile = {
      type: 'word info',
      source: 'http://rhymebrain.com',
      url,
    }
    const ctstyle = _.get(chalk, theme.content.style)
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        if (response.headers['x-gg-state'] === 'cached') {
          config.rbrain.date.remain++
          noon.save(CFILE, config)
          if (config.usage) console.log('Cached response, not decrementing usage.')
        }
        const info = JSON.parse(response.body)
        themes.label(theme, 'right', 'Arpabet', info.pron)
        themes.label(theme, 'right', 'IPA', info.ipa)
        themes.label(theme, 'right', 'Syllables', info.syllables)
        tofile.arpabet = info.pron
        tofile.ipa = info.ipa
        tofile.syllables = info.syllables
        const flags = []
        if (info.flags.match(/a/)) {
          flags.push(ctstyle(`[${chalk.red.bold('Offensive')}]`))
          tofile.offensive = true
        }
        if (info.flags.match(/b/)) {
          flags.push(ctstyle('[Found in dictionary]'))
          tofile.dict = true
        }
        if (info.flags.match(/c/)) {
          flags.push(ctstyle('[Trusted pronunciation, not generated]'))
          tofile.trusted = true
        }
        themes.label(theme, 'right', 'Word Flags', flags.join(''))
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        reset ? console.log(`Timestamp expired, reset usage limits.\n${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour.`) : console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
      } else throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    })
  } else throw new Error(`Reached this hour's usage limit of ${config.rbrain.date.limit}.`)
}

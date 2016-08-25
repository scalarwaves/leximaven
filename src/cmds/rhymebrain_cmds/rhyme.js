/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'rhyme <word>'
exports.desc = 'Rhymebrain rhymes'
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
  max: {
    alias: 'm',
    desc: 'Max results to return',
    default: 5,
    type: 'number',
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
        rhyme: {
          lang: argv.l,
          max: argv.m,
        },
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Rhymebrain')
    const word = argv.word
    const task = 'Rhymes'
    const prefix = 'http://rhymebrain.com/talk?function=get'
    const uri = `${prefix}${task}&word=${word}&`
    const pcont = []
    pcont.push(`lang=${config.rbrain.rhyme.lang}&`)
    pcont.push(`maxResults=${config.rbrain.rhyme.max}&`)
    const rest = pcont.join('')
    let url = `${uri}${rest}`
    url = encodeURI(url)
    const tofile = {
      type: 'rhyme',
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
        const list = JSON.parse(response.body)
        const lcont = []
        _.each(list, (item) => lcont.push(item.word))
        lcont.sort((a, b) => {
          if (a < b) return -1
          if (a > b) return 1
          return 0
        })
        const rcont = []
        for (let j = 0; j <= lcont.length - 1; j++) {
          const item = lcont[j]
          rcont.push(ctstyle(item))
          item.score >= 300 ? tofile[[`hiscore${j}`]] = item : tofile[[`rhyme${j}`]] = item
        }
        rcont.sort()
        themes.label(theme, 'right', task, rcont.join(', '))
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (config.usage) reset ? console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour.`) : console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
      } else throw new Error(`HTTP ${response.statusCode}: ${error}`)
    })
  } else throw new Error(`Reached this hour's usage limit of ${config.rbrain.date.limit}.`)
}

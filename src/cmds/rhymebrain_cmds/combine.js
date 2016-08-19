/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'combine <query>'
exports.desc = 'Rhymebrain portmanteaus'
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
        combine: {
          lang: argv.l,
          max: argv.m,
        },
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Rhymebrain')
    const query = argv.query
    const task = 'Portmanteaus'
    const prefix = 'http://rhymebrain.com/talk?function=get'
    const uri = `${prefix}${task}&word=${query}&`
    const pcont = []
    pcont.push(`lang=${config.rbrain.combine.lang}&`)
    pcont.push(`maxResults=${config.rbrain.combine.max}&`)
    const rest = pcont.join('')
    let url = `${uri}${rest}`
    url = encodeURI(url)
    themes.label(theme, 'down', task)
    const tofile = {
      type: 'portmanteau',
      source: 'http://rhymebrain.com',
      url,
    }
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        const list = JSON.parse(response.body)
        for (let i = 0; i <= list.length - 1; i++) {
          const item = list[i]
          themes.label(theme, 'right', item.source, item.combined)
          tofile[[`set${i}`]] = item.source
          tofile[[`portmanteau${i}`]] = item.combined
        }
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (argv.s && config.merge) noon.save(CFILE, config)
        if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
        if (reset) {
          console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour.`)
        } else {
          if (config.usage) console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
        }
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${error}`)
      }
    })
  } else {
    throw new Error(`Reached this hour's usage limit of ${config.rbrain.date.limit}.`)
  }
}

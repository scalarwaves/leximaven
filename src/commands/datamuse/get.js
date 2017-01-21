/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'get <condition>'
exports.desc = 'Datamuse query'
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
  max: {
    alias: 'm',
    desc: 'Maximum number of results, 1 to 1000',
    default: 5,
    type: 'number'
  }
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let proceed = false
  let reset = false
  const stamp = new Date(config.dmuse.date.stamp)
  const hours = moment(new Date()).diff(stamp, 'hours')
  const minutes = moment(new Date()).diff(stamp, 'minutes')
  const checkStamp = tools.limitDmuse(config)
  config = checkStamp[0]
  proceed = checkStamp[1]
  reset = checkStamp[2]
  if (proceed) {
    const userConfig = {
      dmuse: {
        max: argv.m
      }
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Datamuse')
    const ccont = []
    ccont.push(argv.condition)
    if (argv._.length > 1) {
      _.each(argv._, (value) => {
        ccont.push(value)
      })
    }
    const prefix = 'http://api.datamuse.com/words?'
    let conditions = `max=${config.dmuse.max}&`
    _.each(ccont, (value) => {
      conditions = `${conditions}&${value}`
    })
    let url = `${prefix}${conditions}`
    url = encodeURI(url)
    const tags = {
      n: 'noun',
      adj: 'adjective',
      adv: 'adverb',
      syn: 'synonym'
    }
    const tofile = {
      type: 'datamuse',
      source: 'http://datamuse.com/api',
      url
    }
    const ctstyle = _.get(chalk, theme.content.style)
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        if (response.headers['x-gg-state'] === 'cached') {
          config.dmuse.date.remain++
          noon.save(CFILE, config)
          if (config.usage) console.log('Cached response, not decrementing usage.')
        }
        const resp = JSON.parse(response.body)
        for (let i = 0; i <= resp.length - 1; i++) {
          const item = resp[i]
          themes.label(theme, 'right', 'Match', `${item.word} `)
          tofile[[`match${i}`]] = item.word
          if (item.tags !== undefined && item.tags !== []) {
            themes.label(theme, 'right', 'Tag')
            for (let j = 0; j <= item.tags.length - 1; j++) {
              if (j === item.tags.length - 1) {
                process.stdout.write(ctstyle(`${tags[item.tags[j]]}`))
                tofile[[`tags${j}`]] = tags[item.tags[j]]
              } else process.stdout.write(ctstyle(`${tags[item.tags[j]]}, `))
            }
            console.log('')
          }
        }
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (config.usage) reset ? console.log(`Timestamp expired, reset usage limits.\n${config.dmuse.date.remain}/${config.dmuse.date.limit} requests remaining today.`) : console.log(`${config.dmuse.date.remain}/${config.dmuse.date.limit} requests remaining today, will reset in ${23 - hours} hours, ${59 - minutes} minutes.`)
      } else throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    })
  } else throw new Error(`Reached today's usage limit of ${config.dmuse.date.limit}.`)
}

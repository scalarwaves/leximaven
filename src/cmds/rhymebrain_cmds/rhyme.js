/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const needle = require('needle')
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
  const stamp = new Date(config.rbrain.date.stamp)
  const now = moment(new Date).diff(stamp, 'minutes')
  const diff = 60 - now
  let reset = false
  if (diff < 60) {
    config.rbrain.date.remain = config.rbrain.date.remain - 1
    noon.save(CFILE, config)
  } else if (diff >= 60) {
    reset = true
    config.rbrain.date.stamp = moment().format()
    config.rbrain.date.remain = config.rbrain.date.limit
    console.log(chalk.white(`Reset API limit to ${config.rbrain.date.limit}/${config.rbrain.date.interval}.`))
    config.rbrain.date.remain = config.rbrain.date.remain - 1
    noon.save(CFILE, config)
  }
  if (config.rbrain.date.remain === 0) {
    proceed = false
  } else if (config.rbrain.date.remain < 0) {
    proceed = false
    config.rbrain.date.remain = 0
    noon.save(CFILE, config)
  } else {
    proceed = true
  }
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
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.labelDown('Rhymebrain', theme, null)
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
    needle.get(url, (error, response) => {
      if (!error && response.statusCode === 200) {
        const list = response.body
        const lcont = []
        _.each(list, (item) => {
          lcont.push(item.word)
        })
        lcont.sort((a, b) => {
          if (a < b) return -1
          if (a > b) return 1
          return 0
        })
        const rcont = []
        for (let j = 0; j <= lcont.length - 1; j++) {
          const item = lcont[j]
          rcont.push(ctstyle(`${item.word}`))
          if (item.score >= 300) {
            tofile[[`hiscore${j}`]] = item.word
          } else {
            tofile[[`rhyme${j}`]] = item.word
          }
        }
        rcont.sort()
        themes.labelRight('Rhymes', theme, rcont.join(', '))
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (argv.s && config.merge) noon.save(CFILE, config)
        if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
        if (reset) {
          console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour.`)
        } else {
          console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour, will reset in ${diff} minutes.`)
        }
      } else {
        console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
      }
    })
  } else {
    console.error(chalk.red(`Reached this hour's usage limit of ${config.rbrain.date.limit}.`))
    process.exit(1)
  }
}

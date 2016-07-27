/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'phrase <word>'
exports.desc = 'Wordnik bi-gram phrases'
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
  weight: {
    alias: 'w',
    desc: 'Minimum weighted mutual info',
    default: 13,
    type: 'number',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let proceed = false
  const stamp = new Date(config.wordnik.date.stamp)
  const minutes = moment(new Date).diff(stamp, 'minutes')
  let reset = false
  if (minutes < 60) {
    config.wordnik.date.remain = config.wordnik.date.remain - 1
    noon.save(CFILE, config)
  } else if (minutes >= 60) {
    reset = true
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
      wordnik: {
        phrase: {
          canon: argv.c,
          limit: argv.l,
          weight: argv.w,
        },
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.labelDown('Wordnik', theme, null)
    const word = argv.word
    const task = 'phrases'
    const prefix = 'http://api.wordnik.com:80/v4/word.json/'
    const apikey = process.env.WORDNIK
    const uri = `${prefix}${word}/${task}?`
    const pcont = []
    pcont.push(`useCanonical=${argv.c}&`)
    pcont.push(`limit=${argv.l}&`)
    pcont.push(`wlmi=${argv.w}&`)
    pcont.push(`api_key=${apikey}`)
    const rest = pcont.join('')
    let url = `${uri}${rest}`
    url = encodeURI(url)
    themes.labelDown('Bi-gram phrases', theme, null)
    const tofile = {
      type: 'phrase',
      source: 'http://www.wordnik.com',
      url,
    }
    needle.get(url, (error, response) => {
      if (!error && response.statusCode === 200) {
        const list = response.body
        for (let i = 0; i <= list.length - 1; i++) {
          const item = list[i]
          console.log(`${item.gram1} ${item.gram2}`)
          tofile[[`agram${i}`]] = item.gram1
          tofile[[`bgram${i}`]] = item.gram2
        }
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (argv.s && config.merge) noon.save(CFILE, config)
        if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
        if (reset) {
          console.log(`${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour.`)
        } else {
          console.log(`${config.wordnik.date.remain}/${config.wordnik.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
        }
      } else {
        console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
      }
    })
  } else {
    console.error(chalk.red(`Reached this hour's usage limit of ${config.wordnik.date.limit}.`))
    process.exit(1)
  }
}

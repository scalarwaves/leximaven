/* eslint max-len:0 */
const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const needle = require('needle')
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
  const stamp = new Date(config.rbrain.date.stamp)
  const minutes = moment(new Date).diff(stamp, 'minutes')
  let reset = false
  if (minutes < 60) {
    config.rbrain.date.remain = config.rbrain.date.remain - 1
    noon.save(CFILE, config)
  } else if (minutes >= 60) {
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
        info: {
          lang: argv.l,
        },
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.labelDown('Rhymebrain', theme, null)
    const word = argv.word
    const task = 'WordInfo'
    const prefix = 'http://rhymebrain.com/talk?function=get'
    const uri = `${prefix}${task}&word=${word}&lang=${config.rbrain.info.lang}`
    const url = encodeURI(uri)
    themes.labelDown('Word Info', theme, null)
    const tofile = {
      type: 'word info',
      source: 'http://rhymebrain.com',
      url,
    }
    const ctstyle = _.get(chalk, theme.content.style)
    needle.get(url, (error, response) => {
      if (!error && response.statusCode === 200) {
        const info = response.body
        themes.labelRight('Arpabet', theme, info.pron)
        themes.labelRight('IPA', theme, info.ipa)
        themes.labelRight('Syllables', theme, info.syllables)
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
        themes.labelRight('Word Flags', theme, flags.join(''))
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (argv.s && config.merge) noon.save(CFILE, config)
        if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
        if (reset) {
          console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour.`)
        } else {
          console.log(`${config.rbrain.date.remain}/${config.rbrain.date.limit} requests remaining this hour, will reset in ${59 - minutes} minutes.`)
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

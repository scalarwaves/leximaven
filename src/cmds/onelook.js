/* eslint max-len:0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const chalk = require('chalk')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')
const xml2js = require('xml2js')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'onelook <word>'
exports.desc = 'Onelook definitions'
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
  links: {
    alias: 'l',
    desc: 'Include resource links',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let proceed = false
  const stamp = new Date(config.onelook.date.stamp)
  const hours = moment(new Date).diff(stamp, 'hours')
  const minutes = moment(new Date).diff(stamp, 'minutes')
  let reset = false
  if (hours < 24 || hours < 0) {
    config.onelook.date.remain = config.onelook.date.remain - 1
    noon.save(CFILE, config)
  } else if (hours >= 24) {
    reset = true
    config.onelook.date.stamp = moment().format()
    config.onelook.date.remain = config.onelook.date.limit
    console.log(chalk.white(`Reset API limit to ${config.onelook.date.limit}/${config.onelook.date.interval}.`))
    config.onelook.date.remain = config.onelook.date.remain - 1
    noon.save(CFILE, config)
  }
  if (config.onelook.date.remain === 0) {
    proceed = false
  } else if (config.onelook.date.remain < 0) {
    proceed = false
    config.onelook.date.remain = 0
    noon.save(CFILE, config)
  } else {
    proceed = true
  }
  if (proceed) {
    const userConfig = {
      onelook: {
        links: argv.l,
      },
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Onelook')
    let url = `http://onelook.com/?xml=1&w=${argv.word}`
    url = encodeURI(url)
    const tofile = {
      type: 'onelook',
      source: 'http://www.onelook.com',
      url,
    }
    const ctstyle = _.get(chalk, theme.content.style)
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        const body = response.body
        const parser = new xml2js.Parser()
        parser.parseString(body, (err, result) => {
          const resp = result.OLResponse
          const phrase = resp.OLPhrases[0]
          const similar = resp.OLSimilar[0]
          const quickdef = resp.OLQuickDef
          const resources = resp.OLRes
          themes.label(theme, 'down', 'Definition')
          if (Array.isArray(quickdef) && quickdef.length > 1) {
            for (let i = 0; i <= quickdef.length - 1; i++) {
              let item = quickdef[i]
              item = item.replace(/&lt;|&gt;|\n|\/i/g, '')
              item = item.replace(/i"/g, '"')
              console.log(ctstyle(item))
              tofile[[`definition${i}`]] = item
            }
          } else {
            const definition = quickdef[0].replace(/&lt;|&gt;|\n|\/i/g, '')
            console.log(ctstyle(definition))
            tofile.definition = definition
          }
          if (phrase) {
            const phrases = phrase.replace(/\n/g, '')
            themes.label(theme, 'down', 'Phrases', phrases)
            tofile.phrase = phrases
          }
          if (similar) {
            const sim = similar.replace(/\n/g, '')
            themes.label(theme, 'down', 'Similar', sim)
            tofile.sim = sim
          }
          if (config.onelook.links) {
            themes.label(theme, 'down', 'Resources')
            for (let i = 0; i <= resources.length - 1; i++) {
              const item = resources[i]
              const res = tools.arrToStr(item.OLResName).replace(/\n/g, '')
              const link = tools.arrToStr(item.OLResLink).replace(/\n/g, '')
              const home = tools.arrToStr(item.OLResHomeLink).replace(/\n/g, '')
              themes.label(theme, 'right', res, link)
              tofile[[`res${i}`]] = res
              tofile[[`link${i}`]] = link
              tofile[[`home${i}`]] = home
            }
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile)
          if (argv.s && config.merge) noon.save(CFILE, config)
          if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
          if (reset) {
            console.log(`${config.onelook.date.remain}/${config.onelook.date.limit} requests remaining today.`)
          } else {
            if (config.usage) console.log(`${config.onelook.date.remain}/${config.onelook.date.limit} requests remaining today, will reset in ${23 - hours} hours, ${59 - minutes} minutes.`)
          }
        })
      } else {
        throw new Error(`HTTP ${response.statusCode} ${error}`)
      }
    })
  } else {
    throw new Error(`Reached today's usage limit of ${config.onelook.date.limit}.`)
  }
}

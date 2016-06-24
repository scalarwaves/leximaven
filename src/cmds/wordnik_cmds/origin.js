const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')
const xml2js = require('xml2js')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'origin <word>'
exports.desc = 'Wordnik etymologies'
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
  canon: {
    alias: 'c',
    desc: 'Use canonical',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    origin: {
      canon: argv.c,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Wordnik', theme, null)
  const word = argv.word
  const task = 'etymologies'
  const prefix = 'http://api.wordnik.com:80/v4/word.json/'
  const apikey = process.env.WORDNIK
  const uri = `${prefix}${word}/${task}?`
  const pcont = []
  pcont.push(`useCanonical=${config.origin.canon}&`)
  pcont.push(`api_key=${apikey}`)
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  const parser = new xml2js.Parser()
  const tofile = { type: 'etymology', source: 'http://www.wordnik.com' }
  const ctstyle = _.get(chalk, theme.content.style)
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const resp = response.body
      const origin = resp[0]
      parser.parseString(origin, (err, result) => {
        const root = result.ety
        const content = root._
        let ets = root.ets
        ets = ets.join(', ')
        themes.labelRight('Etymology', theme, ctstyle(`${content} ${ets}`))
        tofile.etymology = content
        tofile.source = ets
      })
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

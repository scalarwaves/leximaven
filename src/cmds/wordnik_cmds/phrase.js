const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
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
  const userConfig = {
    phrase: {
      canon: argv.c,
      limit: argv.l,
      weight: argv.w,
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
  const tofile = { type: 'phrase', source: 'http://www.wordnik.com' }
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
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

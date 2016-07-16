const themes = require('../../themes')
const tools = require('../../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'get <condition>'
exports.desc = 'Datamuse query'
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
  max: {
    alias: 'm',
    desc: 'Maximum number of results, 1 to 1000',
    default: 5,
    type: 'number',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    dmuse: {
      max: argv.m,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Datamuse', theme, null)
  const ccont = []
  ccont.push(argv.condition)
  if (argv._.length > 1) {
    for (let i = 1; i <= argv._.length - 1; i++) {
      ccont.push(argv._[i])
    }
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
    syn: 'synonym',
  }
  const tofile = { type: 'datamuse', source: 'http://datamuse.com/api' }
  const ctstyle = _.get(chalk, theme.content.style)
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const resp = response.body
      for (let i = 0; i <= resp.length - 1; i++) {
        const item = resp[i]
        themes.labelRight('Match', theme, `${item.word} `)
        tofile[[`match${i}`]] = item.word
        if (item.tags !== undefined && item.tags !== []) {
          themes.labelRight('Tags', theme, null)
          for (let j = 0; j <= item.tags.length - 1; j++) {
            if (j === item.tags.length - 1) {
              process.stdout.write(ctstyle(`${tags[item.tags[j]]}`))
              tofile[[`tags${j}`]] = tags[item.tags[j]]
            } else {
              process.stdout.write(ctstyle(`${tags[item.tags[j]]}, `))
            }
          }
          console.log('')
        }
      }
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      if (argv.s && config.merge) noon.save(CFILE, config)
      if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}

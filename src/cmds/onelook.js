const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

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
  const userConfig = {
    onelook: {
      links: argv.l,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Onelook', theme, null)
  let url = `http://onelook.com/?xml=1&w=${argv.word}`
  url = encodeURI(url)
  const tofile = { type: 'onelook', source: 'http://www.onelook.com' }
  const ctstyle = _.get(chalk, theme.content.style)
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const obj = response.body
      const resp = obj.OLResponse
      const phrase = resp.OLPhrases
      const similar = resp.OLSimilar
      const quickdef = resp.OLQuickDef
      const resources = resp.OLRes
      themes.labelDown('Definition', theme, null)
      if (Array.isArray(quickdef)) {
        for (let i = 0; i <= quickdef.length - 1; i++) {
          let item = quickdef[i]
          item = item.replace(/&lt;|&gt;|\n|\/i/g, '')
          item = item.replace(/i"/g, '"')
          console.log(ctstyle(item))
          tofile[[`definition${i}`]] = item
        }
      } else {
        const definition = quickdef.replace(/&lt;|&gt;|\n|\/i/g, '')
        console.log(ctstyle(definition))
        tofile.definition = definition
      }
      if (phrase) {
        const phrases = phrase.replace(/\n/g, '')
        themes.labelDown('Phrases', theme, phrases)
        tofile.phrase = phrases
      }
      if (similar) {
        const sim = similar.replace(/\n/g, '')
        themes.labelDown('Similar', theme, sim)
        tofile.sim = sim
      }
      if (config.onelook.links) {
        themes.labelDown('Resources', theme, null)
        for (let i = 0; i <= resources.length - 1; i++) {
          const item = resources[i]
          const res = item.OLResName.replace(/\n/g, '')
          const link = item.OLResLink.replace(/\n/g, '')
          themes.labelRight(res, theme, link)
          tofile[[`res${i}`]] = res
          tofile[[`link${i}`]] = link
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
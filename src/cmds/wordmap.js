const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const child = require('child_process')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'map <word>'
exports.desc = 'Maps of word info'
exports.builder = {
  limit: {
    alias: 'l',
    desc: 'Limits the number of results',
    default: 1,
    type: 'number',
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    wordmap: {
      limit: argv.l,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Wordmap', theme, null)
  const word = argv.word
  const l = argv.l
  const bin = `${process.cwd()}/build/leximaven.js`
  child.spawnSync('node', [bin, 'rbrain', 'combine', `-m${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'rbrain', 'info', `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'rbrain', 'rhyme', `-m${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'define', `-l${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'example', `-l${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'hyphen', `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'origin', `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'phrase', `-l${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'pronounce', `-l${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'wordnik', 'relate', `-l${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'acronym', `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'dmuse', `-m${l}`, `ml=${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'onelook', `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'urban', `-l${l}`, `${word}`], { stdio: 'inherit' })
  child.spawnSync('node', [bin, 'anagram', `-t${l}`, `${word}`], { stdio: 'inherit' })
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) console.err(chalk.red('Set option merge to true!'))
}

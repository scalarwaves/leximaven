/* eslint no-unused-vars: 0 */
const themes = require('../themes')

const _ = require('lodash')

const sample = 'Morbi ornare pulvinar metus, non faucibus arcu ultricies non.'

exports.command = 'list'
exports.aliases = ['ls', 'themes']
exports.desc = 'Get a list of installed themes'
exports.builder = {}
exports.handler = (argv) => {
  const list = themes.getThemes()
  _.each(list, (value) => {
    const name = value
    const currentTheme = themes.loadTheme(name)
    themes.label(currentTheme, 'down', name, sample)
  })
}

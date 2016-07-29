const _ = require('lodash')
const chalk = require('chalk')
const glob = require('glob')
const noon = require('noon')

/**
  * The themes module provides useful repetitive theme tasks
  * @module Themes
  */

/**
  * Loads theme
  * @public
  * @param {string} theme The name of the theme
  * @return {Object} theme The style to use
  */
exports.loadTheme = (theme) => noon.load(`themes/${theme}.noon`)

/**
  * Gets themes for list command
  * @public
  * @return {Array} List of theme names
  */
exports.getThemes = () => {
  const list = []
  const files = glob.sync('themes/*.noon')
  _.each(files, (path) => {
    const name = path.replace(/themes\//, '').replace(/\.noon/, '')
    list.push(name)
  })
  return list
}

/**
  * Prints connector and content below the label
  * @public
  * @param {string} text The label text
  * @param {Object} theme The style to use
  * @param {string} [content] The text the label points at
  */
exports.labelDown = (text, theme, content) => {
  const pstyle = _.get(chalk, theme.prefix.style)
  process.stdout.write(pstyle(theme.prefix.str))
  const tstyle = _.get(chalk, theme.text.style)
  process.stdout.write(tstyle(text))
  const sstyle = _.get(chalk, theme.suffix.style)
  process.stdout.write(sstyle(theme.suffix.str))
  console.log('')
  if (content !== null || undefined) {
    const cnstyle = _.get(chalk, theme.connector.style)
    process.stdout.write(cnstyle(theme.connector.str))
    const ctstyle = _.get(chalk, theme.content.style)
    console.log(ctstyle(content))
  }
}

/**
  * Prints connector and content next to the label
  * @public
  * @param {string} text The label text
  * @param {Object} theme The style to use
  * @param {string} [content] The text the label points at
  */
exports.labelRight = (text, theme, content) => {
  const pstyle = _.get(chalk, theme.prefix.style)
  process.stdout.write(pstyle(theme.prefix.str))
  const tstyle = _.get(chalk, theme.text.style)
  process.stdout.write(tstyle(text))
  const sstyle = _.get(chalk, theme.suffix.style)
  process.stdout.write(sstyle(theme.suffix.str))
  if (content !== null || undefined) {
    const cnstyle = _.get(chalk, theme.connector.style)
    process.stdout.write(cnstyle(theme.connector.str))
    const ctstyle = _.get(chalk, theme.content.style)
    console.log(ctstyle(content))
  }
}

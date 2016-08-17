/* eslint max-len:0 */
const _ = require('lodash')
const chalk = require('chalk')
const fs = require('fs')
const glob = require('glob')
const noon = require('noon')

let TDIR = null
let themeDirExists = null
try {
  fs.statSync('themes')
  themeDirExists = true
} catch (e) {
  if (e.code === 'ENOENT') themeDirExists = false
}
themeDirExists ? TDIR = 'themes/' : TDIR = `${process.env.NODE_PATH}/leximaven/themes/`

/**
  * The themes module provides useful repetitive theme tasks
  * @module Themes
  */

/**
  * Loads theme
  * @public
  * @param {string} theme The name of the theme
  * @return {Object} load The style to use
  */
exports.loadTheme = (theme) => {
  let dirExists = null
  let load = null
  try {
    fs.statSync('themes')
    dirExists = true
  } catch (e) {
    if (e.code === 'ENOENT') dirExists = false
  }
  dirExists ? load = noon.load(`themes/${theme}.noon`) : load = noon.load(`${TDIR}${theme}.noon`)
  return load
}

/**
  * Gets themes for list command
  * @public
  * @return {Array} List of theme names
  */
exports.getThemes = () => {
  const list = []
  let dirExists = null
  let files = []
  try {
    fs.statSync('themes')
    dirExists = true
  } catch (e) {
    if (e.code === 'ENOENT') dirExists = false
  }
  dirExists ? files = glob.sync('themes/*.noon') : files = glob.sync(`${TDIR}*.noon`)
  _.each(files, (path) => {
    const name = path.replace(/[a-z0-9\/_\.]*themes\//, '').replace(/\.noon/, '')
    list.push(name)
  })
  return list
}

/**
  * Prints label, connector, and content
  * @public
  * @param {Object} theme The style to use
  * @param {string} direction 'down' or 'right'
  * @param {string} text The label text
  * @param {string} [content] The text the label points at
  * @return {string} The stylized string to log
  */
exports.label = (theme, direction, text, content) => {
  const pstyle = _.get(chalk, theme.prefix.style)
  const tstyle = _.get(chalk, theme.text.style)
  const sstyle = _.get(chalk, theme.suffix.style)
  const cnstyle = _.get(chalk, theme.connector.style)
  const ctstyle = _.get(chalk, theme.content.style)
  let label = `${pstyle(theme.prefix.str)}${tstyle(text)}${sstyle(theme.suffix.str)}`
  if (direction === 'right') {
    content !== null && content !== undefined ? label = `${label}${cnstyle(theme.connector.str)}${ctstyle(content)}` : label = `${label}`
  } else if (direction === 'down') {
    content !== null && content !== undefined ? label = `${label}\n${cnstyle(theme.connector.str)}${ctstyle(content)}` : label = `${label}`
  } else { throw new Error("Unsupported label direction, use 'down' or 'right'.") }
  console.log(label)
  return label
}

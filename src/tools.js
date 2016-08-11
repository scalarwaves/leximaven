/* eslint max-len: 0 */
const chalk = require('chalk')
const fs = require('fs')
const noon = require('noon')
const xml2js = require('xml2js')

/**
  * The tools module provides useful repetitive tasks
  * @module Utils
  */

/**
  * Checks if a file exists
  * @private
  * @param {string} path The filename to check.
  * @return {boolean} fileExists
  */
function checkOutfile(path) {
  let fileExists = null
  try {
    fs.statSync(path)
    fileExists = true
  } catch (e) {
    if (e.code === 'ENOENT') {
      fileExists = false
    }
  }
  return fileExists
}

/**
  * Converts string to boolean
  * @public
  * @param {string} value
  * @return {boolean} v
  */
exports.checkBoolean = (value) => {
  let v = value
  if (v === 'true') v = true
  if (v === 'false') v = false
  return v
}

/**
  * Checks if config exists. If not, prints init message and exits with error code.
  * @public
  * @param {string} file Configuration filepath
  */
exports.checkConfig = (file) => {
  try {
    fs.statSync(file)
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error(`No config found at ${file}, run: 'leximaven config init'`)
    }
  }
  return true
}

/**
  * Checks if object is a single string in an array
  * @public
  * @param {Object} obj Any object
  * @return {Object} Original object or extracted string
  */
exports.arrToStr = (obj) => {
  let fixed = null
  if (Array.isArray(obj) && obj.length === 1 && typeof obj[0] === 'string') {
    fixed = obj[0]
  } else {
    fixed = obj
  }
  return fixed
}

/**
  * Handles data export to file. Supports cson, json, noon, plist, xml, yaml.
  * @public
  * @param {string} path The desired filepath and extension
  * @param {boolean} force Whether to force overwrite
  * @param {Object} tofile A numbered object of data points
  */
exports.outFile = (path, force, tofile) => {
  const match = path.match(/\.([a-z]*)$/i)
  const ext = match[1]
  const builder = new xml2js.Builder()
  if (ext === 'xml') {
    if (checkOutfile(path)) {
      if (force) {
        const xml = builder.buildObject(tofile)
        const fd = fs.openSync(path, 'w+')
        fs.writeSync(fd, xml)
        fs.closeSync(fd)
        console.log(chalk.white(`Overwrote ${path} with data.`))
      } else {
        console.log(chalk.white(`${path} exists, use -f to force overwrite.`))
      }
    } else {
      const xml = builder.buildObject(tofile)
      const fd = fs.openSync(path, 'w+')
      fs.writeSync(fd, xml)
      fs.closeSync(fd)
      console.log(chalk.white(`Wrote data to ${path}.`))
    }
  } else if (ext === 'cson' || ext === 'json' || ext === 'noon' || ext === 'plist' || ext === 'yml' || ext === 'yaml') {
    if (checkOutfile(path)) {
      if (force) {
        noon.save(path, tofile)
        console.log(chalk.white(`Overwrote ${path} with data.`))
      } else {
        console.log(chalk.white(`${path} exists, use -f to force overwrite.`))
      }
    } else {
      noon.save(path, tofile)
      console.log(chalk.white(`Wrote data to ${path}.`))
    }
  } else if (ext !== 'xml' || ext !== 'cson' || ext !== 'json' || ext !== 'noon' || ext !== 'plist' || ext !== 'yml' || ext !== 'yaml') throw new Error(`Format ${ext} not supported.`)
}

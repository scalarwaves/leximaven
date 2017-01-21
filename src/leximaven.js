#!/usr/bin/env node
/* eslint max-len: 0, no-unused-expressions: 0 */
const chalk = require('chalk')
const pkg = require('../package.json')
const yargonaut = require('yargonaut')
  .style('bold.underline', 'Commands:')
  .style('bold.underline', 'Options:')
  .style('bold.cyan', 'boolean')
  .style('bold.yellow', 'string')
  .style('bold.magenta', 'number')
  .style('bold.blue', 'default:')
  .style('bold.green', 'aliases:')
const yargs = require('yargs')
yargs
  .commandDir('commands')
  .usage(`${chalk.yellow(`${yargonaut.asFont('leximaven', 'Small Slant')}`)}\n${chalk.bold.underline('Usage:')}\n$0 <command> [options]`)
  .help('h')
  .alias('h', 'help')
  .option('v', {
    alias: 'verbose',
    type: 'boolean',
    desc: 'Verbose output'
  })
  .version('V', 'Show current version', pkg.version)
  .alias('V', 'version')
  .global('v')
  .demand(1)
  .argv

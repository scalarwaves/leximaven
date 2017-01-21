/* eslint no-unused-vars:0, no-unused-expressions:0 */
const yargs = require('yargs')
exports.command = 'completion'
exports.aliases = ['comp']
exports.desc = 'Print shell completion script'
exports.builder = {}
exports.handler = (argv) => {
  yargs.showCompletionScript().argv
}

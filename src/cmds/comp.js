const yargs = require('yargs')
exports.command = 'comp'
exports.desc = 'Print shell completion script'
exports.builder = {}
exports.handler = (argv) => {
  yargs.showCompletionScript().argv
}
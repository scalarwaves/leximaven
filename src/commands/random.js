const rand = require('random-word')

exports.command = 'random'
exports.aliases = ['rand', 'rw']
exports.desc = 'Get a random word'
exports.builder = {}
exports.handler = (argv) => {
  console.log(rand())
}

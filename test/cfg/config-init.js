/* eslint max-len: 0 */
const Code = require('code')
const Lab = require('lab')
const child = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const CFILE = `${process.env.HOME}/.leximaven.noon`
const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const expect = Code.expect
const outfile = path.resolve('test/output/config-init.out')

describe('command: config init', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/output/.leximaven.noon')
    fs.removeSync(CFILE)
    done()
  })
  after((done) => {
    fs.copySync('test/output/.leximaven.noon', CFILE)
    fs.removeSync('test/output')
    done()
  })
  it('shows output using config init', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js config init > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const config = fs.readJsonSync(CFILE)
      const obj = { verbose: false }
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/No config found at [a-z\/\.]*, creating it now\.\sYour current configuration is:\s*{\s*"verbose": (false|true)\s}/mig)
      expect(JSON.stringify(config, null, ' ')).to.equals(JSON.stringify(obj, null, ' '))
      done(err)
    })
  })
})

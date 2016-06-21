/* eslint max-len: 0 */
const Code = require('code')
const Lab = require('lab')
const child = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const expect = Code.expect
const outfile = path.resolve('test/output/onelook.out')

describe('command: onelook', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using onelook', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js onelook -o ${process.cwd()}/test/output/onelook.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'onelook',
        definition: 'noun: the state of being everywhere at once (or seeming to be everywhere at once)',
        phrase: 'ubiquity records',
        sim: 'omnipresence,ubiquitousness',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/onelook.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Onelook\]\s\[Definition\]\s[a-z:\s\(\)]*\s\[Phrases\]\s\w* \w*\s\[Similar\]\s\w*,\w*\sWrote data to [\w\/]*\.\w*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})

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
const outfile = path.resolve('test/output/hyphen.out')

describe('command: wordnik hyphen', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using wordnik hyphen', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js wordnik hyphen -o ${process.cwd()}/test/output/hyphen.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'hyphenation',
        syllable0: 'u',
        stress1: 'biq',
        syllable2: 'ui',
        syllable3: 'ty',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/hyphen.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[\w*\]\s[\w-]*\sWrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})

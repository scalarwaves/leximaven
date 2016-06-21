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
const outfile = path.resolve('test/output/combine.out')

describe('command: rbrain combine', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using rbrain combine', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js rbrain combine -o ${process.cwd()}/test/output/combine.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'portmanteau',
        source0: 'value,ubiquity',
        portmanteau0: 'valubiquity',
        source1: 'tissue,ubiquity',
        portmanteau1: 'tissubiquity',
        source2: 'continue,ubiquity',
        portmanteau2: 'continubiquity',
        source3: 'argue,ubiquity',
        portmanteau3: 'argubiquity',
        source4: 'w,ubiquity',
        portmanteau4: 'wubiquity',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/combine.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[\w*\]\s[\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})

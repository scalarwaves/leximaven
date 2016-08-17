'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len: 0 */
var themes = require('../src/themes');
var tools = require('../src/tools');

var _ = require('lodash');
var chalk = require('chalk');
var child = require('child_process');
var expect = require('chai').expect;
var fs = require('fs-extra');
var noon = require('noon');
var sinon = require('sinon');
var strip = require('strip-ansi');
var version = require('../package.json').version;
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';
var TFILE = process.cwd() + '/test/test.config.noon';
var spy = sinon.spy(console, 'log');

describe('tools', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    fs.copySync(CFILE, 'test/output/saved.config.noon');
    done();
  });
  beforeEach(function (done) {
    spy.reset();
    done();
  });
  after(function (done) {
    fs.copySync('test/output/saved.config.noon', CFILE);
    fs.removeSync('test/output');
    done();
  });
  describe('check boolean', function () {
    it('coerces true', function (done) {
      expect(tools.checkBoolean('true')).to.be.true;
      done();
    });
    it('coerces false', function (done) {
      expect(tools.checkBoolean('false')).to.be.false;
      done();
    });
  });
  describe('check outfile', function () {
    it('json exists', function (done) {
      var obj = { foo: 'bar' };
      var obj2 = { bar: 'foo' };
      tools.outFile('test/output/test.json', false, obj);
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj2))).to.match(/[a-z\/,\-\. ]*/mig);
      var actual = fs.readJsonSync('test/output/test.json');
      expect((0, _stringify2.default)(actual)).to.equals((0, _stringify2.default)(obj));
      fs.removeSync('test/output/test.json');
      done();
    });
    it("json doesn't exist", function (done) {
      var obj = { foo: 'bar' };
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj))).to.match(/[a-z\/,\-\. ]*/mig);
      fs.removeSync('test/output/test.json');
      done();
    });
    it('xml exists', function (done) {
      var obj = { foo: 'bar' };
      tools.outFile('test/output/test.xml', false, obj);
      tools.outFile('test/output/test.xml', false, obj);
      done();
    });
    it('enforces supported formats', function (done) {
      var obj = { foo: 'bar' };
      try {
        tools.outFile('test/output/test.foo', false, obj);
      } catch (error) {
        console.log(error);
        done();
      }
    });
  });
  describe('check config', function () {
    it('config exists', function (done) {
      fs.copySync('test/output/saved.config.noon', CFILE);
      expect(tools.checkConfig(CFILE)).to.be.true;
      done();
    });
    it("config doesn't exist", function (done) {
      fs.removeSync(CFILE);
      try {
        tools.checkConfig(CFILE);
      } catch (error) {
        console.log(error);
        done();
      }
    });
  });
  describe('array to string', function () {
    var array = ['enclosed string'];
    var string = 'normal string';
    it('extracts string from array', function (done) {
      expect(tools.arrToStr(array)).to.equals('enclosed string');
      done();
    });
    it('returns string when not enclosed', function (done) {
      expect(tools.arrToStr(string)).to.equals('normal string');
      done();
    });
  });
  describe('rate-limiting', function () {
    it('resets datamuse limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '').replace(/2016/, '2015');
      config.dmuse.date.remain = 99998;
      var checkStamp = tools.limitDmuse(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.dmuse.date.remain).to.equals(99999);
      expect(c.dmuse.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(true);
      done();
    });
    it('decrements datamuse limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.dmuse.date.remain = 100000;
      var checkStamp = tools.limitDmuse(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.dmuse.date.remain).to.equals(99999);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches datamuse limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.dmuse.date.remain = 0;
      var checkStamp = tools.limitDmuse(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.dmuse.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
    it('resets onelook limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '').replace(/2016/, '2015');
      config.onelook.date.remain = 9998;
      var checkStamp = tools.limitOnelook(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.onelook.date.remain).to.equals(9999);
      expect(c.onelook.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(true);
      done();
    });
    it('decrements onelook limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.onelook.date.remain = 10000;
      var checkStamp = tools.limitOnelook(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.onelook.date.remain).to.equals(9999);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches onelook limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.onelook.date.remain = 0;
      var checkStamp = tools.limitOnelook(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.onelook.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
    it('resets rhymebrain limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '').replace(/2016/, '2015');
      config.rbrain.date.remain = 348;
      var checkStamp = tools.limitRbrain(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.rbrain.date.remain).to.equals(349);
      expect(c.rbrain.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(true);
      done();
    });
    it('decrements rhymebrain limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.rbrain.date.remain = 350;
      var checkStamp = tools.limitRbrain(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.rbrain.date.remain).to.equals(349);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches rhymebrain limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.rbrain.date.remain = 0;
      var checkStamp = tools.limitRbrain(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.rbrain.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
    it('resets wordnik limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '').replace(/2016/, '2015');
      config.wordnik.date.remain = 14998;
      var checkStamp = tools.limitWordnik(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.wordnik.date.remain).to.equals(14999);
      expect(c.wordnik.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(true);
      done();
    });
    it('decrements wordnik limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.wordnik.date.remain = 15000;
      var checkStamp = tools.limitWordnik(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.wordnik.date.remain).to.equals(14999);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches wordnik limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
      config.wordnik.date.remain = 0;
      var checkStamp = tools.limitWordnik(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.wordnik.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
  });
});

describe('themes', function () {
  beforeEach(function () {
    spy.reset();
  });
  after(function () {
    return spy.restore();
  });
  // describe('fallback', () => {
  //   it('falls back to pkg dir', (done) => {
  //     fs.copySync('./themes', './themes1')
  //     fs.removeSync('./themes')
  //     const list = themes.getThemes().sort()
  //     const theme = themes.loadTheme('square')
  //     const lobj = ['colonel', 'markup', 'square']
  //     const tobj = {
  //       prefix: {
  //         str: '[',
  //         style: 'bold.green',
  //       },
  //       text: {
  //         style: 'bold.white',
  //       },
  //       content: {
  //         style: 'white',
  //       },
  //       suffix: {
  //         str: ']',
  //         style: 'bold.green',
  //       },
  //       connector: {
  //         str: '→',
  //         style: 'bold.cyan',
  //       },
  //     }
  //     expect(JSON.stringify(theme)).to.equals(JSON.stringify(tobj))
  //     expect(JSON.stringify(list)).to.equals(JSON.stringify(lobj))
  //     fs.copySync('./themes1', './themes')
  //     fs.removeSync('./themes1')
  //     done()
  //   })
  // })
  describe('get themes', function () {
    it('returns an array of theme names', function (done) {
      var list = themes.getThemes().sort();
      var obj = ['colonel', 'markup', 'square'];
      expect((0, _stringify2.default)(list)).to.equals((0, _stringify2.default)(obj));
      done();
    });
  });
  describe('load theme', function () {
    it('returns a theme', function (done) {
      var theme = themes.loadTheme('square');
      var obj = {
        prefix: {
          str: '[',
          style: 'bold.green'
        },
        text: {
          style: 'bold.white'
        },
        content: {
          style: 'white'
        },
        suffix: {
          str: ']',
          style: 'bold.green'
        },
        connector: {
          str: '→',
          style: 'bold.cyan'
        }
      };
      expect((0, _stringify2.default)(theme)).to.equals((0, _stringify2.default)(obj));
      done();
    });
  });
  describe('labels', function () {
    var theme = themes.loadTheme('square');
    var text = 'label';
    it('labels right', function (done) {
      var content = 'right';
      expect(spy.calledWith(themes.label(theme, 'right', text, content))).to.be.true;
      done();
    });
    it('labels down', function (done) {
      var content = 'down';
      expect(spy.calledWith(themes.label(theme, 'down', text, content))).to.be.true;
      done();
    });
    it('labels without content', function (done) {
      expect(spy.calledWith(themes.label(theme, 'right', text))).to.be.true;
      done();
    });
    it('enforces right or down', function (done) {
      try {
        themes.label(theme, 'err', 'label');
      } catch (error) {
        console.log(error);
        done();
      }
    });
  });
});

describe('config commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    fs.copySync(CFILE, 'test/output/saved.config.noon');
    done();
  });
  after(function (done) {
    fs.copySync('test/output/saved.config.noon', CFILE);
    fs.removeSync('test/output');
    done();
  });
  describe('get', function () {
    it('shows value of option onelook.links', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config get onelook.links > test/output/config-get.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-get.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option onelook.links is (true|false)\./mig);
        done(err);
      });
    });
  });
  describe('init', function () {
    before(function (done) {
      fs.removeSync(CFILE);
      done();
    });
    it('creates the config file', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config init > test/output/config-init.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-init.out', 'utf8');
        var config = noon.load(CFILE);
        var obj = {
          anagram: {
            case: 1,
            lang: 'english',
            limit: 10,
            linenum: false,
            list: false,
            maxletter: 50,
            maxword: 10,
            minletter: 1,
            repeat: false
          },
          dmuse: {
            date: {
              interval: 'day',
              limit: 100000,
              remain: 100000,
              stamp: ''
            },
            max: 5
          },
          merge: true,
          onelook: {
            date: {
              interval: 'day',
              limit: 10000,
              remain: 10000,
              stamp: ''
            },
            links: false
          },
          rbrain: {
            combine: {
              lang: 'en',
              max: 5
            },
            date: {
              interval: 'hour',
              limit: 350,
              remain: 350,
              stamp: ''
            },
            info: {
              lang: 'en'
            },
            rhyme: {
              lang: 'en',
              max: 50
            }
          },
          theme: 'square',
          urban: {
            limit: 5
          },
          usage: true,
          verbose: false,
          wordmap: {
            limit: 1
          },
          wordnik: {
            date: {
              interval: 'hour',
              limit: 15000,
              remain: 15000,
              stamp: ''
            },
            define: {
              canon: false,
              defdict: 'all',
              limit: 5,
              part: ''
            },
            example: {
              canon: false,
              limit: 5,
              skip: 0
            },
            hyphen: {
              canon: false,
              dict: 'all',
              limit: 5
            },
            origin: {
              canon: false
            },
            phrase: {
              canon: false,
              limit: 5,
              weight: 13
            },
            pronounce: {
              canon: false,
              dict: '',
              limit: 5,
              type: ''
            },
            relate: {
              canon: false,
              limit: 10,
              type: ''
            }
          }
        };
        config.dmuse.date.stamp = '';
        config.dmuse.date.remain = 100000;
        config.onelook.date.stamp = '';
        config.onelook.date.remain = 10000;
        config.rbrain.date.stamp = '';
        config.rbrain.date.remain = 350;
        config.wordnik.date.stamp = '';
        config.wordnik.date.remain = 15000;
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(config, null, ' ')).to.equals((0, _stringify2.default)(obj, null, ' '));
        done(err);
      });
    });
    it('force overwrites existing and prints config', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config init -f -v > test/output/config-init.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-init.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \/\.\[\]:\-\s|]*/mig);
        done(err);
      });
    });
  });
  describe('set', function () {
    it('sets value of option onelook.links to false', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js config set onelook.links false > test/output/config-set.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-set.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option onelook.links to (true|false)\./mig);
        done(err);
      });
    });
  });
});

describe('dmuse commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('get', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js dmuse get -s -o ' + process.cwd() + '/test/output/dmuse.json ml=ubiquity > test/output/dmuse-get.out', function (err) {
        var stdout = fs.readFileSync('test/output/dmuse-get.out', 'utf8');
        var obj = {
          type: 'datamuse',
          source: 'http://datamuse.com/api',
          url: 'http://api.datamuse.com/words?max=5&&ml=ubiquity&dmuse&get',
          match0: 'ubiquitousness',
          tags1: 'noun',
          match1: 'omnipresence',
          match2: 'pervasiveness',
          tags0: 'noun',
          match3: 'prevalence'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/dmuse.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→\s,]*\/dmuse.json./mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('info', function () {
    it('shows metrics', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js dmuse info > test/output/dmuse-info.out', function (err) {
        var stdout = fs.readFileSync('test/output/dmuse-info.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\/ ,\.]*\s[\w ]*\(v\d\): \d*.\d*\s[\w \(\/\):\.,%]*\s[\w \(\/\):\.,%]*/);
        done(err);
      });
    });
  });
});

describe('rbrain commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('combine', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js rbrain combine -s -m1 -o ' + process.cwd() + '/test/output/combine.json value > test/output/combine.out', function (err) {
        var stdout = fs.readFileSync('test/output/combine.out', 'utf8');
        var obj = {
          type: 'portmanteau',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getPortmanteaus&word=value&lang=en&maxResults=1&',
          set0: 'value,unique',
          portmanteau0: 'valunique'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/combine.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9,→ -\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('info', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js rbrain info -s -o ' + process.cwd() + '/test/output/info.json fuck > test/output/info.out', function (err) {
        var stdout = fs.readFileSync('test/output/info.out', 'utf8');
        var obj = {
          type: 'word info',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getWordInfo&word=fuck&lang=en',
          arpabet: 'F AH1 K',
          ipa: 'ˈfʌk',
          syllables: '1',
          offensive: true,
          dict: true,
          trusted: true
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/info.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9 -→ˈʌ\/\.,]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('rhyme', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js rbrain rhyme -s -o ' + process.cwd() + '/test/output/rhyme.json ubiquity > test/output/rhyme.out', function (err) {
        var stdout = fs.readFileSync('test/output/rhyme.out', 'utf8');
        var obj = {
          type: 'rhyme',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getRhymes&word=ubiquity&lang=en&maxResults=5&',
          rhyme0: 'stability',
          rhyme1: 'typically',
          rhyme2: 'specifically',
          rhyme3: 'respectively',
          rhyme4: 'effectively'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/rhyme.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Rhymes\]→[a-z*, ]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig);
        expect((0, _stringify2.default)(json)).to.match(/[\{\}a-z0-9\s:\/\.",]*/mig);
        done(err);
      });
    });
  });
});

describe('wordnik commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('define', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik define -s -l1 -o ' + process.cwd() + '/test/output/define.json ubiquity > test/output/define.out', function (err) {
        var stdout = fs.readFileSync('test/output/define.out', 'utf8');
        var obj = {
          type: 'definition',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/definitions?useCanonical=false&sourceDictionaries=all&includeRelated=false&includeTags=false&limit=1&partOfSpeech=&api_key=' + process.env.WORDNIK,
          text0: 'Existence or apparent existence everywhere at the same time; omnipresence: "the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
          deftype0: 'noun',
          source0: 'ahd-legacy'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/define.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→ ;:",\-\(\)\.\/”]*Wrote data to [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('example', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik example -s -l1 -o ' + process.cwd() + '/test/output/example.json ubiquity > test/output/example.out', function (err) {
        var stdout = fs.readFileSync('test/output/example.out', 'utf8');
        var obj = {
          type: 'example',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/examples?useCanonical=false&includeDuplicates=false&limit=1&skip=0&api_key=' + process.env.WORDNIK,
          example0: 'Both are characterized by their ubiquity and their antiquity: No known human culture lacks them, and musical instruments are among the oldest human artifacts, dating to the Late Pleistocene about 50,000 years ago.'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/example.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\] →:,\.]*\sWrote data to [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('hyphen', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik hyphen -s -o ' + process.cwd() + '/test/output/hyphen.json ubiquity > test/output/hyphen.out', function (err) {
        var stdout = fs.readFileSync('test/output/hyphen.out', 'utf8');
        var obj = {
          type: 'hyphenation',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/hyphenation?useCanonical=false&limit=5&api_key=' + process.env.WORDNIK,
          syllable0: 'u',
          stress1: 'biq',
          syllable2: 'ui',
          syllable3: 'ty'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/hyphen.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Hyphenation\]→[a-z\-]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('origin', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik origin -s -o ' + process.cwd() + '/test/output/origin.json ubiquity > test/output/origin.out', function (err) {
        var stdout = fs.readFileSync('test/output/origin.out', 'utf8');
        var obj = {
          type: 'etymology',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/etymologies?useCanonical=false&api_key=' + process.env.WORDNIK,
          etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
          origin: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/origin.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\]→\.,\(\):√©]*Wrote data to [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('phrase', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik phrase -s -l1 -o ' + process.cwd() + '/test/output/phrase.json ubiquitous > test/output/phrase.out', function (err) {
        var stdout = fs.readFileSync('test/output/phrase.out', 'utf8');
        var obj = {
          type: 'phrase',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquitous/phrases?useCanonical=false&limit=1&wlmi=13&api_key=' + process.env.WORDNIK,
          agram0: 'ubiquitous',
          bgram0: 'amoeba'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/phrase.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]\-\s]*Wrote data to [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('pronounce', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik pronounce -s -o ' + process.cwd() + '/test/output/pronounce.json ubiquity > test/output/pronounce.out', function (err) {
        var stdout = fs.readFileSync('test/output/pronounce.out', 'utf8');
        var obj = {
          type: 'pronunciation',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/pronunciations?useCanonical=false&limit=5&api_key=' + process.env.WORDNIK,
          word: 'ubiquity',
          pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
          type0: 'ahd-legacy',
          pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
          type1: 'arpabet'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/pronounce.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]\(\) \-→ĭēˈ\so͞]*\sWrote data to [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('relate', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js wordnik relate -s -l1 -o ' + process.cwd() + '/test/output/relate.json ubiquity > test/output/relate.out', function (err) {
        var stdout = fs.readFileSync('test/output/relate.out', 'utf8');
        var obj = {
          type: 'related words',
          source: 'http://www.wordnik.com',
          url: 'http://api.wordnik.com:80/v4/word.json/ubiquity/relatedWords?useCanonical=false&limitPerRelationshipType=1&api_key=' + process.env.WORDNIK,
          word: 'ubiquity',
          type0: 'antonym',
          words0: 'uniquity',
          type1: 'hypernym',
          words1: 'presence',
          type2: 'cross-reference',
          words2: 'ubiquity of the king',
          type3: 'synonym',
          words3: 'omnipresence',
          type4: 'rhyme',
          words4: 'iniquity',
          type5: 'same-context',
          words5: 'omnipresence'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/relate.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\],\-→]*\sWrote data to [a-z\/\.]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
});

describe('root commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    obj.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
      noon.save(CFILE, obj);
    } else {
      noon.save(CFILE, obj);
    }
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('acronym', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js acronym -o ' + process.cwd() + '/test/output/acronym.json DDC > test/output/acronym.out', function (err) {
        var stdout = fs.readFileSync('test/output/acronym.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/acronym.json');
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Wrote data to [a-z\/]*.json./mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
    it('forces writing json', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js acronym -f -o ' + process.cwd() + '/test/output/acronym.json DDC > test/output/acronym.out', function (err) {
        var stdout = fs.readFileSync('test/output/acronym.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/acronym.json');
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Overwrote [a-z\/\.]* with data./mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
    it('writes xml', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js acronym -o ' + process.cwd() + '/test/output/acronym.xml DDC', function (err) {
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        var xml = fs.readFileSync(process.cwd() + '/test/output/acronym.xml', 'utf8');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
          var fixed = result.root;
          fixed.type = fixed.type[0];
          fixed.source = fixed.source[0];
          fixed.url = fixed.url[0];
          fixed.expansion0 = fixed.expansion0[0];
          fixed.expansion1 = fixed.expansion1[0];
          fixed.expansion2 = fixed.expansion2[0];
          fixed.expansion3 = fixed.expansion3[0];
          fixed.expansion4 = fixed.expansion4[0];
          fixed.url0 = fixed.url0[0];
          fixed.comment0 = fixed.comment0[0];
          fixed.comment4 = fixed.comment4[0];
          fixed.DDC0 = fixed.DDC0[0];
          fixed.DDC1 = fixed.DDC1[0];
          fixed.DDC2 = fixed.DDC2[0];
          fixed.DDC3 = fixed.DDC3[0];
          fixed.DDC4 = fixed.DDC4[0];
          expect((0, _stringify2.default)(fixed)).to.equals((0, _stringify2.default)(obj));
          done(err);
        });
      });
    });
    it('forces writing xml', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js acronym -f -o ' + process.cwd() + '/test/output/acronym.xml DDC', function (err) {
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        var xml = fs.readFileSync(process.cwd() + '/test/output/acronym.xml', 'utf8');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
          var fixed = result.root;
          fixed.type = fixed.type[0];
          fixed.source = fixed.source[0];
          fixed.url = fixed.url[0];
          fixed.expansion0 = fixed.expansion0[0];
          fixed.expansion1 = fixed.expansion1[0];
          fixed.expansion2 = fixed.expansion2[0];
          fixed.expansion3 = fixed.expansion3[0];
          fixed.expansion4 = fixed.expansion4[0];
          fixed.url0 = fixed.url0[0];
          fixed.comment0 = fixed.comment0[0];
          fixed.comment4 = fixed.comment4[0];
          fixed.DDC0 = fixed.DDC0[0];
          fixed.DDC1 = fixed.DDC1[0];
          fixed.DDC2 = fixed.DDC2[0];
          fixed.DDC3 = fixed.DDC3[0];
          fixed.DDC4 = fixed.DDC4[0];
          expect((0, _stringify2.default)(fixed)).to.equals((0, _stringify2.default)(obj));
          done(err);
        });
      });
    });
  });
  describe('anagram', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js anagram -s -o ' + process.cwd() + '/test/output/anagram.json ubiquity > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/anagram.json');
        var obj = {
          type: 'anagram',
          source: 'http://wordsmith.org/',
          url: 'http://wordsmith.org/anagram/anagram.cgi?anagram=ubiquity&language=english&t=10&d=10&include=&exclude=&n=1&m=50&a=n&l=n&q=n&k=1&src=adv',
          found: '2',
          show: 'all',
          alist: ['Ubiquity', 'Buy I Quit']
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[Anagrams\]\sAnagrams for: [a-z]*\s\d* found. Displaying all:\s[a-z\/\.\s]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
    it('handles too long input', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js anagram johnjacobjingleheimerschmidtthatsmynametoo > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Input[a-z0-9 \(\)\.']*\s[a-z \.]*/mig);
        done(err);
      });
    });
    it('handles no found anagrams', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js anagram bcdfghjklmnpqrstvwxz > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/No anagrams found\./mig);
        done(err);
      });
    });
  });
  describe('comp', function () {
    it('outputs shell completion script', function (done) {
      child.exec('node ' + __dirname + '/../build/leximaven.js comp > test/output/comp.out', function (err) {
        var stdout = fs.readFileSync('test/output/comp.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[#\-a-z0-9\.\s:\/>~_\(\)\{\}\[\]="$@,;]*/mig);
        done(err);
      });
    });
  });
  describe('help', function () {
    it('shows usage', function (done) {
      child.exec('node ' + __dirname + '/../build/leximaven.js --help > test/output/help.out', function (err) {
        var stdout = fs.readFileSync('test/output/help.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[_ \/\(\)\-\\'`|,\s]*\s*Usage:\s[a-z \/\.<>\[\]]*\s*Commands:\s[ a-z<>\s]*:\s[ \-a-z,\[\]\s]*\[boolean\]\s*/mig);
        done(err);
      });
    });
  });
  describe('ls', function () {
    it('demonstrates installed themes', function (done) {
      child.exec('node ' + __dirname + '/../build/leximaven.js ls > test/output/ls.out', function (err) {
        var stdout = fs.readFileSync('test/output/ls.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z :|,.<>\-\[\]→]*/mig);
        done(err);
      });
    });
  });
  describe('map', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js map -s ubiquity > test/output/map.out', function (err) {
        var stdout = fs.readFileSync('test/output/map.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\],→ ;:'\?"\(\)-…\/\.√©ĭēˈɪ”]*/mig);
        done(err);
      });
    });
  });
  describe('onelook', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js onelook -s -o ' + process.cwd() + '/test/output/onelook.json ubiquity > test/output/onelook.out', function (err) {
        var stdout = fs.readFileSync('test/output/onelook.out', 'utf8');
        var obj = {
          type: 'onelook',
          source: 'http://www.onelook.com',
          url: 'http://onelook.com/?xml=1&w=ubiquity',
          definition: 'noun: the state of being everywhere at once (or seeming to be everywhere at once)',
          phrase: 'ubiquity records',
          sim: 'omnipresence,ubiquitousness'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/onelook.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
    it('provides resource links', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js onelook -l ubiquity > test/output/onelook.out', function (err) {
        var stdout = fs.readFileSync('test/output/onelook.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*\s\[Resources\]\s[a-z0-9 \s\[\]→:\/\._#\?=\-',&%\(\)\+]*/mig);
        done(err);
      });
    });
  });
  describe('urban', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js urban -s -l1 -o ' + process.cwd() + '/test/output/urban.json flip the bird > test/output/urban.out', function (err) {
        var stdout = fs.readFileSync('test/output/urban.out', 'utf8');
        var obj = {
          type: 'urban',
          source: 'http://www.urbandictionary.com',
          url: 'http://api.urbandictionary.com/v0/define?term=flip+the+bird',
          definition0: '1. The act of rotating an avian creature through more than 90 degrees.\r\n\r\n2. The act of extending the central digit of the hand with the intent to cause offense.'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/urban.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \[\]→\.\/\s]*/mig);
        expect((0, _stringify2.default)(json)).to.equals((0, _stringify2.default)(obj));
        done(err);
      });
    });
  });
  describe('version', function () {
    it('prints the version number', function (done) {
      child.exec('node ' + process.cwd() + '/build/leximaven.js --version', function (err, stdout) {
        expect(stdout).to.contain(version);
        done(err);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,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UUQsQ0FsVUQiLCJmaWxlIjoidGVzdC5lczYiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbWF4LWxlbjogMCAqL1xuY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vc3JjL3RoZW1lcycpXG5jb25zdCB0b29scyA9IHJlcXVpcmUoJy4uL3NyYy90b29scycpXG5cbmNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBjaGlsZCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKVxuY29uc3QgZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpLmV4cGVjdFxuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpXG5jb25zdCBub29uID0gcmVxdWlyZSgnbm9vbicpXG5jb25zdCBzaW5vbiA9IHJlcXVpcmUoJ3Npbm9uJylcbmNvbnN0IHN0cmlwID0gcmVxdWlyZSgnc3RyaXAtYW5zaScpXG5jb25zdCB2ZXJzaW9uID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvblxuY29uc3QgeG1sMmpzID0gcmVxdWlyZSgneG1sMmpzJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5jb25zdCBURklMRSA9IGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3QvdGVzdC5jb25maWcubm9vbmBcbmNvbnN0IHNweSA9IHNpbm9uLnNweShjb25zb2xlLCAnbG9nJylcblxuZGVzY3JpYmUoJ3Rvb2xzJywgKCkgPT4ge1xuICBiZWZvcmUoKGRvbmUpID0+IHtcbiAgICBmcy5ta2RpcnBTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgZnMuY29weVN5bmMoQ0ZJTEUsICd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicpXG4gICAgZG9uZSgpXG4gIH0pXG4gIGJlZm9yZUVhY2goKGRvbmUpID0+IHtcbiAgICBzcHkucmVzZXQoKVxuICAgIGRvbmUoKVxuICB9KVxuICBhZnRlcigoZG9uZSkgPT4ge1xuICAgIGZzLmNvcHlTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicsIENGSUxFKVxuICAgIGZzLnJlbW92ZVN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBkb25lKClcbiAgfSlcbiAgZGVzY3JpYmUoJ2NoZWNrIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ2NvZXJjZXMgdHJ1ZScsIChkb25lKSA9PiB7XG4gICAgICBleHBlY3QodG9vbHMuY2hlY2tCb29sZWFuKCd0cnVlJykpLnRvLmJlLnRydWVcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ2NvZXJjZXMgZmFsc2UnLCAoZG9uZSkgPT4ge1xuICAgICAgZXhwZWN0KHRvb2xzLmNoZWNrQm9vbGVhbignZmFsc2UnKSkudG8uYmUuZmFsc2VcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdjaGVjayBvdXRmaWxlJywgKCkgPT4ge1xuICAgIGl0KCdqc29uIGV4aXN0cycsIChkb25lKSA9PiB7XG4gICAgICBjb25zdCBvYmogPSB7IGZvbzogJ2JhcicgfVxuICAgICAgY29uc3Qgb2JqMiA9IHsgYmFyOiAnZm9vJyB9XG4gICAgICB0b29scy5vdXRGaWxlKCd0ZXN0L291dHB1dC90ZXN0Lmpzb24nLCBmYWxzZSwgb2JqKVxuICAgICAgZXhwZWN0KHNweS5jYWxsZWRXaXRoKHRvb2xzLm91dEZpbGUoJ3Rlc3Qvb3V0cHV0L3Rlc3QuanNvbicsIGZhbHNlLCBvYmoyKSkpLnRvLm1hdGNoKC9bYS16XFwvLFxcLVxcLiBdKi9taWcpXG4gICAgICBjb25zdCBhY3R1YWwgPSBmcy5yZWFkSnNvblN5bmMoJ3Rlc3Qvb3V0cHV0L3Rlc3QuanNvbicpXG4gICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoYWN0dWFsKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICBmcy5yZW1vdmVTeW5jKCd0ZXN0L291dHB1dC90ZXN0Lmpzb24nKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdChcImpzb24gZG9lc24ndCBleGlzdFwiLCAoZG9uZSkgPT4ge1xuICAgICAgY29uc3Qgb2JqID0geyBmb286ICdiYXInIH1cbiAgICAgIGV4cGVjdChzcHkuY2FsbGVkV2l0aCh0b29scy5vdXRGaWxlKCd0ZXN0L291dHB1dC90ZXN0Lmpzb24nLCBmYWxzZSwgb2JqKSkpLnRvLm1hdGNoKC9bYS16XFwvLFxcLVxcLiBdKi9taWcpXG4gICAgICBmcy5yZW1vdmVTeW5jKCd0ZXN0L291dHB1dC90ZXN0Lmpzb24nKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdCgneG1sIGV4aXN0cycsIChkb25lKSA9PiB7XG4gICAgICBjb25zdCBvYmogPSB7IGZvbzogJ2JhcicgfVxuICAgICAgdG9vbHMub3V0RmlsZSgndGVzdC9vdXRwdXQvdGVzdC54bWwnLCBmYWxzZSwgb2JqKVxuICAgICAgdG9vbHMub3V0RmlsZSgndGVzdC9vdXRwdXQvdGVzdC54bWwnLCBmYWxzZSwgb2JqKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdCgnZW5mb3JjZXMgc3VwcG9ydGVkIGZvcm1hdHMnLCAoZG9uZSkgPT4ge1xuICAgICAgY29uc3Qgb2JqID0geyBmb286ICdiYXInIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHRvb2xzLm91dEZpbGUoJ3Rlc3Qvb3V0cHV0L3Rlc3QuZm9vJywgZmFsc2UsIG9iailcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnY2hlY2sgY29uZmlnJywgKCkgPT4ge1xuICAgIGl0KCdjb25maWcgZXhpc3RzJywgKGRvbmUpID0+IHtcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgZXhwZWN0KHRvb2xzLmNoZWNrQ29uZmlnKENGSUxFKSkudG8uYmUudHJ1ZVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdChcImNvbmZpZyBkb2Vzbid0IGV4aXN0XCIsIChkb25lKSA9PiB7XG4gICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgICAgdHJ5IHtcbiAgICAgICAgdG9vbHMuY2hlY2tDb25maWcoQ0ZJTEUpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2FycmF5IHRvIHN0cmluZycsICgpID0+IHtcbiAgICBjb25zdCBhcnJheSA9IFsnZW5jbG9zZWQgc3RyaW5nJ11cbiAgICBjb25zdCBzdHJpbmcgPSAnbm9ybWFsIHN0cmluZydcbiAgICBpdCgnZXh0cmFjdHMgc3RyaW5nIGZyb20gYXJyYXknLCAoZG9uZSkgPT4ge1xuICAgICAgZXhwZWN0KHRvb2xzLmFyclRvU3RyKGFycmF5KSkudG8uZXF1YWxzKCdlbmNsb3NlZCBzdHJpbmcnKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdCgncmV0dXJucyBzdHJpbmcgd2hlbiBub3QgZW5jbG9zZWQnLCAoZG9uZSkgPT4ge1xuICAgICAgZXhwZWN0KHRvb2xzLmFyclRvU3RyKHN0cmluZykpLnRvLmVxdWFscygnbm9ybWFsIHN0cmluZycpXG4gICAgICBkb25lKClcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgncmF0ZS1saW1pdGluZycsICgpID0+IHtcbiAgICBpdCgncmVzZXRzIGRhdGFtdXNlIGxpbWl0JywgKGRvbmUpID0+IHtcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L3Rlc3QuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgIGNvbmZpZy5kbXVzZS5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJykucmVwbGFjZSgvMjAxNi8sICcyMDE1JylcbiAgICAgIGNvbmZpZy5kbXVzZS5kYXRlLnJlbWFpbiA9IDk5OTk4XG4gICAgICBjb25zdCBjaGVja1N0YW1wID0gdG9vbHMubGltaXREbXVzZShjb25maWcpXG4gICAgICBjb25zdCBjID0gY2hlY2tTdGFtcFswXVxuICAgICAgY29uc3QgcHJvY2VlZCA9IGNoZWNrU3RhbXBbMV1cbiAgICAgIGNvbnN0IHJlc2V0ID0gY2hlY2tTdGFtcFsyXVxuICAgICAgZXhwZWN0KGMuZG11c2UuZGF0ZS5yZW1haW4pLnRvLmVxdWFscyg5OTk5OSlcbiAgICAgIGV4cGVjdChjLmRtdXNlLmRhdGUuc3RhbXApLnRvLm1hdGNoKC8yMDE2W1xcLVxcZF0qVFswLTk6XFwuXFwtWl0qL21pZylcbiAgICAgIGV4cGVjdChwcm9jZWVkKS50by5lcXVhbHModHJ1ZSlcbiAgICAgIGV4cGVjdChyZXNldCkudG8uZXF1YWxzKHRydWUpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdkZWNyZW1lbnRzIGRhdGFtdXNlIGxpbWl0JywgKGRvbmUpID0+IHtcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L3Rlc3QuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgIGNvbmZpZy5kbXVzZS5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIGNvbmZpZy5kbXVzZS5kYXRlLnJlbWFpbiA9IDEwMDAwMFxuICAgICAgY29uc3QgY2hlY2tTdGFtcCA9IHRvb2xzLmxpbWl0RG11c2UoY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLmRtdXNlLmRhdGUucmVtYWluKS50by5lcXVhbHMoOTk5OTkpXG4gICAgICBleHBlY3QocHJvY2VlZCkudG8uZXF1YWxzKHRydWUpXG4gICAgICBleHBlY3QocmVzZXQpLnRvLmVxdWFscyhmYWxzZSlcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ3JlYWNoZXMgZGF0YW11c2UgbGltaXQnLCAoZG9uZSkgPT4ge1xuICAgICAgZnMuY29weVN5bmMoJ3Rlc3QvdGVzdC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgY29uZmlnLmRtdXNlLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgICAgY29uZmlnLmRtdXNlLmRhdGUucmVtYWluID0gMFxuICAgICAgY29uc3QgY2hlY2tTdGFtcCA9IHRvb2xzLmxpbWl0RG11c2UoY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLmRtdXNlLmRhdGUucmVtYWluKS50by5lcXVhbHMoMClcbiAgICAgIGV4cGVjdChwcm9jZWVkKS50by5lcXVhbHMoZmFsc2UpXG4gICAgICBleHBlY3QocmVzZXQpLnRvLmVxdWFscyhmYWxzZSlcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ3Jlc2V0cyBvbmVsb29rIGxpbWl0JywgKGRvbmUpID0+IHtcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L3Rlc3QuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgIGNvbmZpZy5vbmVsb29rLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKS5yZXBsYWNlKC8yMDE2LywgJzIwMTUnKVxuICAgICAgY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW4gPSA5OTk4XG4gICAgICBjb25zdCBjaGVja1N0YW1wID0gdG9vbHMubGltaXRPbmVsb29rKGNvbmZpZylcbiAgICAgIGNvbnN0IGMgPSBjaGVja1N0YW1wWzBdXG4gICAgICBjb25zdCBwcm9jZWVkID0gY2hlY2tTdGFtcFsxXVxuICAgICAgY29uc3QgcmVzZXQgPSBjaGVja1N0YW1wWzJdXG4gICAgICBleHBlY3QoYy5vbmVsb29rLmRhdGUucmVtYWluKS50by5lcXVhbHMoOTk5OSlcbiAgICAgIGV4cGVjdChjLm9uZWxvb2suZGF0ZS5zdGFtcCkudG8ubWF0Y2goLzIwMTZbXFwtXFxkXSpUWzAtOTpcXC5cXC1aXSovbWlnKVxuICAgICAgZXhwZWN0KHByb2NlZWQpLnRvLmVxdWFscyh0cnVlKVxuICAgICAgZXhwZWN0KHJlc2V0KS50by5lcXVhbHModHJ1ZSlcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ2RlY3JlbWVudHMgb25lbG9vayBsaW1pdCcsIChkb25lKSA9PiB7XG4gICAgICBmcy5jb3B5U3luYygndGVzdC90ZXN0LmNvbmZpZy5ub29uJywgQ0ZJTEUpXG4gICAgICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gICAgICBjb25maWcub25lbG9vay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluID0gMTAwMDBcbiAgICAgIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdE9uZWxvb2soY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLm9uZWxvb2suZGF0ZS5yZW1haW4pLnRvLmVxdWFscyg5OTk5KVxuICAgICAgZXhwZWN0KHByb2NlZWQpLnRvLmVxdWFscyh0cnVlKVxuICAgICAgZXhwZWN0KHJlc2V0KS50by5lcXVhbHMoZmFsc2UpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdyZWFjaGVzIG9uZWxvb2sgbGltaXQnLCAoZG9uZSkgPT4ge1xuICAgICAgZnMuY29weVN5bmMoJ3Rlc3QvdGVzdC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgICBjb25maWcub25lbG9vay5kYXRlLnJlbWFpbiA9IDBcbiAgICAgIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdE9uZWxvb2soY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLm9uZWxvb2suZGF0ZS5yZW1haW4pLnRvLmVxdWFscygwKVxuICAgICAgZXhwZWN0KHByb2NlZWQpLnRvLmVxdWFscyhmYWxzZSlcbiAgICAgIGV4cGVjdChyZXNldCkudG8uZXF1YWxzKGZhbHNlKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdCgncmVzZXRzIHJoeW1lYnJhaW4gbGltaXQnLCAoZG9uZSkgPT4ge1xuICAgICAgZnMuY29weVN5bmMoJ3Rlc3QvdGVzdC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJykucmVwbGFjZSgvMjAxNi8sICcyMDE1JylcbiAgICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSAzNDhcbiAgICAgIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdFJicmFpbihjb25maWcpXG4gICAgICBjb25zdCBjID0gY2hlY2tTdGFtcFswXVxuICAgICAgY29uc3QgcHJvY2VlZCA9IGNoZWNrU3RhbXBbMV1cbiAgICAgIGNvbnN0IHJlc2V0ID0gY2hlY2tTdGFtcFsyXVxuICAgICAgZXhwZWN0KGMucmJyYWluLmRhdGUucmVtYWluKS50by5lcXVhbHMoMzQ5KVxuICAgICAgZXhwZWN0KGMucmJyYWluLmRhdGUuc3RhbXApLnRvLm1hdGNoKC8yMDE2W1xcLVxcZF0qVFswLTk6XFwuXFwtWl0qL21pZylcbiAgICAgIGV4cGVjdChwcm9jZWVkKS50by5lcXVhbHModHJ1ZSlcbiAgICAgIGV4cGVjdChyZXNldCkudG8uZXF1YWxzKHRydWUpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdkZWNyZW1lbnRzIHJoeW1lYnJhaW4gbGltaXQnLCAoZG9uZSkgPT4ge1xuICAgICAgZnMuY29weVN5bmMoJ3Rlc3QvdGVzdC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSAzNTBcbiAgICAgIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdFJicmFpbihjb25maWcpXG4gICAgICBjb25zdCBjID0gY2hlY2tTdGFtcFswXVxuICAgICAgY29uc3QgcHJvY2VlZCA9IGNoZWNrU3RhbXBbMV1cbiAgICAgIGNvbnN0IHJlc2V0ID0gY2hlY2tTdGFtcFsyXVxuICAgICAgZXhwZWN0KGMucmJyYWluLmRhdGUucmVtYWluKS50by5lcXVhbHMoMzQ5KVxuICAgICAgZXhwZWN0KHByb2NlZWQpLnRvLmVxdWFscyh0cnVlKVxuICAgICAgZXhwZWN0KHJlc2V0KS50by5lcXVhbHMoZmFsc2UpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdyZWFjaGVzIHJoeW1lYnJhaW4gbGltaXQnLCAoZG9uZSkgPT4ge1xuICAgICAgZnMuY29weVN5bmMoJ3Rlc3QvdGVzdC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW4gPSAwXG4gICAgICBjb25zdCBjaGVja1N0YW1wID0gdG9vbHMubGltaXRSYnJhaW4oY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLnJicmFpbi5kYXRlLnJlbWFpbikudG8uZXF1YWxzKDApXG4gICAgICBleHBlY3QocHJvY2VlZCkudG8uZXF1YWxzKGZhbHNlKVxuICAgICAgZXhwZWN0KHJlc2V0KS50by5lcXVhbHMoZmFsc2UpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdyZXNldHMgd29yZG5payBsaW1pdCcsIChkb25lKSA9PiB7XG4gICAgICBmcy5jb3B5U3luYygndGVzdC90ZXN0LmNvbmZpZy5ub29uJywgQ0ZJTEUpXG4gICAgICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gICAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJykucmVwbGFjZSgvMjAxNi8sICcyMDE1JylcbiAgICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMTQ5OThcbiAgICAgIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdFdvcmRuaWsoY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLndvcmRuaWsuZGF0ZS5yZW1haW4pLnRvLmVxdWFscygxNDk5OSlcbiAgICAgIGV4cGVjdChjLndvcmRuaWsuZGF0ZS5zdGFtcCkudG8ubWF0Y2goLzIwMTZbXFwtXFxkXSpUWzAtOTpcXC5cXC1aXSovbWlnKVxuICAgICAgZXhwZWN0KHByb2NlZWQpLnRvLmVxdWFscyh0cnVlKVxuICAgICAgZXhwZWN0KHJlc2V0KS50by5lcXVhbHModHJ1ZSlcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ2RlY3JlbWVudHMgd29yZG5payBsaW1pdCcsIChkb25lKSA9PiB7XG4gICAgICBmcy5jb3B5U3luYygndGVzdC90ZXN0LmNvbmZpZy5ub29uJywgQ0ZJTEUpXG4gICAgICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gICAgICBjb25maWcud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluID0gMTUwMDBcbiAgICAgIGNvbnN0IGNoZWNrU3RhbXAgPSB0b29scy5saW1pdFdvcmRuaWsoY29uZmlnKVxuICAgICAgY29uc3QgYyA9IGNoZWNrU3RhbXBbMF1cbiAgICAgIGNvbnN0IHByb2NlZWQgPSBjaGVja1N0YW1wWzFdXG4gICAgICBjb25zdCByZXNldCA9IGNoZWNrU3RhbXBbMl1cbiAgICAgIGV4cGVjdChjLndvcmRuaWsuZGF0ZS5yZW1haW4pLnRvLmVxdWFscygxNDk5OSlcbiAgICAgIGV4cGVjdChwcm9jZWVkKS50by5lcXVhbHModHJ1ZSlcbiAgICAgIGV4cGVjdChyZXNldCkudG8uZXF1YWxzKGZhbHNlKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdCgncmVhY2hlcyB3b3JkbmlrIGxpbWl0JywgKGRvbmUpID0+IHtcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L3Rlc3QuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgIGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgICAgY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW4gPSAwXG4gICAgICBjb25zdCBjaGVja1N0YW1wID0gdG9vbHMubGltaXRXb3JkbmlrKGNvbmZpZylcbiAgICAgIGNvbnN0IGMgPSBjaGVja1N0YW1wWzBdXG4gICAgICBjb25zdCBwcm9jZWVkID0gY2hlY2tTdGFtcFsxXVxuICAgICAgY29uc3QgcmVzZXQgPSBjaGVja1N0YW1wWzJdXG4gICAgICBleHBlY3QoYy53b3JkbmlrLmRhdGUucmVtYWluKS50by5lcXVhbHMoMClcbiAgICAgIGV4cGVjdChwcm9jZWVkKS50by5lcXVhbHMoZmFsc2UpXG4gICAgICBleHBlY3QocmVzZXQpLnRvLmVxdWFscyhmYWxzZSlcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gIH0pXG59KVxuXG5kZXNjcmliZSgndGhlbWVzJywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBzcHkucmVzZXQoKVxuICB9KVxuICBhZnRlcigoKSA9PiBzcHkucmVzdG9yZSgpKVxuICAvLyBkZXNjcmliZSgnZmFsbGJhY2snLCAoKSA9PiB7XG4gIC8vICAgaXQoJ2ZhbGxzIGJhY2sgdG8gcGtnIGRpcicsIChkb25lKSA9PiB7XG4gIC8vICAgICBmcy5jb3B5U3luYygnLi90aGVtZXMnLCAnLi90aGVtZXMxJylcbiAgLy8gICAgIGZzLnJlbW92ZVN5bmMoJy4vdGhlbWVzJylcbiAgLy8gICAgIGNvbnN0IGxpc3QgPSB0aGVtZXMuZ2V0VGhlbWVzKCkuc29ydCgpXG4gIC8vICAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoJ3NxdWFyZScpXG4gIC8vICAgICBjb25zdCBsb2JqID0gWydjb2xvbmVsJywgJ21hcmt1cCcsICdzcXVhcmUnXVxuICAvLyAgICAgY29uc3QgdG9iaiA9IHtcbiAgLy8gICAgICAgcHJlZml4OiB7XG4gIC8vICAgICAgICAgc3RyOiAnWycsXG4gIC8vICAgICAgICAgc3R5bGU6ICdib2xkLmdyZWVuJyxcbiAgLy8gICAgICAgfSxcbiAgLy8gICAgICAgdGV4dDoge1xuICAvLyAgICAgICAgIHN0eWxlOiAnYm9sZC53aGl0ZScsXG4gIC8vICAgICAgIH0sXG4gIC8vICAgICAgIGNvbnRlbnQ6IHtcbiAgLy8gICAgICAgICBzdHlsZTogJ3doaXRlJyxcbiAgLy8gICAgICAgfSxcbiAgLy8gICAgICAgc3VmZml4OiB7XG4gIC8vICAgICAgICAgc3RyOiAnXScsXG4gIC8vICAgICAgICAgc3R5bGU6ICdib2xkLmdyZWVuJyxcbiAgLy8gICAgICAgfSxcbiAgLy8gICAgICAgY29ubmVjdG9yOiB7XG4gIC8vICAgICAgICAgc3RyOiAn4oaSJyxcbiAgLy8gICAgICAgICBzdHlsZTogJ2JvbGQuY3lhbicsXG4gIC8vICAgICAgIH0sXG4gIC8vICAgICB9XG4gIC8vICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkodGhlbWUpKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkodG9iaikpXG4gIC8vICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkobGlzdCkpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShsb2JqKSlcbiAgLy8gICAgIGZzLmNvcHlTeW5jKCcuL3RoZW1lczEnLCAnLi90aGVtZXMnKVxuICAvLyAgICAgZnMucmVtb3ZlU3luYygnLi90aGVtZXMxJylcbiAgLy8gICAgIGRvbmUoKVxuICAvLyAgIH0pXG4gIC8vIH0pXG4gIGRlc2NyaWJlKCdnZXQgdGhlbWVzJywgKCkgPT4ge1xuICAgIGl0KCdyZXR1cm5zIGFuIGFycmF5IG9mIHRoZW1lIG5hbWVzJywgKGRvbmUpID0+IHtcbiAgICAgIGNvbnN0IGxpc3QgPSB0aGVtZXMuZ2V0VGhlbWVzKCkuc29ydCgpXG4gICAgICBjb25zdCBvYmogPSBbJ2NvbG9uZWwnLCAnbWFya3VwJywgJ3NxdWFyZSddXG4gICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkobGlzdCkpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2xvYWQgdGhlbWUnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgYSB0aGVtZScsIChkb25lKSA9PiB7XG4gICAgICBjb25zdCB0aGVtZSA9IHRoZW1lcy5sb2FkVGhlbWUoJ3NxdWFyZScpXG4gICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgIHByZWZpeDoge1xuICAgICAgICAgIHN0cjogJ1snLFxuICAgICAgICAgIHN0eWxlOiAnYm9sZC5ncmVlbicsXG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICBzdHlsZTogJ2JvbGQud2hpdGUnLFxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgc3R5bGU6ICd3aGl0ZScsXG4gICAgICAgIH0sXG4gICAgICAgIHN1ZmZpeDoge1xuICAgICAgICAgIHN0cjogJ10nLFxuICAgICAgICAgIHN0eWxlOiAnYm9sZC5ncmVlbicsXG4gICAgICAgIH0sXG4gICAgICAgIGNvbm5lY3Rvcjoge1xuICAgICAgICAgIHN0cjogJ+KGkicsXG4gICAgICAgICAgc3R5bGU6ICdib2xkLmN5YW4nLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHRoZW1lKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICBkb25lKClcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnbGFiZWxzJywgKCkgPT4ge1xuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZSgnc3F1YXJlJylcbiAgICBjb25zdCB0ZXh0ID0gJ2xhYmVsJ1xuICAgIGl0KCdsYWJlbHMgcmlnaHQnLCAoZG9uZSkgPT4ge1xuICAgICAgY29uc3QgY29udGVudCA9ICdyaWdodCdcbiAgICAgIGV4cGVjdChzcHkuY2FsbGVkV2l0aCh0aGVtZXMubGFiZWwodGhlbWUsICdyaWdodCcsIHRleHQsIGNvbnRlbnQpKSkudG8uYmUudHJ1ZVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgICBpdCgnbGFiZWxzIGRvd24nLCAoZG9uZSkgPT4ge1xuICAgICAgY29uc3QgY29udGVudCA9ICdkb3duJ1xuICAgICAgZXhwZWN0KHNweS5jYWxsZWRXaXRoKHRoZW1lcy5sYWJlbCh0aGVtZSwgJ2Rvd24nLCB0ZXh0LCBjb250ZW50KSkpLnRvLmJlLnRydWVcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgaXQoJ2xhYmVscyB3aXRob3V0IGNvbnRlbnQnLCAoZG9uZSkgPT4ge1xuICAgICAgZXhwZWN0KHNweS5jYWxsZWRXaXRoKHRoZW1lcy5sYWJlbCh0aGVtZSwgJ3JpZ2h0JywgdGV4dCkpKS50by5iZS50cnVlXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdlbmZvcmNlcyByaWdodCBvciBkb3duJywgKGRvbmUpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW1lcy5sYWJlbCh0aGVtZSwgJ2VycicsICdsYWJlbCcpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdjb25maWcgY29tbWFuZHMnLCAoKSA9PiB7XG4gIGJlZm9yZSgoZG9uZSkgPT4ge1xuICAgIGZzLm1rZGlycFN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBmcy5jb3B5U3luYyhDRklMRSwgJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICBkb25lKClcbiAgfSlcbiAgYWZ0ZXIoKGRvbmUpID0+IHtcbiAgICBmcy5jb3B5U3luYygndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICBmcy5yZW1vdmVTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgZG9uZSgpXG4gIH0pXG4gIGRlc2NyaWJlKCdnZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIHZhbHVlIG9mIG9wdGlvbiBvbmVsb29rLmxpbmtzJywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgY29uZmlnIGdldCBvbmVsb29rLmxpbmtzID4gdGVzdC9vdXRwdXQvY29uZmlnLWdldC5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvY29uZmlnLWdldC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL09wdGlvbiBvbmVsb29rLmxpbmtzIGlzICh0cnVlfGZhbHNlKVxcLi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnaW5pdCcsICgpID0+IHtcbiAgICBiZWZvcmUoKGRvbmUpID0+IHtcbiAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGl0KCdjcmVhdGVzIHRoZSBjb25maWcgZmlsZScsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGNvbmZpZyBpbml0ID4gdGVzdC9vdXRwdXQvY29uZmlnLWluaXQub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2NvbmZpZy1pbml0Lm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgYW5hZ3JhbToge1xuICAgICAgICAgICAgY2FzZTogMSxcbiAgICAgICAgICAgIGxhbmc6ICdlbmdsaXNoJyxcbiAgICAgICAgICAgIGxpbWl0OiAxMCxcbiAgICAgICAgICAgIGxpbmVudW06IGZhbHNlLFxuICAgICAgICAgICAgbGlzdDogZmFsc2UsXG4gICAgICAgICAgICBtYXhsZXR0ZXI6IDUwLFxuICAgICAgICAgICAgbWF4d29yZDogMTAsXG4gICAgICAgICAgICBtaW5sZXR0ZXI6IDEsXG4gICAgICAgICAgICByZXBlYXQ6IGZhbHNlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZG11c2U6IHtcbiAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgaW50ZXJ2YWw6ICdkYXknLFxuICAgICAgICAgICAgICBsaW1pdDogMTAwMDAwLFxuICAgICAgICAgICAgICByZW1haW46IDEwMDAwMCxcbiAgICAgICAgICAgICAgc3RhbXA6ICcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1heDogNSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1lcmdlOiB0cnVlLFxuICAgICAgICAgIG9uZWxvb2s6IHtcbiAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgaW50ZXJ2YWw6ICdkYXknLFxuICAgICAgICAgICAgICBsaW1pdDogMTAwMDAsXG4gICAgICAgICAgICAgIHJlbWFpbjogMTAwMDAsXG4gICAgICAgICAgICAgIHN0YW1wOiAnJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsaW5rczogZmFsc2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgICByYnJhaW46IHtcbiAgICAgICAgICAgIGNvbWJpbmU6IHtcbiAgICAgICAgICAgICAgbGFuZzogJ2VuJyxcbiAgICAgICAgICAgICAgbWF4OiA1LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgaW50ZXJ2YWw6ICdob3VyJyxcbiAgICAgICAgICAgICAgbGltaXQ6IDM1MCxcbiAgICAgICAgICAgICAgcmVtYWluOiAzNTAsXG4gICAgICAgICAgICAgIHN0YW1wOiAnJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgIGxhbmc6ICdlbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmh5bWU6IHtcbiAgICAgICAgICAgICAgbGFuZzogJ2VuJyxcbiAgICAgICAgICAgICAgbWF4OiA1MCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0aGVtZTogJ3NxdWFyZScsXG4gICAgICAgICAgdXJiYW46IHtcbiAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdXNhZ2U6IHRydWUsXG4gICAgICAgICAgdmVyYm9zZTogZmFsc2UsXG4gICAgICAgICAgd29yZG1hcDoge1xuICAgICAgICAgICAgbGltaXQ6IDEsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB3b3JkbmlrOiB7XG4gICAgICAgICAgICBkYXRlOiB7XG4gICAgICAgICAgICAgIGludGVydmFsOiAnaG91cicsXG4gICAgICAgICAgICAgIGxpbWl0OiAxNTAwMCxcbiAgICAgICAgICAgICAgcmVtYWluOiAxNTAwMCxcbiAgICAgICAgICAgICAgc3RhbXA6ICcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlZmluZToge1xuICAgICAgICAgICAgICBjYW5vbjogZmFsc2UsXG4gICAgICAgICAgICAgIGRlZmRpY3Q6ICdhbGwnLFxuICAgICAgICAgICAgICBsaW1pdDogNSxcbiAgICAgICAgICAgICAgcGFydDogJycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXhhbXBsZToge1xuICAgICAgICAgICAgICBjYW5vbjogZmFsc2UsXG4gICAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgICAgICBza2lwOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGh5cGhlbjoge1xuICAgICAgICAgICAgICBjYW5vbjogZmFsc2UsXG4gICAgICAgICAgICAgIGRpY3Q6ICdhbGwnLFxuICAgICAgICAgICAgICBsaW1pdDogNSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvcmlnaW46IHtcbiAgICAgICAgICAgICAgY2Fub246IGZhbHNlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBocmFzZToge1xuICAgICAgICAgICAgICBjYW5vbjogZmFsc2UsXG4gICAgICAgICAgICAgIGxpbWl0OiA1LFxuICAgICAgICAgICAgICB3ZWlnaHQ6IDEzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb25vdW5jZToge1xuICAgICAgICAgICAgICBjYW5vbjogZmFsc2UsXG4gICAgICAgICAgICAgIGRpY3Q6ICcnLFxuICAgICAgICAgICAgICBsaW1pdDogNSxcbiAgICAgICAgICAgICAgdHlwZTogJycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVsYXRlOiB7XG4gICAgICAgICAgICAgIGNhbm9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICBjb25maWcuZG11c2UuZGF0ZS5zdGFtcCA9ICcnXG4gICAgICAgIGNvbmZpZy5kbXVzZS5kYXRlLnJlbWFpbiA9IDEwMDAwMFxuICAgICAgICBjb25maWcub25lbG9vay5kYXRlLnN0YW1wID0gJydcbiAgICAgICAgY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW4gPSAxMDAwMFxuICAgICAgICBjb25maWcucmJyYWluLmRhdGUuc3RhbXAgPSAnJ1xuICAgICAgICBjb25maWcucmJyYWluLmRhdGUucmVtYWluID0gMzUwXG4gICAgICAgIGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXAgPSAnJ1xuICAgICAgICBjb25maWcud29yZG5pay5kYXRlLnJlbWFpbiA9IDE1MDAwXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL0NyZWF0ZWQgW2EtelxcL1xcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgJyAnKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgJyAnKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgaXQoJ2ZvcmNlIG92ZXJ3cml0ZXMgZXhpc3RpbmcgYW5kIHByaW50cyBjb25maWcnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBjb25maWcgaW5pdCAtZiAtdiA+IHRlc3Qvb3V0cHV0L2NvbmZpZy1pbml0Lm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9jb25maWctaW5pdC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXowLTkgXFwvXFwuXFxbXFxdOlxcLVxcc3xdKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnc2V0JywgKCkgPT4ge1xuICAgIGl0KCdzZXRzIHZhbHVlIG9mIG9wdGlvbiBvbmVsb29rLmxpbmtzIHRvIGZhbHNlJywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgY29uZmlnIHNldCBvbmVsb29rLmxpbmtzIGZhbHNlID4gdGVzdC9vdXRwdXQvY29uZmlnLXNldC5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvY29uZmlnLXNldC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1NldCBvcHRpb24gb25lbG9vay5saW5rcyB0byAodHJ1ZXxmYWxzZSlcXC4vbWlnKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdkbXVzZSBjb21tYW5kcycsICgpID0+IHtcbiAgICBiZWZvcmUoKGRvbmUpID0+IHtcbiAgICAgIGZzLm1rZGlycFN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICAgIGNvbnN0IG9iaiA9IG5vb24ubG9hZChURklMRSlcbiAgICAgIG9iai5kbXVzZS5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIG9iai5vbmVsb29rLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICAgIG9iai53b3JkbmlrLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgICAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gICAgICB0cnkge1xuICAgICAgICBmcy5zdGF0U3luYyhDRklMRSlcbiAgICAgICAgZmlsZUV4aXN0cyA9IHRydWVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICBmaWxlRXhpc3RzID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZpbGVFeGlzdHMpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IGNvbmZpZy5kbXVzZS5kYXRlLnN0YW1wXG4gICAgICAgIG9iai5kbXVzZS5kYXRlLnJlbWFpbiA9IGNvbmZpZy5kbXVzZS5kYXRlLnJlbWFpblxuICAgICAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcFxuICAgICAgICBvYmoub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluXG4gICAgICAgIG9iai5yYnJhaW4uZGF0ZS5zdGFtcCA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcFxuICAgICAgICBvYmoucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpblxuICAgICAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcFxuICAgICAgICBvYmoud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluXG4gICAgICAgIGZzLmNvcHlTeW5jKENGSUxFLCAndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgICAgfVxuICAgICAgbm9vbi5zYXZlKENGSUxFLCBvYmopXG4gICAgICBkb25lKClcbiAgICB9KVxuICAgIGFmdGVyKChkb25lKSA9PiB7XG4gICAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLnN0YXRTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicpXG4gICAgICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicsIENGSUxFKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnMucmVtb3ZlU3luYyhDRklMRSlcbiAgICAgIH1cbiAgICAgIGZzLnJlbW92ZVN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gICAgZGVzY3JpYmUoJ2dldCcsICgpID0+IHtcbiAgICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGRtdXNlIGdldCAtcyAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2RtdXNlLmpzb24gbWw9dWJpcXVpdHkgPiB0ZXN0L291dHB1dC9kbXVzZS1nZXQub3V0YCwgKGVycikgPT4ge1xuICAgICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvZG11c2UtZ2V0Lm91dCcsICd1dGY4JylcbiAgICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgICB0eXBlOiAnZGF0YW11c2UnLFxuICAgICAgICAgICAgc291cmNlOiAnaHR0cDovL2RhdGFtdXNlLmNvbS9hcGknLFxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2FwaS5kYXRhbXVzZS5jb20vd29yZHM/bWF4PTUmJm1sPXViaXF1aXR5JmRtdXNlJmdldCcsXG4gICAgICAgICAgICBtYXRjaDA6ICd1YmlxdWl0b3VzbmVzcycsXG4gICAgICAgICAgICB0YWdzMTogJ25vdW4nLFxuICAgICAgICAgICAgbWF0Y2gxOiAnb21uaXByZXNlbmNlJyxcbiAgICAgICAgICAgIG1hdGNoMjogJ3BlcnZhc2l2ZW5lc3MnLFxuICAgICAgICAgICAgdGFnczA6ICdub3VuJyxcbiAgICAgICAgICAgIG1hdGNoMzogJ3ByZXZhbGVuY2UnLFxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2RtdXNlLmpzb25gKVxuICAgICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXpcXFtcXF3ihpJcXHMsXSpcXC9kbXVzZS5qc29uLi9taWcpXG4gICAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgICBkb25lKGVycilcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgICBkZXNjcmliZSgnaW5mbycsICgpID0+IHtcbiAgICAgIGl0KCdzaG93cyBtZXRyaWNzJywgKGRvbmUpID0+IHtcbiAgICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBkbXVzZSBpbmZvID4gdGVzdC9vdXRwdXQvZG11c2UtaW5mby5vdXRgLCBlcnIgPT4ge1xuICAgICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvZG11c2UtaW5mby5vdXQnLCAndXRmOCcpXG4gICAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EtejAtOVxcLyAsXFwuXSpcXHNbXFx3IF0qXFwodlxcZFxcKTogXFxkKi5cXGQqXFxzW1xcdyBcXChcXC9cXCk6XFwuLCVdKlxcc1tcXHcgXFwoXFwvXFwpOlxcLiwlXSovKVxuICAgICAgICAgIGRvbmUoZXJyKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxufSlcblxuZGVzY3JpYmUoJ3JicmFpbiBjb21tYW5kcycsICgpID0+IHtcbiAgYmVmb3JlKChkb25lKSA9PiB7XG4gICAgZnMubWtkaXJwU3luYygndGVzdC9vdXRwdXQnKVxuICAgIGNvbnN0IG9iaiA9IG5vb24ubG9hZChURklMRSlcbiAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLm9uZWxvb2suZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICB0cnkge1xuICAgICAgZnMuc3RhdFN5bmMoQ0ZJTEUpXG4gICAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgY29uc3QgY29uZmlnID0gbm9vbi5sb2FkKENGSUxFKVxuICAgICAgb2JqLmRtdXNlLmRhdGUuc3RhbXAgPSBjb25maWcuZG11c2UuZGF0ZS5zdGFtcFxuICAgICAgb2JqLmRtdXNlLmRhdGUucmVtYWluID0gY29uZmlnLmRtdXNlLmRhdGUucmVtYWluXG4gICAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcFxuICAgICAgb2JqLm9uZWxvb2suZGF0ZS5yZW1haW4gPSBjb25maWcub25lbG9vay5kYXRlLnJlbWFpblxuICAgICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wXG4gICAgICBvYmoucmJyYWluLmRhdGUucmVtYWluID0gY29uZmlnLnJicmFpbi5kYXRlLnJlbWFpblxuICAgICAgb2JqLndvcmRuaWsuZGF0ZS5zdGFtcCA9IGNvbmZpZy53b3JkbmlrLmRhdGUuc3RhbXBcbiAgICAgIG9iai53b3JkbmlrLmRhdGUucmVtYWluID0gY29uZmlnLndvcmRuaWsuZGF0ZS5yZW1haW5cbiAgICAgIGZzLmNvcHlTeW5jKENGSUxFLCAndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgIH1cbiAgICBub29uLnNhdmUoQ0ZJTEUsIG9iailcbiAgICBkb25lKClcbiAgfSlcbiAgYWZ0ZXIoKGRvbmUpID0+IHtcbiAgICBsZXQgZmlsZUV4aXN0cyA9IG51bGxcbiAgICB0cnkge1xuICAgICAgZnMuc3RhdFN5bmMoJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgICAgZnMuY29weVN5bmMoJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJywgQ0ZJTEUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgfVxuICAgIGZzLnJlbW92ZVN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBkb25lKClcbiAgfSlcbiAgZGVzY3JpYmUoJ2NvbWJpbmUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHJicmFpbiBjb21iaW5lIC1zIC1tMSAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2NvbWJpbmUuanNvbiB2YWx1ZSA+IHRlc3Qvb3V0cHV0L2NvbWJpbmUub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2NvbWJpbmUub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ3BvcnRtYW50ZWF1JyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vcmh5bWVicmFpbi5jb20nLFxuICAgICAgICAgIHVybDogJ2h0dHA6Ly9yaHltZWJyYWluLmNvbS90YWxrP2Z1bmN0aW9uPWdldFBvcnRtYW50ZWF1cyZ3b3JkPXZhbHVlJmxhbmc9ZW4mbWF4UmVzdWx0cz0xJicsXG4gICAgICAgICAgc2V0MDogJ3ZhbHVlLHVuaXF1ZScsXG4gICAgICAgICAgcG9ydG1hbnRlYXUwOiAndmFsdW5pcXVlJyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2NvbWJpbmUuanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1tcXFtcXF1hLXowLTks4oaSIC1cXC9cXC5dKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnaW5mbycsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgcmJyYWluIGluZm8gLXMgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9pbmZvLmpzb24gZnVjayA+IHRlc3Qvb3V0cHV0L2luZm8ub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2luZm8ub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ3dvcmQgaW5mbycsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3JoeW1lYnJhaW4uY29tJyxcbiAgICAgICAgICB1cmw6ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXRXb3JkSW5mbyZ3b3JkPWZ1Y2smbGFuZz1lbicsXG4gICAgICAgICAgYXJwYWJldDogJ0YgQUgxIEsnLFxuICAgICAgICAgIGlwYTogJ8uIZsqMaycsXG4gICAgICAgICAgc3lsbGFibGVzOiAnMScsXG4gICAgICAgICAgb2ZmZW5zaXZlOiB0cnVlLFxuICAgICAgICAgIGRpY3Q6IHRydWUsXG4gICAgICAgICAgdHJ1c3RlZDogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2luZm8uanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1tcXFtcXF1hLXowLTkgLeKGksuIyoxcXC9cXC4sXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ3JoeW1lJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyByYnJhaW4gcmh5bWUgLXMgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9yaHltZS5qc29uIHViaXF1aXR5ID4gdGVzdC9vdXRwdXQvcmh5bWUub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L3JoeW1lLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdyaHltZScsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3JoeW1lYnJhaW4uY29tJyxcbiAgICAgICAgICB1cmw6ICdodHRwOi8vcmh5bWVicmFpbi5jb20vdGFsaz9mdW5jdGlvbj1nZXRSaHltZXMmd29yZD11YmlxdWl0eSZsYW5nPWVuJm1heFJlc3VsdHM9NSYnLFxuICAgICAgICAgIHJoeW1lMDogJ3N0YWJpbGl0eScsXG4gICAgICAgICAgcmh5bWUxOiAndHlwaWNhbGx5JyxcbiAgICAgICAgICByaHltZTI6ICdzcGVjaWZpY2FsbHknLFxuICAgICAgICAgIHJoeW1lMzogJ3Jlc3BlY3RpdmVseScsXG4gICAgICAgICAgcmh5bWU0OiAnZWZmZWN0aXZlbHknLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvcmh5bWUuanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1xcW1JoeW1lc1xcXeKGklthLXoqLCBdKlxcc1dyb3RlIGRhdGEgdG8gW2EtelxcL1xcLl0qXFxzXFxkKlxcL1xcZCpbYS16MC05ICxcXC5dKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8ubWF0Y2goL1tcXHtcXH1hLXowLTlcXHM6XFwvXFwuXCIsXSovbWlnKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCd3b3JkbmlrIGNvbW1hbmRzJywgKCkgPT4ge1xuICBiZWZvcmUoKGRvbmUpID0+IHtcbiAgICBmcy5ta2RpcnBTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgY29uc3Qgb2JqID0gbm9vbi5sb2FkKFRGSUxFKVxuICAgIG9iai5kbXVzZS5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgICBvYmoucmJyYWluLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgIG9iai53b3JkbmlrLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgIGxldCBmaWxlRXhpc3RzID0gbnVsbFxuICAgIHRyeSB7XG4gICAgICBmcy5zdGF0U3luYyhDRklMRSlcbiAgICAgIGZpbGVFeGlzdHMgPSB0cnVlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgZmlsZUV4aXN0cyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gICAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IGNvbmZpZy5kbXVzZS5kYXRlLnN0YW1wXG4gICAgICBvYmouZG11c2UuZGF0ZS5yZW1haW4gPSBjb25maWcuZG11c2UuZGF0ZS5yZW1haW5cbiAgICAgIG9iai5vbmVsb29rLmRhdGUuc3RhbXAgPSBjb25maWcub25lbG9vay5kYXRlLnN0YW1wXG4gICAgICBvYmoub25lbG9vay5kYXRlLnJlbWFpbiA9IGNvbmZpZy5vbmVsb29rLmRhdGUucmVtYWluXG4gICAgICBvYmoucmJyYWluLmRhdGUuc3RhbXAgPSBjb25maWcucmJyYWluLmRhdGUuc3RhbXBcbiAgICAgIG9iai5yYnJhaW4uZGF0ZS5yZW1haW4gPSBjb25maWcucmJyYWluLmRhdGUucmVtYWluXG4gICAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcFxuICAgICAgb2JqLndvcmRuaWsuZGF0ZS5yZW1haW4gPSBjb25maWcud29yZG5pay5kYXRlLnJlbWFpblxuICAgICAgZnMuY29weVN5bmMoQ0ZJTEUsICd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicpXG4gICAgfVxuICAgIG5vb24uc2F2ZShDRklMRSwgb2JqKVxuICAgIGRvbmUoKVxuICB9KVxuICBhZnRlcigoZG9uZSkgPT4ge1xuICAgIGxldCBmaWxlRXhpc3RzID0gbnVsbFxuICAgIHRyeSB7XG4gICAgICBmcy5zdGF0U3luYygndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nKVxuICAgICAgZmlsZUV4aXN0cyA9IHRydWVcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICBmaWxlRXhpc3RzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZpbGVFeGlzdHMpIHtcbiAgICAgIGZzLnJlbW92ZVN5bmMoQ0ZJTEUpXG4gICAgICBmcy5jb3B5U3luYygndGVzdC9vdXRwdXQvc2F2ZWQuY29uZmlnLm5vb24nLCBDRklMRSlcbiAgICB9IGVsc2Uge1xuICAgICAgZnMucmVtb3ZlU3luYyhDRklMRSlcbiAgICB9XG4gICAgZnMucmVtb3ZlU3luYygndGVzdC9vdXRwdXQnKVxuICAgIGRvbmUoKVxuICB9KVxuICBkZXNjcmliZSgnZGVmaW5lJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyB3b3JkbmlrIGRlZmluZSAtcyAtbDEgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9kZWZpbmUuanNvbiB1YmlxdWl0eSA+IHRlc3Qvb3V0cHV0L2RlZmluZS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvZGVmaW5lLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdkZWZpbml0aW9uJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgICAgICB1cmw6IGBodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi91YmlxdWl0eS9kZWZpbml0aW9ucz91c2VDYW5vbmljYWw9ZmFsc2Umc291cmNlRGljdGlvbmFyaWVzPWFsbCZpbmNsdWRlUmVsYXRlZD1mYWxzZSZpbmNsdWRlVGFncz1mYWxzZSZsaW1pdD0xJnBhcnRPZlNwZWVjaD0mYXBpX2tleT0ke3Byb2Nlc3MuZW52LldPUkROSUt9YCxcbiAgICAgICAgICB0ZXh0MDogJ0V4aXN0ZW5jZSBvciBhcHBhcmVudCBleGlzdGVuY2UgZXZlcnl3aGVyZSBhdCB0aGUgc2FtZSB0aW1lOyBvbW5pcHJlc2VuY2U6IFwidGhlIHJlcGV0aXRpdmVuZXNzLCB0aGUgc2VsZnNhbWVuZXNzLCBhbmQgdGhlIHViaXF1aXR5IG9mIG1vZGVybiBtYXNzIGN1bHR1cmXigJ0gICggVGhlb2RvciBBZG9ybm8gKS4gJyxcbiAgICAgICAgICBkZWZ0eXBlMDogJ25vdW4nLFxuICAgICAgICAgIHNvdXJjZTA6ICdhaGQtbGVnYWN5JyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2RlZmluZS5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EtelxcW1xcXeKGkiA7OlwiLFxcLVxcKFxcKVxcLlxcL+KAnV0qV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2V4YW1wbGUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHdvcmRuaWsgZXhhbXBsZSAtcyAtbDEgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9leGFtcGxlLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9leGFtcGxlLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9leGFtcGxlLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdleGFtcGxlJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgICAgICB1cmw6IGBodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi91YmlxdWl0eS9leGFtcGxlcz91c2VDYW5vbmljYWw9ZmFsc2UmaW5jbHVkZUR1cGxpY2F0ZXM9ZmFsc2UmbGltaXQ9MSZza2lwPTAmYXBpX2tleT0ke3Byb2Nlc3MuZW52LldPUkROSUt9YCxcbiAgICAgICAgICBleGFtcGxlMDogJ0JvdGggYXJlIGNoYXJhY3Rlcml6ZWQgYnkgdGhlaXIgdWJpcXVpdHkgYW5kIHRoZWlyIGFudGlxdWl0eTogTm8ga25vd24gaHVtYW4gY3VsdHVyZSBsYWNrcyB0aGVtLCBhbmQgbXVzaWNhbCBpbnN0cnVtZW50cyBhcmUgYW1vbmcgdGhlIG9sZGVzdCBodW1hbiBhcnRpZmFjdHMsIGRhdGluZyB0byB0aGUgTGF0ZSBQbGVpc3RvY2VuZSBhYm91dCA1MCwwMDAgeWVhcnMgYWdvLicsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9leGFtcGxlLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16MC05XFxbXFxdIOKGkjosXFwuXSpcXHNXcm90ZSBkYXRhIHRvIFthLXpcXC9cXC5dKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnaHlwaGVuJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyB3b3JkbmlrIGh5cGhlbiAtcyAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2h5cGhlbi5qc29uIHViaXF1aXR5ID4gdGVzdC9vdXRwdXQvaHlwaGVuLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9oeXBoZW4ub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ2h5cGhlbmF0aW9uJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgICAgICB1cmw6IGBodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi91YmlxdWl0eS9oeXBoZW5hdGlvbj91c2VDYW5vbmljYWw9ZmFsc2UmbGltaXQ9NSZhcGlfa2V5PSR7cHJvY2Vzcy5lbnYuV09SRE5JS31gLFxuICAgICAgICAgIHN5bGxhYmxlMDogJ3UnLFxuICAgICAgICAgIHN0cmVzczE6ICdiaXEnLFxuICAgICAgICAgIHN5bGxhYmxlMjogJ3VpJyxcbiAgICAgICAgICBzeWxsYWJsZTM6ICd0eScsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9oeXBoZW4uanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1xcW0h5cGhlbmF0aW9uXFxd4oaSW2EtelxcLV0qXFxzV3JvdGUgZGF0YSB0byBbYS16XFwvXFwuXSpcXHNcXGQqXFwvXFxkKlthLXowLTkgLFxcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdvcmlnaW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHdvcmRuaWsgb3JpZ2luIC1zIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvb3JpZ2luLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9vcmlnaW4ub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L29yaWdpbi5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAnZXR5bW9sb2d5JyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgICAgICB1cmw6IGBodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi91YmlxdWl0eS9ldHltb2xvZ2llcz91c2VDYW5vbmljYWw9ZmFsc2UmYXBpX2tleT0ke3Byb2Nlc3MuZW52LldPUkROSUt9YCxcbiAgICAgICAgICBldHltb2xvZ3k6ICdbTC4gIGV2ZXJ5d2hlcmUsIGZyLiAgd2hlcmUsIHBlcmhhcHMgZm9yICwgIChjZi4gIGFueXdoZXJlKSwgYW5kIGlmIHNvIGFraW4gdG8gRS4gOiBjZi4gRi4gLl0nLFxuICAgICAgICAgIG9yaWdpbjogJ3ViaXF1ZSwgdWJpLCBjdWJpLCBxdW9iaSwgYWxpY3ViaSwgd2hvLCB1YmlxdWl04oiawqknLFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvb3JpZ2luLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16IFxcW1xcXeKGklxcLixcXChcXCk64oiawqldKldyb3RlIGRhdGEgdG8gW2EtelxcL1xcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdwaHJhc2UnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHdvcmRuaWsgcGhyYXNlIC1zIC1sMSAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3BocmFzZS5qc29uIHViaXF1aXRvdXMgPiB0ZXN0L291dHB1dC9waHJhc2Uub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L3BocmFzZS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAncGhyYXNlJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3LndvcmRuaWsuY29tJyxcbiAgICAgICAgICB1cmw6IGBodHRwOi8vYXBpLndvcmRuaWsuY29tOjgwL3Y0L3dvcmQuanNvbi91YmlxdWl0b3VzL3BocmFzZXM/dXNlQ2Fub25pY2FsPWZhbHNlJmxpbWl0PTEmd2xtaT0xMyZhcGlfa2V5PSR7cHJvY2Vzcy5lbnYuV09SRE5JS31gLFxuICAgICAgICAgIGFncmFtMDogJ3ViaXF1aXRvdXMnLFxuICAgICAgICAgIGJncmFtMDogJ2Ftb2ViYScsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9waHJhc2UuanNvbmApXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXpcXFtcXF1cXC1cXHNdKldyb3RlIGRhdGEgdG8gW2EtelxcL1xcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdwcm9ub3VuY2UnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHdvcmRuaWsgcHJvbm91bmNlIC1zIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvcHJvbm91bmNlLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9wcm9ub3VuY2Uub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L3Byb25vdW5jZS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAncHJvbnVuY2lhdGlvbicsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL3d3dy53b3JkbmlrLmNvbScsXG4gICAgICAgICAgdXJsOiBgaHR0cDovL2FwaS53b3JkbmlrLmNvbTo4MC92NC93b3JkLmpzb24vdWJpcXVpdHkvcHJvbnVuY2lhdGlvbnM/dXNlQ2Fub25pY2FsPWZhbHNlJmxpbWl0PTUmYXBpX2tleT0ke3Byb2Nlc3MuZW52LldPUkROSUt9YCxcbiAgICAgICAgICB3b3JkOiAndWJpcXVpdHknLFxuICAgICAgICAgIHByb251bmNpYXRpb24wOiAnKHlvzZ5vLWLErWvLiHfErS10xJMpJyxcbiAgICAgICAgICB0eXBlMDogJ2FoZC1sZWdhY3knLFxuICAgICAgICAgIHByb251bmNpYXRpb24xOiAnWSBVVzAgQiBJSDEgSyBXIElIMCBUIElZMCcsXG4gICAgICAgICAgdHlwZTE6ICdhcnBhYmV0JyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3Byb25vdW5jZS5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EtejAtOVxcW1xcXVxcKFxcKSBcXC3ihpLErcSTy4hcXHNvzZ5dKlxcc1dyb3RlIGRhdGEgdG8gW2EtelxcL1xcLl0qL21pZylcbiAgICAgICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGpzb24pKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdyZWxhdGUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHdvcmRuaWsgcmVsYXRlIC1zIC1sMSAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3JlbGF0ZS5qc29uIHViaXF1aXR5ID4gdGVzdC9vdXRwdXQvcmVsYXRlLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9yZWxhdGUub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ3JlbGF0ZWQgd29yZHMnLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cud29yZG5pay5jb20nLFxuICAgICAgICAgIHVybDogYGh0dHA6Ly9hcGkud29yZG5pay5jb206ODAvdjQvd29yZC5qc29uL3ViaXF1aXR5L3JlbGF0ZWRXb3Jkcz91c2VDYW5vbmljYWw9ZmFsc2UmbGltaXRQZXJSZWxhdGlvbnNoaXBUeXBlPTEmYXBpX2tleT0ke3Byb2Nlc3MuZW52LldPUkROSUt9YCxcbiAgICAgICAgICB3b3JkOiAndWJpcXVpdHknLFxuICAgICAgICAgIHR5cGUwOiAnYW50b255bScsXG4gICAgICAgICAgd29yZHMwOiAndW5pcXVpdHknLFxuICAgICAgICAgIHR5cGUxOiAnaHlwZXJueW0nLFxuICAgICAgICAgIHdvcmRzMTogJ3ByZXNlbmNlJyxcbiAgICAgICAgICB0eXBlMjogJ2Nyb3NzLXJlZmVyZW5jZScsXG4gICAgICAgICAgd29yZHMyOiAndWJpcXVpdHkgb2YgdGhlIGtpbmcnLFxuICAgICAgICAgIHR5cGUzOiAnc3lub255bScsXG4gICAgICAgICAgd29yZHMzOiAnb21uaXByZXNlbmNlJyxcbiAgICAgICAgICB0eXBlNDogJ3JoeW1lJyxcbiAgICAgICAgICB3b3JkczQ6ICdpbmlxdWl0eScsXG4gICAgICAgICAgdHlwZTU6ICdzYW1lLWNvbnRleHQnLFxuICAgICAgICAgIHdvcmRzNTogJ29tbmlwcmVzZW5jZSdcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3JlbGF0ZS5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EteiBcXFtcXF0sXFwt4oaSXSpcXHNXcm90ZSBkYXRhIHRvIFthLXpcXC9cXC5dKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcblxuZGVzY3JpYmUoJ3Jvb3QgY29tbWFuZHMnLCAoKSA9PiB7XG4gIGJlZm9yZSgoZG9uZSkgPT4ge1xuICAgIGZzLm1rZGlycFN5bmMoJ3Rlc3Qvb3V0cHV0JylcbiAgICBjb25zdCBvYmogPSBub29uLmxvYWQoVEZJTEUpXG4gICAgb2JqLmRtdXNlLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgIG9iai5vbmVsb29rLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICAgIG9iai5yYnJhaW4uZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgb2JqLndvcmRuaWsuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gICAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gICAgdHJ5IHtcbiAgICAgIGZzLnN0YXRTeW5jKENGSUxFKVxuICAgICAgZmlsZUV4aXN0cyA9IHRydWVcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICBmaWxlRXhpc3RzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZpbGVFeGlzdHMpIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IG5vb24ubG9hZChDRklMRSlcbiAgICAgIG9iai5kbXVzZS5kYXRlLnN0YW1wID0gY29uZmlnLmRtdXNlLmRhdGUuc3RhbXBcbiAgICAgIG9iai5kbXVzZS5kYXRlLnJlbWFpbiA9IGNvbmZpZy5kbXVzZS5kYXRlLnJlbWFpblxuICAgICAgb2JqLm9uZWxvb2suZGF0ZS5zdGFtcCA9IGNvbmZpZy5vbmVsb29rLmRhdGUuc3RhbXBcbiAgICAgIG9iai5vbmVsb29rLmRhdGUucmVtYWluID0gY29uZmlnLm9uZWxvb2suZGF0ZS5yZW1haW5cbiAgICAgIG9iai5yYnJhaW4uZGF0ZS5zdGFtcCA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5zdGFtcFxuICAgICAgb2JqLnJicmFpbi5kYXRlLnJlbWFpbiA9IGNvbmZpZy5yYnJhaW4uZGF0ZS5yZW1haW5cbiAgICAgIG9iai53b3JkbmlrLmRhdGUuc3RhbXAgPSBjb25maWcud29yZG5pay5kYXRlLnN0YW1wXG4gICAgICBvYmoud29yZG5pay5kYXRlLnJlbWFpbiA9IGNvbmZpZy53b3JkbmlrLmRhdGUucmVtYWluXG4gICAgICBmcy5jb3B5U3luYyhDRklMRSwgJ3Rlc3Qvb3V0cHV0L3NhdmVkLmNvbmZpZy5ub29uJylcbiAgICAgIG5vb24uc2F2ZShDRklMRSwgb2JqKVxuICAgIH0gZWxzZSB7XG4gICAgICBub29uLnNhdmUoQ0ZJTEUsIG9iailcbiAgICB9XG4gICAgZG9uZSgpXG4gIH0pXG4gIGFmdGVyKChkb25lKSA9PiB7XG4gICAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gICAgdHJ5IHtcbiAgICAgIGZzLnN0YXRTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicpXG4gICAgICBmaWxlRXhpc3RzID0gdHJ1ZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIGZpbGVFeGlzdHMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgZnMucmVtb3ZlU3luYyhDRklMRSlcbiAgICAgIGZzLmNvcHlTeW5jKCd0ZXN0L291dHB1dC9zYXZlZC5jb25maWcubm9vbicsIENGSUxFKVxuICAgIH0gZWxzZSB7XG4gICAgICBmcy5yZW1vdmVTeW5jKENGSUxFKVxuICAgIH1cbiAgICBmcy5yZW1vdmVTeW5jKCd0ZXN0L291dHB1dCcpXG4gICAgZG9uZSgpXG4gIH0pXG4gIGRlc2NyaWJlKCdhY3JvbnltJywgKCkgPT4ge1xuICAgIGl0KCdzaG93cyBvdXRwdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBhY3JvbnltIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvYWNyb255bS5qc29uIEREQyA+IHRlc3Qvb3V0cHV0L2Fjcm9ueW0ub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2Fjcm9ueW0ub3V0JywgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBqc29uID0gZnMucmVhZEpzb25TeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2Fjcm9ueW0uanNvbmApXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAnYWNyb255bScsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL2Fjcm9ueW1zLnNpbG1hcmlsLmllJyxcbiAgICAgICAgICB1cmw6ICdodHRwOi8vYWNyb255bXMuc2lsbWFyaWwuaWUvY2dpLWJpbi94YWE/RERDJyxcbiAgICAgICAgICBleHBhbnNpb24wOiAnRGV3ZXkgRGVjaW1hbCBDbGFzc2lmaWNhdGlvbicsXG4gICAgICAgICAgY29tbWVudDA6ICdsaWJyYXJ5IGFuZCBrbm93bGVkZ2UgY2xhc3NpZmljYXRpb24gc3lzdGVtJyxcbiAgICAgICAgICB1cmwwOiAnaHR0cDovL3d3dy5vY2xjLm9yZy9kZXdleS8nLFxuICAgICAgICAgIEREQzA6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjE6ICdEaWdpdGFsIERhdGEgQ29udmVydGVyJyxcbiAgICAgICAgICBEREMxOiAnMDQwJyxcbiAgICAgICAgICBleHBhbnNpb24yOiAnRGlnaXRhbCBEb3duIENvbnZlcnRlcicsXG4gICAgICAgICAgRERDMjogJzAwMCcsXG4gICAgICAgICAgZXhwYW5zaW9uMzogJ0RpcmVjdCBEZXBhcnRtZW50IENhbGxpbmcnLFxuICAgICAgICAgIEREQzM6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjQ6ICdEb2RnZSBDaXR5IE11bmljaXBhbCBhaXJwb3J0IChjb2RlKScsXG4gICAgICAgICAgY29tbWVudDQ6ICdVbml0ZWQgU3RhdGVzJyxcbiAgICAgICAgICBEREM0OiAnMzg3JyxcbiAgICAgICAgfVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9Gb3VuZCBcXGQqIGFjcm9ueW1zIGZvciBbYS16XSo6XFxzW2EtejAtOVxccy06XFwvXFwufCh8KV0qV3JvdGUgZGF0YSB0byBbYS16XFwvXSouanNvbi4vbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpdCgnZm9yY2VzIHdyaXRpbmcganNvbicsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGFjcm9ueW0gLWYgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9hY3JvbnltLmpzb24gRERDID4gdGVzdC9vdXRwdXQvYWNyb255bS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvYWNyb255bS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IGpzb24gPSBmcy5yZWFkSnNvblN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvYWNyb255bS5qc29uYClcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdhY3JvbnltJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vYWNyb255bXMuc2lsbWFyaWwuaWUnLFxuICAgICAgICAgIHVybDogJ2h0dHA6Ly9hY3Jvbnltcy5zaWxtYXJpbC5pZS9jZ2ktYmluL3hhYT9EREMnLFxuICAgICAgICAgIGV4cGFuc2lvbjA6ICdEZXdleSBEZWNpbWFsIENsYXNzaWZpY2F0aW9uJyxcbiAgICAgICAgICBjb21tZW50MDogJ2xpYnJhcnkgYW5kIGtub3dsZWRnZSBjbGFzc2lmaWNhdGlvbiBzeXN0ZW0nLFxuICAgICAgICAgIHVybDA6ICdodHRwOi8vd3d3Lm9jbGMub3JnL2Rld2V5LycsXG4gICAgICAgICAgRERDMDogJzA0MCcsXG4gICAgICAgICAgZXhwYW5zaW9uMTogJ0RpZ2l0YWwgRGF0YSBDb252ZXJ0ZXInLFxuICAgICAgICAgIEREQzE6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjI6ICdEaWdpdGFsIERvd24gQ29udmVydGVyJyxcbiAgICAgICAgICBEREMyOiAnMDAwJyxcbiAgICAgICAgICBleHBhbnNpb24zOiAnRGlyZWN0IERlcGFydG1lbnQgQ2FsbGluZycsXG4gICAgICAgICAgRERDMzogJzA0MCcsXG4gICAgICAgICAgZXhwYW5zaW9uNDogJ0RvZGdlIENpdHkgTXVuaWNpcGFsIGFpcnBvcnQgKGNvZGUpJyxcbiAgICAgICAgICBjb21tZW50NDogJ1VuaXRlZCBTdGF0ZXMnLFxuICAgICAgICAgIEREQzQ6ICczODcnLFxuICAgICAgICB9XG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL0ZvdW5kIFxcZCogYWNyb255bXMgZm9yIFthLXpdKjpcXHNbYS16MC05XFxzLTpcXC9cXC58KHwpXSpPdmVyd3JvdGUgW2EtelxcL1xcLl0qIHdpdGggZGF0YS4vbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpdCgnd3JpdGVzIHhtbCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGFjcm9ueW0gLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9hY3JvbnltLnhtbCBERENgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAnYWNyb255bScsXG4gICAgICAgICAgc291cmNlOiAnaHR0cDovL2Fjcm9ueW1zLnNpbG1hcmlsLmllJyxcbiAgICAgICAgICB1cmw6ICdodHRwOi8vYWNyb255bXMuc2lsbWFyaWwuaWUvY2dpLWJpbi94YWE/RERDJyxcbiAgICAgICAgICBleHBhbnNpb24wOiAnRGV3ZXkgRGVjaW1hbCBDbGFzc2lmaWNhdGlvbicsXG4gICAgICAgICAgY29tbWVudDA6ICdsaWJyYXJ5IGFuZCBrbm93bGVkZ2UgY2xhc3NpZmljYXRpb24gc3lzdGVtJyxcbiAgICAgICAgICB1cmwwOiAnaHR0cDovL3d3dy5vY2xjLm9yZy9kZXdleS8nLFxuICAgICAgICAgIEREQzA6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjE6ICdEaWdpdGFsIERhdGEgQ29udmVydGVyJyxcbiAgICAgICAgICBEREMxOiAnMDQwJyxcbiAgICAgICAgICBleHBhbnNpb24yOiAnRGlnaXRhbCBEb3duIENvbnZlcnRlcicsXG4gICAgICAgICAgRERDMjogJzAwMCcsXG4gICAgICAgICAgZXhwYW5zaW9uMzogJ0RpcmVjdCBEZXBhcnRtZW50IENhbGxpbmcnLFxuICAgICAgICAgIEREQzM6ICcwNDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjQ6ICdEb2RnZSBDaXR5IE11bmljaXBhbCBhaXJwb3J0IChjb2RlKScsXG4gICAgICAgICAgY29tbWVudDQ6ICdVbml0ZWQgU3RhdGVzJyxcbiAgICAgICAgICBEREM0OiAnMzg3JyxcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4bWwgPSBmcy5yZWFkRmlsZVN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvYWNyb255bS54bWxgLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyB4bWwyanMuUGFyc2VyKClcbiAgICAgICAgcGFyc2VyLnBhcnNlU3RyaW5nKHhtbCwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgbGV0IGZpeGVkID0gcmVzdWx0LnJvb3RcbiAgICAgICAgICBmaXhlZC50eXBlID0gZml4ZWQudHlwZVswXVxuICAgICAgICAgIGZpeGVkLnNvdXJjZSA9IGZpeGVkLnNvdXJjZVswXVxuICAgICAgICAgIGZpeGVkLnVybCA9IGZpeGVkLnVybFswXVxuICAgICAgICAgIGZpeGVkLmV4cGFuc2lvbjAgPSBmaXhlZC5leHBhbnNpb24wWzBdXG4gICAgICAgICAgZml4ZWQuZXhwYW5zaW9uMSA9IGZpeGVkLmV4cGFuc2lvbjFbMF1cbiAgICAgICAgICBmaXhlZC5leHBhbnNpb24yID0gZml4ZWQuZXhwYW5zaW9uMlswXVxuICAgICAgICAgIGZpeGVkLmV4cGFuc2lvbjMgPSBmaXhlZC5leHBhbnNpb24zWzBdXG4gICAgICAgICAgZml4ZWQuZXhwYW5zaW9uNCA9IGZpeGVkLmV4cGFuc2lvbjRbMF1cbiAgICAgICAgICBmaXhlZC51cmwwID0gZml4ZWQudXJsMFswXVxuICAgICAgICAgIGZpeGVkLmNvbW1lbnQwID0gZml4ZWQuY29tbWVudDBbMF1cbiAgICAgICAgICBmaXhlZC5jb21tZW50NCA9IGZpeGVkLmNvbW1lbnQ0WzBdXG4gICAgICAgICAgZml4ZWQuRERDMCA9IGZpeGVkLkREQzBbMF1cbiAgICAgICAgICBmaXhlZC5EREMxID0gZml4ZWQuRERDMVswXVxuICAgICAgICAgIGZpeGVkLkREQzIgPSBmaXhlZC5EREMyWzBdXG4gICAgICAgICAgZml4ZWQuRERDMyA9IGZpeGVkLkREQzNbMF1cbiAgICAgICAgICBmaXhlZC5EREM0ID0gZml4ZWQuRERDNFswXVxuICAgICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShmaXhlZCkpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICAgIGRvbmUoZXJyKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICAgIGl0KCdmb3JjZXMgd3JpdGluZyB4bWwnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBhY3JvbnltIC1mIC1vICR7cHJvY2Vzcy5jd2QoKX0vdGVzdC9vdXRwdXQvYWNyb255bS54bWwgRERDYCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ2Fjcm9ueW0nLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly9hY3Jvbnltcy5zaWxtYXJpbC5pZScsXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2Fjcm9ueW1zLnNpbG1hcmlsLmllL2NnaS1iaW4veGFhP0REQycsXG4gICAgICAgICAgZXhwYW5zaW9uMDogJ0Rld2V5IERlY2ltYWwgQ2xhc3NpZmljYXRpb24nLFxuICAgICAgICAgIGNvbW1lbnQwOiAnbGlicmFyeSBhbmQga25vd2xlZGdlIGNsYXNzaWZpY2F0aW9uIHN5c3RlbScsXG4gICAgICAgICAgdXJsMDogJ2h0dHA6Ly93d3cub2NsYy5vcmcvZGV3ZXkvJyxcbiAgICAgICAgICBEREMwOiAnMDQwJyxcbiAgICAgICAgICBleHBhbnNpb24xOiAnRGlnaXRhbCBEYXRhIENvbnZlcnRlcicsXG4gICAgICAgICAgRERDMTogJzA0MCcsXG4gICAgICAgICAgZXhwYW5zaW9uMjogJ0RpZ2l0YWwgRG93biBDb252ZXJ0ZXInLFxuICAgICAgICAgIEREQzI6ICcwMDAnLFxuICAgICAgICAgIGV4cGFuc2lvbjM6ICdEaXJlY3QgRGVwYXJ0bWVudCBDYWxsaW5nJyxcbiAgICAgICAgICBEREMzOiAnMDQwJyxcbiAgICAgICAgICBleHBhbnNpb240OiAnRG9kZ2UgQ2l0eSBNdW5pY2lwYWwgYWlycG9ydCAoY29kZSknLFxuICAgICAgICAgIGNvbW1lbnQ0OiAnVW5pdGVkIFN0YXRlcycsXG4gICAgICAgICAgRERDNDogJzM4NycsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeG1sID0gZnMucmVhZEZpbGVTeW5jKGAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L2Fjcm9ueW0ueG1sYCwgJ3V0ZjgnKVxuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgeG1sMmpzLlBhcnNlcigpXG4gICAgICAgIHBhcnNlci5wYXJzZVN0cmluZyh4bWwsIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGxldCBmaXhlZCA9IHJlc3VsdC5yb290XG4gICAgICAgICAgZml4ZWQudHlwZSA9IGZpeGVkLnR5cGVbMF1cbiAgICAgICAgICBmaXhlZC5zb3VyY2UgPSBmaXhlZC5zb3VyY2VbMF1cbiAgICAgICAgICBmaXhlZC51cmwgPSBmaXhlZC51cmxbMF1cbiAgICAgICAgICBmaXhlZC5leHBhbnNpb24wID0gZml4ZWQuZXhwYW5zaW9uMFswXVxuICAgICAgICAgIGZpeGVkLmV4cGFuc2lvbjEgPSBmaXhlZC5leHBhbnNpb24xWzBdXG4gICAgICAgICAgZml4ZWQuZXhwYW5zaW9uMiA9IGZpeGVkLmV4cGFuc2lvbjJbMF1cbiAgICAgICAgICBmaXhlZC5leHBhbnNpb24zID0gZml4ZWQuZXhwYW5zaW9uM1swXVxuICAgICAgICAgIGZpeGVkLmV4cGFuc2lvbjQgPSBmaXhlZC5leHBhbnNpb240WzBdXG4gICAgICAgICAgZml4ZWQudXJsMCA9IGZpeGVkLnVybDBbMF1cbiAgICAgICAgICBmaXhlZC5jb21tZW50MCA9IGZpeGVkLmNvbW1lbnQwWzBdXG4gICAgICAgICAgZml4ZWQuY29tbWVudDQgPSBmaXhlZC5jb21tZW50NFswXVxuICAgICAgICAgIGZpeGVkLkREQzAgPSBmaXhlZC5EREMwWzBdXG4gICAgICAgICAgZml4ZWQuRERDMSA9IGZpeGVkLkREQzFbMF1cbiAgICAgICAgICBmaXhlZC5EREMyID0gZml4ZWQuRERDMlswXVxuICAgICAgICAgIGZpeGVkLkREQzMgPSBmaXhlZC5EREMzWzBdXG4gICAgICAgICAgZml4ZWQuRERDNCA9IGZpeGVkLkREQzRbMF1cbiAgICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoZml4ZWQpKS50by5lcXVhbHMoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgICAgICBkb25lKGVycilcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ2FuYWdyYW0nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGFuYWdyYW0gLXMgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9hbmFncmFtLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9hbmFncmFtLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9hbmFncmFtLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9hbmFncmFtLmpzb25gKVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgdHlwZTogJ2FuYWdyYW0nLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93b3Jkc21pdGgub3JnLycsXG4gICAgICAgICAgdXJsOiAnaHR0cDovL3dvcmRzbWl0aC5vcmcvYW5hZ3JhbS9hbmFncmFtLmNnaT9hbmFncmFtPXViaXF1aXR5Jmxhbmd1YWdlPWVuZ2xpc2gmdD0xMCZkPTEwJmluY2x1ZGU9JmV4Y2x1ZGU9Jm49MSZtPTUwJmE9biZsPW4mcT1uJms9MSZzcmM9YWR2JyxcbiAgICAgICAgICBmb3VuZDogJzInLFxuICAgICAgICAgIHNob3c6ICdhbGwnLFxuICAgICAgICAgIGFsaXN0OiBbXG4gICAgICAgICAgICAnVWJpcXVpdHknLFxuICAgICAgICAgICAgJ0J1eSBJIFF1aXQnLFxuICAgICAgICAgIF0sXG4gICAgICAgIH1cbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW0FuYWdyYW1zXFxdXFxzQW5hZ3JhbXMgZm9yOiBbYS16XSpcXHNcXGQqIGZvdW5kLiBEaXNwbGF5aW5nIGFsbDpcXHNbYS16XFwvXFwuXFxzXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpdCgnaGFuZGxlcyB0b28gbG9uZyBpbnB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIGFuYWdyYW0gam9obmphY29iamluZ2xlaGVpbWVyc2NobWlkdHRoYXRzbXluYW1ldG9vID4gdGVzdC9vdXRwdXQvYW5hZ3JhbS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvYW5hZ3JhbS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL0lucHV0W2EtejAtOSBcXChcXClcXC4nXSpcXHNbYS16IFxcLl0qL21pZylcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgaXQoJ2hhbmRsZXMgbm8gZm91bmQgYW5hZ3JhbXMnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBhbmFncmFtIGJjZGZnaGprbG1ucHFyc3R2d3h6ID4gdGVzdC9vdXRwdXQvYW5hZ3JhbS5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvYW5hZ3JhbS5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL05vIGFuYWdyYW1zIGZvdW5kXFwuL21pZylcbiAgICAgICAgZG9uZShlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdjb21wJywgKCkgPT4ge1xuICAgIGl0KCdvdXRwdXRzIHNoZWxsIGNvbXBsZXRpb24gc2NyaXB0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtfX2Rpcm5hbWV9Ly4uL2J1aWxkL2xleGltYXZlbi5qcyBjb21wID4gdGVzdC9vdXRwdXQvY29tcC5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvY29tcC5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1sjXFwtYS16MC05XFwuXFxzOlxcLz5+X1xcKFxcKVxce1xcfVxcW1xcXT1cIiRALDtdKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnaGVscCcsICgpID0+IHtcbiAgICBpdCgnc2hvd3MgdXNhZ2UnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke19fZGlybmFtZX0vLi4vYnVpbGQvbGV4aW1hdmVuLmpzIC0taGVscCA+IHRlc3Qvb3V0cHV0L2hlbHAub3V0YCwgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBzdGRvdXQgPSBmcy5yZWFkRmlsZVN5bmMoJ3Rlc3Qvb3V0cHV0L2hlbHAub3V0JywgJ3V0ZjgnKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bXyBcXC9cXChcXClcXC1cXFxcJ2B8LFxcc10qXFxzKlVzYWdlOlxcc1thLXogXFwvXFwuPD5cXFtcXF1dKlxccypDb21tYW5kczpcXHNbIGEtejw+XFxzXSo6XFxzWyBcXC1hLXosXFxbXFxdXFxzXSpcXFtib29sZWFuXFxdXFxzKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnbHMnLCAoKSA9PiB7XG4gICAgaXQoJ2RlbW9uc3RyYXRlcyBpbnN0YWxsZWQgdGhlbWVzJywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtfX2Rpcm5hbWV9Ly4uL2J1aWxkL2xleGltYXZlbi5qcyBscyA+IHRlc3Qvb3V0cHV0L2xzLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9scy5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXogOnwsLjw+XFwtXFxbXFxd4oaSXSovbWlnKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ21hcCcsICgpID0+IHtcbiAgICBpdCgnc2hvd3Mgb3V0cHV0JywgKGRvbmUpID0+IHtcbiAgICAgIGNoaWxkLmV4ZWMoYG5vZGUgJHtwcm9jZXNzLmN3ZCgpfS9idWlsZC9sZXhpbWF2ZW4uanMgbWFwIC1zIHViaXF1aXR5ID4gdGVzdC9vdXRwdXQvbWFwLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9tYXAub3V0JywgJ3V0ZjgnKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16MC05XFxbXFxdLOKGkiA7OidcXD9cIlxcKFxcKS3igKZcXC9cXC7iiJrCqcStxJPLiMmq4oCdXSovbWlnKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ29uZWxvb2snLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIG9uZWxvb2sgLXMgLW8gJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9vbmVsb29rLmpzb24gdWJpcXVpdHkgPiB0ZXN0L291dHB1dC9vbmVsb29rLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC9vbmVsb29rLm91dCcsICd1dGY4JylcbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIHR5cGU6ICdvbmVsb29rJyxcbiAgICAgICAgICBzb3VyY2U6ICdodHRwOi8vd3d3Lm9uZWxvb2suY29tJyxcbiAgICAgICAgICB1cmw6ICdodHRwOi8vb25lbG9vay5jb20vP3htbD0xJnc9dWJpcXVpdHknLFxuICAgICAgICAgIGRlZmluaXRpb246ICdub3VuOiB0aGUgc3RhdGUgb2YgYmVpbmcgZXZlcnl3aGVyZSBhdCBvbmNlIChvciBzZWVtaW5nIHRvIGJlIGV2ZXJ5d2hlcmUgYXQgb25jZSknLFxuICAgICAgICAgIHBocmFzZTogJ3ViaXF1aXR5IHJlY29yZHMnLFxuICAgICAgICAgIHNpbTogJ29tbmlwcmVzZW5jZSx1YmlxdWl0b3VzbmVzcycsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC9vbmVsb29rLmpzb25gKVxuICAgICAgICBleHBlY3Qoc3Rkb3V0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccilcXHM/L2dtLCAnXFxuJykpLnRvLm1hdGNoKC9bYS16MC05XFxbXFxdOlxcKFxcKeKGkiBcXC9cXC4sXSovbWlnKVxuICAgICAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoanNvbikpLnRvLmVxdWFscyhKU09OLnN0cmluZ2lmeShvYmopKVxuICAgICAgICBkb25lKGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgICBpdCgncHJvdmlkZXMgcmVzb3VyY2UgbGlua3MnLCAoZG9uZSkgPT4ge1xuICAgICAgY2hpbGQuZXhlYyhgbm9kZSAke3Byb2Nlc3MuY3dkKCl9L2J1aWxkL2xleGltYXZlbi5qcyBvbmVsb29rIC1sIHViaXF1aXR5ID4gdGVzdC9vdXRwdXQvb25lbG9vay5vdXRgLCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGZzLnJlYWRGaWxlU3luYygndGVzdC9vdXRwdXQvb25lbG9vay5vdXQnLCAndXRmOCcpXG4gICAgICAgIGV4cGVjdChzdGRvdXQucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKVxccz8vZ20sICdcXG4nKSkudG8ubWF0Y2goL1thLXowLTlcXFtcXF06XFwoXFwp4oaSIFxcL1xcLixdKlxcc1xcW1Jlc291cmNlc1xcXVxcc1thLXowLTkgXFxzXFxbXFxd4oaSOlxcL1xcLl8jXFw/PVxcLScsJiVcXChcXClcXCtdKi9taWcpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgndXJiYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3dzIG91dHB1dCcsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIHVyYmFuIC1zIC1sMSAtbyAke3Byb2Nlc3MuY3dkKCl9L3Rlc3Qvb3V0cHV0L3VyYmFuLmpzb24gZmxpcCB0aGUgYmlyZCA+IHRlc3Qvb3V0cHV0L3VyYmFuLm91dGAsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZnMucmVhZEZpbGVTeW5jKCd0ZXN0L291dHB1dC91cmJhbi5vdXQnLCAndXRmOCcpXG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICB0eXBlOiAndXJiYW4nLFxuICAgICAgICAgIHNvdXJjZTogJ2h0dHA6Ly93d3cudXJiYW5kaWN0aW9uYXJ5LmNvbScsXG4gICAgICAgICAgdXJsOiAnaHR0cDovL2FwaS51cmJhbmRpY3Rpb25hcnkuY29tL3YwL2RlZmluZT90ZXJtPWZsaXArdGhlK2JpcmQnLFxuICAgICAgICAgIGRlZmluaXRpb24wOiAnMS4gVGhlIGFjdCBvZiByb3RhdGluZyBhbiBhdmlhbiBjcmVhdHVyZSB0aHJvdWdoIG1vcmUgdGhhbiA5MCBkZWdyZWVzLlxcclxcblxcclxcbjIuIFRoZSBhY3Qgb2YgZXh0ZW5kaW5nIHRoZSBjZW50cmFsIGRpZ2l0IG9mIHRoZSBoYW5kIHdpdGggdGhlIGludGVudCB0byBjYXVzZSBvZmZlbnNlLicsXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IGZzLnJlYWRKc29uU3luYyhgJHtwcm9jZXNzLmN3ZCgpfS90ZXN0L291dHB1dC91cmJhbi5qc29uYClcbiAgICAgICAgZXhwZWN0KHN0ZG91dC5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpXFxzPy9nbSwgJ1xcbicpKS50by5tYXRjaCgvW2EtejAtOSBcXFtcXF3ihpJcXC5cXC9cXHNdKi9taWcpXG4gICAgICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShqc29uKSkudG8uZXF1YWxzKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgndmVyc2lvbicsICgpID0+IHtcbiAgICBpdCgncHJpbnRzIHRoZSB2ZXJzaW9uIG51bWJlcicsIChkb25lKSA9PiB7XG4gICAgICBjaGlsZC5leGVjKGBub2RlICR7cHJvY2Vzcy5jd2QoKX0vYnVpbGQvbGV4aW1hdmVuLmpzIC0tdmVyc2lvbmAsIChlcnIsIHN0ZG91dCkgPT4ge1xuICAgICAgICBleHBlY3Qoc3Rkb3V0KS50by5jb250YWluKHZlcnNpb24pXG4gICAgICAgIGRvbmUoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==

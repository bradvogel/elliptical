var chai = require('chai');
var expect = chai.expect;
var u = require('./util');

describe('fuzzy: phrase', function () {
  var parser;
  beforeEach(function () {
    parser = new u.lacona.Parser({fuzzy: 'phrase'});
  });

  describe('basic usage', function () {
    var test;

    beforeEach(function () {
      test = u.lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return u.lacona.literal({text: 'a simple test'});
        }
      });
    });

    it('supports fuzzy matching within a phrase', function (done) {
      function callback(data) {
        expect(data).to.have.length(3);
        expect(u.ft.suggestion(data[1].data)).to.equal('a simple test');
        expect(data[1].data.suggestion[0].string).to.equal('a');
        expect(data[1].data.suggestion[0].input).to.be.true;
        expect(data[1].data.suggestion[1].string).to.equal(' ');
        expect(data[1].data.suggestion[1].input).to.be.false;
        expect(data[1].data.suggestion[2].string).to.equal('s');
        expect(data[1].data.suggestion[2].input).to.be.true;
        expect(data[1].data.suggestion[3].string).to.equal('i');
        expect(data[1].data.suggestion[3].input).to.be.false;
        expect(data[1].data.suggestion[4].string).to.equal('m');
        expect(data[1].data.suggestion[4].input).to.be.true;
        expect(data[1].data.suggestion[5].string).to.equal('p');
        expect(data[1].data.suggestion[5].input).to.be.false;
        expect(data[1].data.suggestion[6].string).to.equal('l');
        expect(data[1].data.suggestion[6].input).to.be.true;
        expect(data[1].data.suggestion[7].string).to.equal('e ');
        expect(data[1].data.suggestion[7].input).to.be.false;
        expect(data[1].data.suggestion[8].string).to.equal('te');
        expect(data[1].data.suggestion[8].input).to.be.true;
        expect(data[1].data.suggestion[9].string).to.equal('st');
        expect(data[1].data.suggestion[9].input).to.be.false;
        done();
      }

      parser.sentences = [test()];
      u.toStream(['asmlte'])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });

    it('rejects misses properly with fuzzy matching', function (done) {
      function callback(data) {
        expect(data).to.have.length(2);
        done();
      }

      parser.sentences = [test()];
      u.toStream(['fff'])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });

    it('suggests properly when fuzzy matching is enabled', function (done) {
      function callback(data) {
        expect(data).to.have.length(3);
        expect(data[1].data.suggestion[0].string).to.equal('a simple test');
        expect(data[1].data.suggestion[0].input).to.be.false;
        expect(u.ft.suggestion(data[1].data)).to.equal('a simple test');
        done();
      }

      parser.sentences = [test()];
      u.toStream([''])
      .pipe(parser)
      .pipe(u.toArray(callback));
    });
  });

  it('can do fuzzy matching with regex special characters', function (done) {
    var test = u.lacona.createPhrase({
      name: 'test/test',
      describe: function () {
        return u.lacona.literal({text: '[whatever]'});
      }
    });

    function callback(data) {
      expect(data).to.have.length(3);
      expect(u.ft.suggestion(data[1].data)).to.equal('[whatever]');
      expect(data[1].data.suggestion[0].string).to.equal('[');
      expect(data[1].data.suggestion[0].input).to.be.true;
      expect(data[1].data.suggestion[1].string).to.equal('whatever');
      expect(data[1].data.suggestion[1].input).to.be.false;
      expect(data[1].data.suggestion[2].string).to.equal(']');
      expect(data[1].data.suggestion[2].input).to.be.true;
      done();
    }

    parser.sentences = [test()];
    u.toStream(['[]'])
    .pipe(parser)
    .pipe(u.toArray(callback));
  });

  describe('sequence', function () {
    var test;
    beforeEach(function () {
      test = u.lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return u.lacona.sequence({children: [
            u.lacona.literal({text: 'abc'}),
            u.lacona.literal({text: 'def'})
          ]});
        }
      });

    });

    it('supports sequence when fuzzy is enabled', function (done) {
      function callback(data) {
        expect(data).to.have.length(3);
        expect(u.ft.suggestion(data[1].data)).to.equal('def');
        expect(u.ft.match(data[1].data)).to.equal('abc');
        expect(data[1].data.suggestion[0].string).to.equal('d');
        expect(data[1].data.suggestion[0].input).to.be.false;
        expect(data[1].data.suggestion[1].string).to.equal('e');
        expect(data[1].data.suggestion[1].input).to.be.true;
        expect(data[1].data.suggestion[2].string).to.equal('f');
        expect(data[1].data.suggestion[2].input).to.be.false;
        done();
      }

      parser.sentences = [test()];
      u.toStream(['abce'])
        .pipe(parser)
        .pipe(u.toArray(callback));
    });

    it('rejects when the word itself does not complete the match', function (done) {
      function callback(data) {
        expect(data).to.have.length(2);
        done();
      }

      parser.sentences = [test()];
      u.toStream(['ad'])
        .pipe(parser)
        .pipe(u.toArray(callback));
    });
  });
});
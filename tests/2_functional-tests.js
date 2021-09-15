const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Routing Test', function() {

    // #1
    test('viewing one stock', function(done) {
      chai
      .request(server)
      .get('/api/stock-prices/')
      .query({stock: 'goog'})
      .end(function(error, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        done();
      });
    });

    // #2
    let likes;
    test('viewing one stock and liking it', function(done) {
      chai
      .request(server)
      .get('/api/stock-prices/')
      .query({stock: 'goog', like: 'true'})
      .end(function(error, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isAbove(res.body.stockData.likes, 0);

        likes = res.body.stockData.likes;
        done();
      });
    });

    // #3
    test('viewing the same stock and liking it again (1 like per IP)', function(done) {
      chai
      .request(server)
      .get('/api/stock-prices/')
      .query({stock: 'goog', like: 'true'})
      .end(function(error, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.equal(res.body.stockData.likes, likes);
        done();
      });
    });

    // #4
    test('viewing two stocks', function(done) {
      chai
      .request(server)
      .get('/api/stock-prices/')
      .query({stock: ['goog', 'msft']})
      .end(function(error, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'MSFT');
        assert.isAtMost(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 2);
        done();
      });
    });

    // #5
    test('viewing two stocks and liking them (1 like per IP)', function(done) {
      chai
      .request(server)
      .get('/api/stock-prices/')
      .query({stock: ['goog', 'msft'], like: 'true'})
      .end(function(error, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'MSFT');
        assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
        done();
      });
    });

  });
});

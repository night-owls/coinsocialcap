const cryptocurrencies = require('./route');

function initCryptocurrency(app) {
  app.use('/cc', cryptocurrencies);
}

module.exports = initCryptocurrency;

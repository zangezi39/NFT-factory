const routes = require('next-routes')();

routes
  
  .add('/:address/', '/index')
  .add('/:address/mint', '/mint')
  .add('/:address/info', '/info')
  .add('/:address/sell', '/sell')
  .add('/:address/transfer', '/transfer')
  .add('/:address/approve', '/approve')
  .add('/:address/burn', '/burn')
  .add('/:address/help', '/help')

module.exports = routes;

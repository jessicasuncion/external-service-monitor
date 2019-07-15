const express = require('express');
const router = express.Router();
const config = require('../config');
const request = require('request');
const loki = require('lokijs'), db = new loki('test.json');

const externalServices = db.addCollection('services');

manageExternalServices = () => {

  /**
   * Fetch all data by defined refresh rate
   */
  router.get('/', (req, res, next) => {
    setInterval(async () => {
      let tempConfig = config.services || [];
      await Promise.all(tempConfig.map(service => pingExternalService(service, true)));
    }, config.refreshRate); 
    res.status(200).send();
  });

  /**
   * GET all data for all external services
   */
  router.get('/services', async (req, res, next) => {
    let tempConfig = config.services || [];
    const requests = tempConfig.map(service => pingExternalService(service, false));
    await Promise.all(requests);
    res.send({ data: externalServices.data });
  });

  /**
   * GET current data for all external services
   */
  router.get('/services/current', async (req, res, next) => {
    let tempConfig = config.services || [];
    const requests = tempConfig.map(service => pingExternalService(service, false));
    const data = await Promise.all(requests);
    res.send({ data });
  });

  return router;
}

pingExternalService = (service, willUpdate) => {
  const { id, endpoint, name } = service;

  return new Promise((resolve) => {

    request.get({ url: endpoint, time: true }, (err, response, body) => {
      if (response) {
        const { statusCode, elapsedTime } = response;
        let data = { id, name, statusCode, elapsedTime, timestamp: new Date() };

        if (statusCode >= 200 && statusCode <= 300) {
          data.success = true;
        } else {
          data.success = false;
        }
        
        if (willUpdate) {
          externalServices.insert({ data });
        }
  
        resolve({ data });
      }
      resolve({data:{}});
    })
  });
}

module.exports = manageExternalServices;

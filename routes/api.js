'use strict';

const axios          = require('axios');
const connectDB      = require('../connect-db.js');
const {IPs, Stocks}  = require('../models/models.js');

// Connect db
connectDB();

// Functions
async function apiReq(url) {
  try {
    let request = await axios.get(url);
    let data = request.data;

    return data;
  } catch(error) {
    console.log(error.message);
  }
}

async function findStock(api, stock) {
  try {
    let dbStock = await Stocks.findOne({stock: stock.toUpperCase()}).exec();

    if (!dbStock) {
      let newStock = new Stocks({
        stock: api.symbol
      });

      let save = await newStock.save();
      dbStock = save;
    }

    return dbStock;
  } catch(error) {
    console.log(error.message);
  }
}

async function findIP(ip) {
  try {
    let dbIP = await IPs.findOne({ip: ip}).exec();

    if (!dbIP) {
      let newIP = new IPs({
        ip: ip
      });

      let save = await newIP.save();
      dbIP = save;
    }

    return dbIP;
  } catch(error) {
    console.log(error.message);
  }
}

// ---------- ---------- API routes ---------- ----------
module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function(req, res) {

      try {
        let {stock, like} = req.query;

        // Get stock symbol and price
        let dbStock = [];
        let price = [];

        if (!Array.isArray(stock)) {
          let url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;

          let apiData = await apiReq(url);
          
          dbStock.push(await findStock(apiData, stock));
          price.push(apiData.latestPrice);
        } else {
          for (let i = 0; i < stock.length; i++) {
            let url = (`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[i]}/quote`);

            let apiData = await apiReq(url);

            dbStock.push(await findStock(apiData, stock[i]));
            price.push(apiData.latestPrice);
          }
        }

        // Like the stock 
        if (like == 'true') {
          // Check ip
          let dbIP = await IPs.findOne({ip: req.ip}).exec();

          if (!dbIP) {
            let newIP = new IPs({
              ip: req.ip
            });

            let save = await newIP.save();
            dbIP = save;
          }

          // If not liked before, add 1 and push it to ip.liked
          for (let i = 0; i < dbStock.length; i++) {
            let liked = dbIP.liked.includes(dbStock[i]._id);

            if (!liked) {
              dbStock[i].likes = dbStock[i].likes + 1;
              dbIP.liked.push(dbStock[i]._id);

              await dbStock[i].save();
              await dbIP.save();
            }
          }
        }

        // Return json
        if (dbStock.length == 1) {
          return res.json({
            'stockData': {
              'stock': dbStock[0].stock,
              'price': price[0],
              'likes': dbStock[0].likes
            }
          });
        } else {
          let stockData = [];
          let likesDiff = dbStock[1].likes;
          
          for (let i = 0; i < dbStock.length; i++) {
            let result = {
              'stock': dbStock[i].stock,
              'price': price[i],
              'rel_likes': Math.abs(dbStock[i].likes - likesDiff)
            };

            likesDiff = dbStock[i].likes;
            stockData.push(result);
          }

          return res.json({
            'stockData': stockData
          });
        }
      } catch(error) {
        console.log(error.message);
      }

    })
    
};

'use strict'

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockSchema = new Schema({
  stock: {type: String, required: true},
  likes: {type: Number, default: 0}
});

const ipSchema = new Schema({
  ip: {type: String, required: true},
  liked: [{type: Schema.Types.ObjectId, ref: 'Stocks'}]
});

const Stocks = mongoose.model('Stocks', stockSchema);
const IPs = mongoose.model('IPs', ipSchema);

module.exports = {
  IPs: IPs,
  Stocks: Stocks
};

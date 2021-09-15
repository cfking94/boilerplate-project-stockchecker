'use strict'

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ipSchema = new Schema({
  ip: {type: String, required: true},
  liked: [{type: Schema.Types.ObjectId, ref: 'Stocks'}]
});

const stockSchema = new Schema({
  stock: {type: String, required: true},
  likes: {type: Number, default: 0}
});

const IPs = mongoose.model('IPs', ipSchema);
const Stocks = mongoose.model('Stocks', stockSchema);

module.exports = {
  IPs: IPs,
  Stocks: Stocks
};
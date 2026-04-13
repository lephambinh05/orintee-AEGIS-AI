import mongoose, { Schema, model, models } from 'mongoose';

const PriceCacheSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  price: {
    type: Number,
    required: true
  },
  change24h: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    expires: 10 // TTL index: expires after 10 seconds
  }
});

const PriceCache = models.PriceCache || model('PriceCache', PriceCacheSchema);

export default PriceCache;

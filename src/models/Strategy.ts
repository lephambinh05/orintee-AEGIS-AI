import mongoose, { Schema, model, models } from 'mongoose';

const StrategySchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    coinPair: {
      type: String,
      enum: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
      required: true
    },
    aegisScore: {
      type: Number,
      min: 0,
      max: 100,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      },
      required: true
    },
    entryPrice: {
      type: Number,
      required: true
    },
    stopLoss: {
      type: Number,
      required: true
    },
    takeProfit: {
      type: Number,
      required: true
    },
    isLong: {
      type: Boolean,
      required: true
    },
    position: {
      type: String,
      enum: ['Long', 'Short'],
      required: true,
      default: function(this: any) {
        return this.isLong ? 'Long' : 'Short';
      }
    },
    status: {
      type: String,
      enum: ['win', 'loss', 'pending'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound Index: { walletAddress: 1, createdAt: -1 }
StrategySchema.index({ walletAddress: 1, createdAt: -1 });

// Virtual for shortTxHash: returns "0x" + first6 + "..." + last4
StrategySchema.virtual('shortTxHash').get(function() {
  if (!this.txHash) return '';
  const hash = this.txHash.startsWith('0x') ? this.txHash : `0x${this.txHash}`;
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 4)}`;
});

// Sync position if isLong changes
StrategySchema.pre('save', async function() {
  this.position = this.isLong ? 'Long' : 'Short';
});

const Strategy = models.Strategy || model('Strategy', StrategySchema);

export default Strategy;

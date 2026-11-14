const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const statusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    required: true
  },
  changedById: Number,
  changedAt: { type: Date, default: Date.now },
  note: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  salesPersonId: Number,
  paymentMethod: { type: String, enum: ['CASH', 'CARD', 'TRANSFER'] },
  totals: {
    subtotal: { type: Number, min: 0, default: 0 },
    shipping: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  shippingAddress: {
    street: String,
    number: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  items: [itemSchema],
  statusHistory: [statusSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['SHIPPING', 'BILLING'], required: true },
  street: { type: String, required: true },
  number: String,
  city: { type: String, required: true },
  state: String,
  postalCode: String,
  country: { type: String, required: true }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  phone: String,
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalido']
  },
  addresses: [addressSchema]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
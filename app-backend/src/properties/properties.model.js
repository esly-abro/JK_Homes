const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['Villa', 'Apartment', 'Plot', 'Commercial', 'Penthouse', 'Studio', 'Duplex', 'Other']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  size: {
    value: Number,
    unit: {
      type: String,
      default: 'sqft'
    }
  },
  bedrooms: Number,
  bathrooms: Number,
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved', 'Under Construction'],
    default: 'Available'
  },
  images: [{
    url: String,
    caption: String
  }],
  description: {
    type: String,
    trim: true
  },
  interestedLeadsCount: {
    type: Number,
    default: 0
  },
  amenities: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
propertySchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Property', propertySchema);

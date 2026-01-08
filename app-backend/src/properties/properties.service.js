const Property = require('./properties.model');

class PropertiesService {
  async getAllProperties(filters = {}) {
    try {
      const query = {};
      
      // Apply filters
      if (filters.propertyType) {
        query.propertyType = filters.propertyType;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }
      if (filters.minPrice) {
        query['price.min'] = { $gte: parseInt(filters.minPrice) };
      }
      if (filters.maxPrice) {
        query['price.max'] = { $lte: parseInt(filters.maxPrice) };
      }

      const properties = await Property.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      
      return properties;
    } catch (error) {
      console.error('Get properties error:', error);
      throw error;
    }
  }

  async getPropertyById(id) {
    try {
      const property = await Property.findById(id)
        .populate('createdBy', 'name email');
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      return property;
    } catch (error) {
      console.error('Get property by ID error:', error);
      throw error;
    }
  }

  async createProperty(propertyData, userId) {
    try {
      const property = new Property({
        ...propertyData,
        createdBy: userId
      });
      
      await property.save();
      return property;
    } catch (error) {
      console.error('Create property error:', error);
      throw error;
    }
  }

  async updateProperty(id, updates) {
    try {
      const property = await Property.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      return property;
    } catch (error) {
      console.error('Update property error:', error);
      throw error;
    }
  }

  async deleteProperty(id) {
    try {
      const property = await Property.findByIdAndDelete(id);
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      return { message: 'Property deleted successfully' };
    } catch (error) {
      console.error('Delete property error:', error);
      throw error;
    }
  }

  async incrementInterestedCount(propertyId) {
    try {
      const property = await Property.findByIdAndUpdate(
        propertyId,
        { $inc: { interestedLeadsCount: 1 } },
        { new: true }
      );
      return property;
    } catch (error) {
      console.error('Increment interested count error:', error);
      throw error;
    }
  }

  async decrementInterestedCount(propertyId) {
    try {
      const property = await Property.findByIdAndUpdate(
        propertyId,
        { $inc: { interestedLeadsCount: -1 } },
        { new: true }
      );
      return property;
    } catch (error) {
      console.error('Decrement interested count error:', error);
      throw error;
    }
  }
}

module.exports = new PropertiesService();

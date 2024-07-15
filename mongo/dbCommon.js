const mongoose = require('mongoose');


const connectDB = (ConnectionString) => {
    return mongoose.connect(ConnectionString)
                   .then(() => console.log('MongoDB connected'))
                   .catch(err => console.error('MongoDB connection error:', err));
}

const defineModel = (modelName, schemaDefinition) => {
    const schema = new mongoose.Schema(schemaDefinition);
    return mongoose.model(modelName, schema);
  };

const addNewRecord = (model, data) => {
    return new Promise((resolve, reject) => {
      const record = new model(data);
      record.save()
        .then(savedRecord => resolve(savedRecord))
        .catch(err => reject(err));
    });
}

const findById = (model, id) => {
    return model.findById(id).exec()
      .then(document => {
        if (!document) {
          throw new Error(`Document with ID ${id} not found`);
        }
        return document;
      })
      .catch(error => {
        console.error(`Error finding document by ID ${id}:`, error);
        throw error;
      });
}

const findByFields = (model, query, projection = {}, options = {}) => {
    return model.find(query, projection, options).exec()
      .then(results => {
        return results;
      })
      .catch(error => {
        console.error(`Error finding documents with query ${JSON.stringify(query)}:`, error);
        throw error;
      });
}

const findByIdAndInsert = (model, id, arrayField, value, options = {new: true}) => {
  return model.findByIdAndUpdate(
    id,
    { $push: { [arrayField]: value } },
    options
  ).exec()
  .then(updatedDocument => {
    return updatedDocument;
  })
  .catch(error => {
    console.error(`Error pushing value into array field '${arrayField}' for document with ID ${id}:`, error);
    throw error;
  });
}

module.exports = {
    connectDB,
    defineModel,
    findById,
    addNewRecord,
    findByFields,
    findByIdAndInsert
  };
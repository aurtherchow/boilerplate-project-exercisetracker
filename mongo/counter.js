const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const getNextSequenceValue = (sequenceName) => {
    return new Promise((resolve, reject) => {
        Counter.findOneAndUpdate(
            { _id: sequenceName },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        )
        .then(sequenceDocument => {
            resolve(sequenceDocument.sequence_value);
        })
        .catch(err => {
            reject(err);
        });
    });
}

module.exports = {
    getNextSequenceValue,
};
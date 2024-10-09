const { Schema, model } = require('mongoose');

const ChallengeSchema = Schema({
    users: [{ username: String, id: { type: Schema.Types.ObjectId, ref: 'user' } }],
    count: Number,
    lenguaje: String,
    topics: [String],
    time: Number,
    level: String,
    code: String,
    bet: String
}, {
    timestamps: true
})

module.exports = model('challenge', ChallengeSchema)
const { Schema, model, default: mongoose } = require('mongoose');
const ChallengeSchema = Schema({
    title: String,
    description: String,
    format_input: String,
    format_output: String,
    restriction: String,
    example_input: String,
    example_output: String,
    explanation: String,
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    lenguaje: String,
    challenge: { type: Schema.Types.ObjectId, ref: 'challenge' },
    score: Number,
    finished: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = model('task', ChallengeSchema)
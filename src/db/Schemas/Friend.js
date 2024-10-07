const { Schema, model } = require('mongoose');

const FriendSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    friend: { type: Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, {
    timestamps: true
})

module.exports = model('friends', FriendSchema)
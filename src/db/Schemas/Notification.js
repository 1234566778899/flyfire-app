const { Schema, model, default: mongoose } = require('mongoose');

const NotificationSchema = Schema({
    from: { type: Schema.Types.ObjectId, ref: 'user' },
    to: { type: Schema.Types.ObjectId, ref: 'user' },
    type: String,
    seen: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = model('notification', NotificationSchema)
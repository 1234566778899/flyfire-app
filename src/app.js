const express = require('express')
const app = express();
const cors = require('cors');
const server = require('http').createServer(app);

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://flyfar-liard.vercel.app'],
    credentials: true
}));

require('./db/index')
require('./socket.js')(server);

const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => {
    res.send('v.1.0.13')
})

app.use('/challenge', require('./routes/Challenge.js'));
app.use('/users', require('./routes/User'));
app.use('/friends', require('./routes/Friend'));
app.use('/results', require('./routes/Result.js'));
app.use('/notifications', require('./routes/Notification.js'));
app.use('/tasks', require('./routes/Task.js'));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

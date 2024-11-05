const express = require('express');
const { sendRequest, getFriends, changeStatus, deleteFriend } = require('../controllers/Friend');
const router = express.Router();

router.post('/send_request', sendRequest);
router.get('/retrieve/:id', getFriends);
router.post('/change_status', changeStatus);
router.delete('/:id', deleteFriend);

module.exports = router;
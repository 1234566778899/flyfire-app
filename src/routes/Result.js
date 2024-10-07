const express = require('express');
const { addResult, getSubmissions, getCurrentRanking, generalRanking, getSubmissionsByTask, addOneResult, getCountTaksWeek, getScore } = require('../controllers/Result');
const router = express.Router();

router.post('/register', addResult);
router.post('/retrieve', getSubmissions);
router.get('/ranking/:id', getCurrentRanking);
router.get('/ranking', generalRanking);
router.get('/task/:taskId', getSubmissionsByTask);
router.post('/add', addOneResult);
router.get('/count_week/:id', getCountTaksWeek);

module.exports = router;
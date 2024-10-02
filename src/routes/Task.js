const express = require('express');
const { getTask, finishTask, tasksPending } = require('../controllers/Task');
const router = express.Router();

router.get('/:id', getTask);
router.put('/:id', finishTask);
router.get('/pending/:user', tasksPending);

module.exports = router;
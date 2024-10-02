const Task = require("../db/Schemas/Task");

const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id });
        return res.status(200).send(task);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ ok: 'Successful' });
    }
}
const finishTask = async (req, res) => {
    try {
        const { id } = req.params;
        await Task.findOneAndUpdate({ _id: id }, { finished: true });
        return res.status(200).send({ ok: 'Succesful' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ ok: 'Successful' });
    }
}
const tasksPending = async (req, res) => {
    try {
        const { user } = req.params;
        const tasks = await Task.find({ user, finished: false, score: { $lt: 20 } })
        res.status(200).send(tasks);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
module.exports = {
    getTask,
    finishTask,
    tasksPending
}
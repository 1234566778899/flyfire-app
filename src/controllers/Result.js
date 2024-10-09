const { OpenAI } = require('openai');
const Result = require('../db/Schemas/Result');
const Challenge = require('../db/Schemas/Challenge');
const Task = require('../db/Schemas/Task');
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.API_KEY
});


const addResult = async (req, res) => {
    try {
        const { user, task, challenge, title, lenguaje, result, time } = req.body;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente IA que evalua una respuesta de programación, la pregunta es la siguiente: ${JSON.stringify(task)} y la respuesta es ${JSON.stringify(result)}. Debes asignar un puntaje del 1 al 20 de acuerda a la respuesta, si cumple con todos lo requerido entonces se asigna un 20, sino hay nada, tiene un 0, y otro valor de acuerdo al porcentaje de avance. Da como respuesta solo un json con la siguiente estructura: {score:Number,comment:String}.`
                },
                {
                    role: "user",
                    content: "Evalua la respuesta"
                }
            ],
            temperature: 1
        })
        const text = completion.choices[0].message.content;
        const jsonResponse = text.match(/\{.*\}/s);
        const { score, comment } = JSON.parse(jsonResponse);
        //const { score, comment } = { score: Math.floor(Math.random() * 21), comment: 'Todo bien xd' };
        const data = { user, task: task._id, challenge, score, time, title, lenguaje, comment }
        const resp = new Result(data);
        await resp.save();
        return res.status(200).send({ score });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
}
const addOneResult = async (req, res) => {
    try {
        const { user, task, title, lenguaje, challenge, result, time } = req.body;
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente IA que evalua una respuesta de programación, la pregunta es la siguiente: ${JSON.stringify(task)} y la respuesta es ${JSON.stringify(result)}. Debes asignar un puntaje del 1 al 20 de acuerda a la respuesta, si cumple con todos lo requerido entonces se asigna un 20, sino hay nada, tiene un 0, y otro valor de acuerdo al porcentaje de avance. Da como respuesta solo un json con la siguiente estructura: {score:Number,comment:String}.`
                },
                {
                    role: "user",
                    content: "Evalua la respuesta"
                }
            ],
            temperature: 1
        })
        const text = completion.choices[0].message.content;
        const jsonResponse = text.match(/\{.*\}/s);
        const { score, comment } = JSON.parse(jsonResponse);
        const data = { user, task: task._id, score, title, lenguaje, challenge, time, comment }
        const resp = new Result(data);
        await resp.save();
        const resps = await Result.find({ task: task._id });
        const scoreMax = Math.max(...resps.map(x => x.score), Number(score));
        await Task.findOneAndUpdate({ _id: task._id }, { score: scoreMax });
        return res.status(200).send({ score });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
const getSubmissions = async (req, res) => {
    try {
        const { user, challenge } = req.body;
        const results = await Result.find({ user, challenge });
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
}
const getSubmissionsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const results = await Result.find({ task: taskId });
        res.status(200).send(results);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
}
const getCurrentRanking = async (req, res) => {
    try {
        const { id } = req.params;
        const challengeFound = await Challenge.findOne({ _id: id }).populate("users.id");
        const tasksInChallenge = await Task.find({ challenge: id });
        const allResults = await Result.find({ challenge: id });
        if (allResults.length <= 0) {
            return res.status(200).send([]);
        }
        const usersInChallenge = challengeFound.users;
        const ranking = usersInChallenge.map(user => {
            const userResults = allResults.filter(result => result.user._id.toString() === user.id.toString());
            let total = 0;
            let t = 0;
            const tasks = tasksInChallenge.map(task => {
                const resultForTask = userResults.filter(result => result.task.toString() === task._id.toString());
                if (resultForTask.length > 0) {
                    const last = resultForTask[resultForTask.length - 1];
                    total += last.score;
                    t += last.time;
                    return {
                        ended: true,
                        score: last.score,
                        time: last.time
                    };
                } else {
                    return {
                        ended: false
                    };
                }
            });
            return { user: user.username, photo: user.id.photo || '', tasks, solved: tasks.filter(x => x.ended).length, total, time: t };
        });
        ranking.sort((a, b) => b.total - a.total);
        res.status(200).send(ranking);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};
const getCountTaksWeek = async (req, res) => {
    try {
        const { id } = req.params;
        const lastWeekEpoch = new Date().valueOf() - 7 * 24 * 1000 * 3600;
        const lastWeek = new Date(lastWeekEpoch);
        const tasks = await Task.find({ user: id, score: 20, updatedAt: { $gte: lastWeek } });
        const [result] = await Result.aggregate([{ $match: { user: new mongoose.Types.ObjectId(id) } }, { $group: { _id: null, total: { $sum: "$score" } } }])
        return res.status(200).send({ count: tasks.length, score: (result && result.total) || 0 });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}
const generalRanking = async (req, res) => {
    try {
        const ranking = await Result.aggregate([
            {
                $group: {
                    _id: "$user",
                    averageScore: { $sum: "$score" }
                }
            },
            {
                $sort: { averageScore: -1 }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    averageScore: 1,
                    "userDetails.username": 1,
                    "userDetails.email": 1,
                    "userDetails.name": 1,
                    "userDetails.lname": 1,
                    "userDetails.createdAt": 1,
                }
            }
        ]);
        return res.status(200).send(ranking)
    } catch (error) {
        console.log(error);
        return res.status(200).send({ error: 'Error on server' });
    }
}

module.exports = {
    addResult,
    getSubmissions,
    getCurrentRanking,
    generalRanking,
    getSubmissionsByTask,
    addOneResult,
    getCountTaksWeek,
}

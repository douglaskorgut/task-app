const express = require('express');
const router  = new express.Router();
require('../db/mongoose');
const Task = require ('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks',auth, async (req, res) => {

    try {
        // const task = new Task(req.body);

        const task = new Task({
            ...req.body,
            owner: req.user._id
        });

        await task.save();

        res.status(201).send(task);

    } catch (error) {
        res.status(400).send(error);
    }

});


router.get('/tasks', auth, async (req,res) => {
    try {
        let searchObject = {};
        searchObject['owner'] = req.user._id;

        if (req.query.completed === 'true') {
            searchObject['completed'] = true
        } else if (req.query.completed === 'false') {
            searchObject['completed'] = false
        }

        // const tasks = await Task.find({});
        const tasks = await Task.find(searchObject);
        res.status(200).send(tasks);
    } catch (e) {
        res.status(400).send(e);
    }

});

router.get('/tasks/:id',auth, async (req,res)=>{
    try {
        const _id = req.params.id;

        const foundTask = await Task.findOne({_id, owner: req.user._id});

        if (!foundTask) { res.status(404).send() }

        res.status(200).send(foundTask);
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
});

router.patch('/tasks/:id',auth, async (req,res) =>{
    try {
        const _id = req.params.id;
        const updates = Object.keys(req.body);
        const allowedUpdates = ['description', 'completed'];

        const isUpdateAllowed = updates.every(update => { return allowedUpdates.includes(update) });

        if (!isUpdateAllowed){ res.status(400).send({error: 'Received property cant be updated'}); }

        // const updatedTask = await Task.findById(_id);

        const updatedTask = await Task.findOne({_id: req.params.id, owner: req.user._id});

        updates.forEach((update)=> updatedTask[update] = req.body[update] );

        // const updatedTask = await Task.findByIdAndUpdate(_id, req.body,{new: true, runValidation: true});

        if (!updatedTask){ res.status(404).send({error:'Task not found!'}) }

        updatedTask.save()

        res.status(200).send(updatedTask);

    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/tasks/:id',auth, async (req,res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) { res.status(404).send({error:'Task not found!'})}

        res.status(200).send(task);

    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
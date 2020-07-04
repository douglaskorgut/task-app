const express = require('express');
const router  = new express.Router();
require('../db/mongoose');
const User = require ('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendGoodByeEmail } = require('../emails/account');

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('Please upload a valid image'));
        }

        callback(undefined,true);

    }
});

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req,res)=> {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token  = await user.generateAuthToken();
        res.send({user,token})
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.post('/users/logout',auth, async (req,res)=>{
     try {
         // return new array of valid logged tokens - received token
         req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
         });

         await req.user.save();
         
         res.status(200).send(req.user)
     } catch (e) {
         res.status(500).send({error: "Error logging user out!"})
     }

});

router.post('/users/logout-all',auth, async(req,res)=>{
    try {
        req.user.tokens = [];

        await req.user.save();
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send({error: e.message})
    }
});

router.get('/users/me', auth ,async (req,res)=>{
    res.send(req.user)
});

router.delete('/users/me',auth, async (req,res)=>{
    try {
        await req.user.remove();
        await sendGoodByeEmail(req.user.email,req.user.name);
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
});

router.patch('/users/me', auth, async (req,res)=>{
    const allowedUpdate = ['name', 'age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update)=>{ return allowedUpdate.includes(update); });

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update property'});
    }

    try {

        updates.forEach((update)=>{
            req.user[update] = req.body[update];
        });

        // console.log(req.user)
        await req.user.save();

        // const user = await User.findByIdAndUpdate(_id,req.body,{ new: true, runValidation: true });

        // if (!user) { return res.status(404).send() }
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e);
    }

});

router.post('/users/me/avatar',auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    try {
        req.user.avatar = buffer;
        console.log(req.user.avatar);
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(400).send({error: e.message});;
    }

},(error,req,res,next) =>{
    res.status(400).send({error: error.message})
});

router.delete('/users/me/avatar',auth,async (req,res,next) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send({message:'Avatar removed successfully'});
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send()
    }
});

module.exports = router;
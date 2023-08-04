const express = require('express')
const router = express.Router()

const Group = require('../models/Group')

router.get('/groups', async (req,res) =>{
    try{
        let groups = await Group.find({})
        return res.status(200).json(groups)
    }catch (error){
        return res.status(500).json([])
    }
})

router.post('/groups', async (req,res) =>{
    try{
        const { name, notice, text } = req.body
        let group = new Group({ name, notice, text })
        await group.save()
        return res.status(200).json(group)
    }catch (error){
        return res.status(500).send("Internal Server Error")
    }
})


router.delete('/groups/:id', async (req,res) =>{
    try{
        await Group.findOneAndDelete({ _id: req.params.id })
        return res.status(200).send("Deleted")
    }catch (error){
        return res.status(500).send("Internal Server Eror")
    }
})

router.put('/groups/:id', async (req,res) =>{
    try{
        const { name, notice, text } = req.body
        await Group.findOneAndUpdate({ _id: req.params.id },{
            name, notice, text
        },{ $new: true })

        return res.status(200).send("Updated")
    }catch (error){
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router
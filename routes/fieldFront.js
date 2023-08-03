const express = require('express')
const router = express.Router()
const axios = require('axios')

router.get('/fields',async (req,res) =>{
    try{
        const response = await axios.get('http://localhost:3000/api/formFields')
        const fields = response.data

        return res.render('fields/index',{
            formFields: fields
        })
    }catch (error){
        return res.render('errors/internal',{
            error:error.message
        })
    }
})
const Group = require('../models/Group')
router.get('/fields/create',async (req,res) =>{
    let groups = await Group.find({})
    return res.render('fields/create',{
        groups: groups
    })
})

const Field = require('../models/FormField')
router.get('/fields/:id/update', async (req,res) => {
    try{
        let formField = await Field.findOne({_id:req.params.id})
        return res.status(200).render('fields/edit',{
            formField
        })
    }catch (error){
        return res.status(500).send(error.message)
    }
})

module.exports = router
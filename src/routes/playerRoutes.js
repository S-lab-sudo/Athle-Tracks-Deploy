const router = require('express').Router();
const PlayerModel = require('../models/playerModel');

const {getAllPlayers, getPlayerById}=require('../controllers/playerController')


router.get('/getAllPlayers',getAllPlayers)
router.get('/getPlayerById/:id',getPlayerById)

module.exports=router
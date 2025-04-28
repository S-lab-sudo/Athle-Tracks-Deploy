const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createTeamStep1, addCoachDetails, addSinglePlayerToTeam, getTeam, getTeams, updateTeam, deleteTeam,getTeamNames } = require('../controllers/teamController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create-team-step-1', upload.single('logo'), createTeamStep1);
router.post('/add-coach-details', upload.single('coachImage'), addCoachDetails);
router.post('/add-single-player-to-team', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), addSinglePlayerToTeam);
router.get('/teams', getTeams);
router.get('/team/:id', getTeam);
router.put('/team/:id', upload.array('files'), updateTeam);
router.delete('/team/:id', deleteTeam);
router.post('/get-team-names',getTeamNames)

module.exports = router;
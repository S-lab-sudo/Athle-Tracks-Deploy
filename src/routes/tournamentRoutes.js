const express = require('express');
const multer = require('multer');
const { createTournament, updateTournament, deleteTournament, getTournaments, getTournamentById, getTournamentAdmin, assignTeamToTournament, createMatchAndSaveToTournament } = require('../controllers/tournamentController');
const { authenticateSuperAdmin, authenticateAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create-tournament', authenticateAdmin, upload.fields([{ name: 'posterImage', maxCount: 1 }, { name: 'organizerImage', maxCount: 1 }]), createTournament);
router.put('/:id', upload.fields([{ name: 'posterImage', maxCount: 1 }, { name: 'organizerImage', maxCount: 1 }]), updateTournament);
router.delete('/:id', authenticateSuperAdmin, deleteTournament);
router.get('/admin-tournaments', getTournamentAdmin);
router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.post('/assign-team-to-tournament', assignTeamToTournament);
router.post('/create-match-and-save-to-tournament', createMatchAndSaveToTournament);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch
} = require('../controllers/matchController');

// Route to get all matches
router.get('/matches', getAllMatches);

// Route to get a single match by ID
router.get('/matches/:id', getMatchById);

// Route to update a match by ID
router.post('/match/update', updateMatch);

// Route to delete a match by ID
router.delete('/matches/:id', deleteMatch);

module.exports = router;
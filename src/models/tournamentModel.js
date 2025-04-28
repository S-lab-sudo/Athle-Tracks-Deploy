const mongoose = require('mongoose');

const prizePoolSchema = new mongoose.Schema({
    firstPrize: {
        type: String,
        required: true
    },
    secondPrize: {
        type: String,
        required: true
    },
    thirdPrize: {
        type: String,
        required: true
    },
    mvp: {
        type: String,
        required: true
    },
    entryFee: {
        type: String,
        required: true
    },
});

const organizerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
});

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }],
    posterImage: {
        type: String,
        required: true
    },
    organizer: {
        type: organizerSchema,
        required: true
    },
    prizePool: {
        type: prizePoolSchema,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    registeringStartDate: {
        type: Date,
        required: true
    }
});

const TournamentModel = mongoose.model('Tournament', tournamentSchema);

module.exports = TournamentModel;
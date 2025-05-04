const mongoose = require('mongoose');

const playerStatsSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    team_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    notplayed: {
        type: String,
        required: true,
        default:"DNP",
    },
    points: {
        type: Number,
        required: true
    },
    assists: {
        type: Number,
        required: true
    },
    rebounds: {
        type: Number,
        required: true
    }
});

const matchSchema = new mongoose.Schema({
    tournament_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    team_1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    team_2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    team_1_score: {
        type: Number,
    },
    team_2_score: {
        type: Number,
    },
    time: {
        type: String,
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    mvp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
    },
    player_stats: [playerStatsSchema],
    location: {
        type: String,
    }
});

const MatchModel = mongoose.model('Match', matchSchema);

module.exports = MatchModel;
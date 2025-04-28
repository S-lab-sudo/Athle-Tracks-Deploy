const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    // Team Details
    team_details: {
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        origin: {
            type: String,
            required: true
        },
        total_matches: {
            type: Number,
            default: 0
        },
        matches_won: {
            type: Number,
            default: 0
        },
        matches_lost: {
            type: Number,
            default: 0
        },
        total_points_scored: {
            type: Number,
            default: 0
        },
        match_history: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        }],
        teamPrimaryNumber:{
            type:Number,
            required:true
        }
    },
    
    // Coach Details
    coach: {
        name: {
            type: String
        },
        phone_number: {
            type: String
        },
        contact_number_2: {
            type: String
        },
        image: {
            type: String
        }
    },
    
    // Player Details
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }]
});

const TeamModel = mongoose.model('Team', teamSchema);

module.exports = TeamModel;
const mongoose = require("mongoose");

const matchHistorySchema = new mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  tournament_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required:true
  },
  points_scored: {
    type: Number,
    default:0
  },
  assists: {
    type: Number,
    default:0
  },
  rebounds: {
    type: Number,
    default:0
  },
});

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  jerseyNumber: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  age:{
    type: Number,
    required: true,
  },
  document:{
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true,
  },
  total_points: {
    type: Number,
    default: 0,
  },
  total_assists: {
    type: Number,
    default: 0,
  },
  total_rebounds: {
    type: Number,
    default: 0,
  },
  match_history: [matchHistorySchema],
});

const PlayerModel = mongoose.model("Player", playerSchema);

module.exports = PlayerModel;

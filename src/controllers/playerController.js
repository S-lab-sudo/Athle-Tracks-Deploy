const Player = require("../models/playerModel");

const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate({
        path: "match_history.match_id",
        select: "date team_1 team_2 tournament_id",
        populate: [
          {
            path: "team_1 team_2",
            select: "team_details.name",
            model: "Team"
          },
          {
            path: "tournament_id",
            select: "name",
            model: "Tournament"
          }
        ]
      })
      .select('name image jerseyNumber total_points total_assists total_rebounds match_history age height weight')
      .lean();

    if (!player) return res.status(404).json({ message: "Player not found" });
    
    res.status(200).json(player);
  } catch (error) {
    console.error('Error in getPlayerById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = {
  getAllPlayers,
  getPlayerById,
  // Add other player-related functions here
};

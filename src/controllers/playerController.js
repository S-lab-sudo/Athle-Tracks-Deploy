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
    const { id } = req.params;
    const player = await Player.findById(id)
      .populate({
        path: "match_history.match_id",
        populate: [
          {
            path: "team_1",
            model: "Team", // Ensure this matches your registered Team model name
            select: "team_details", // Ensure these fields exist in the Team schema
          },
          {
            path: "team_2",
            model: "Team",
            select: "team_details",
          },
          {
            path: "tournament_id",
            model: "Tournament",
            select: "name",
          },
        ],
      })
      .lean();

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  // Add other player-related functions here
};

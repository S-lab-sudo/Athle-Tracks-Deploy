const MatchModel = require("../models/matchModel");
const TeamModel = require("../models/teamModel");
const TournamentModel = require("../models/tournamentModel");
const PlayerModel = require("../models/playerModel");

// Get all matches (Optimized with population and projection)
const getAllMatches = async (req, res) => {
  try {
    const matches = await MatchModel.find()
      .populate([
        {
          path: "team_1",
          select: "team_details.name players",
          populate: { path: "players", select: "name position" },
        },
        {
          path: "team_2",
          select: "team_details.name players",
          populate: { path: "players", select: "name position" },
        },
        {
          path: "tournament_id",
          select: "name",
        },
      ])
      .lean();

    const matchDetails = matches.map((match) => ({
      matchId: match._id,
      date: match.date,
      team1Id: match.team_1?._id,
      team2Id: match.team_2?._id,
      playerStats: match.player_stats,
      team1Name: match.team_1?.team_details.name || "Team not found",
      team2Name: match.team_2?.team_details.name || "Team not found",
      tournamentName: match.tournament_id?.name || "Tournament not found",
      team1Players: match.team_1?.players || [],
      team2Players: match.team_2?.players || [],
    }));

    res.status(200).json(matchDetails);
  } catch (error) {
    console.error("Error in getAllMatches:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single match by ID (Optimized with combined population)
const getMatchById = async (req, res) => {
  try {
    const match = await MatchModel.findById(req.params.id)
      .populate([
        {
          path: "team_1",
          select: "team_details.name team_details.logo players",
          populate: { path: "players", select: "name jerseyNumber" },
        },
        {
          path: "team_2",
          select: "team_details.name team_details.logo players",
          populate: { path: "players", select: "name jerseyNumber" },
        },
        {
          path: "tournament_id",
          select:
            "name startDate endDate teams matches posterImage organizer prizePool location registeringStartDate league",
        },
        {
          path: "player_stats.player_id",
          select: "image jerseyNumber name",
        },
        {
          path: "player_stats.team_id",
          select: "team_details.name",
        },
      ])
      .lean();

    if (!match) return res.status(404).json({ message: "Match not found" });

    // Calculate scores
    const team1Score = match.player_stats
      .filter(
        (stat) => stat.team_id._id.toString() === match.team_1._id.toString()
      )
      .reduce((sum, stat) => sum + stat.points, 0);

    const team2Score = match.player_stats
      .filter(
        (stat) => stat.team_id._id.toString() === match.team_2._id.toString()
      )
      .reduce((sum, stat) => sum + stat.points, 0);

    // Transform player stats
    // Modify the player_stats transformation to keep team IDs
    const transformedStats = match.player_stats.map((stat) => ({
      ...stat,
      player_id: {
        _id: stat.player_id._id,
        image: stat.player_id.image,
        jerseyNumber: stat.player_id.jerseyNumber,
        name: stat.player_id.name,
      },
      // Keep team ID instead of name for frontend calculations
      team_id: stat.team_id._id,
    }));

    const response = {
      ...match,
      team1Score,
      team2Score,
      player_stats: transformedStats,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getMatchById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update match (Optimized with parallel processing and bulk operations)
const updateMatch = async (req, res) => {
  try {
    const { matchId, team1Players, team2Players } = req.body;
    const match = await MatchModel.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Create map for quick player stat lookups
    const statsMap = new Map(
      match.player_stats.map((stat) => [stat.player_id.toString(), stat])
    );

    // Process teams in parallel
    await Promise.all([
      processTeam(team1Players, match.team_1, statsMap),
      processTeam(team2Players, match.team_2, statsMap),
    ]);

    // Convert map back to array
    match.player_stats = Array.from(statsMap.values());
    match.winner =
      match.team_1_score > match.team_2_score ? match.team_1 : match.team_2;

    await match.save();
    res.status(200).json({ message: "Stats updated successfully", match });
  } catch (error) {
    console.error("Error in updateMatch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to process team players
const processTeam = async (players, teamId, statsMap) => {
  const playerUpdates = players.map(
    async ({ playerId, points = 0, assists = 0, rebounds = 0, notplayed }) => {
      const player = await PlayerModel.findById(playerId);
      if (!player) return;

      // Update player totals
      player.total_points += points;
      player.total_assists += assists;
      player.total_rebounds += rebounds;

      // Update match history
      const historyIndex = player.match_history.findIndex(
        (h) => h.match_id.toString() === matchId
      );

      if (historyIndex > -1) {
        const history = player.match_history[historyIndex];
        history.points_scored += points;
        history.assists += assists;
        history.rebounds += rebounds;
        history.notplayed = notplayed;
      } else {
        player.match_history.push({
          match_id: matchId,
          tournament_id: match.tournament_id,
          team_id: teamId,
          points_scored: points,
          assists,
          rebounds,
          notplayed,
        });
      }

      // Update match stats
      const statKey = playerId.toString();
      const existingStat = statsMap.get(statKey);

      if (existingStat) {
        existingStat.points += points;
        existingStat.assists += assists;
        existingStat.rebounds += rebounds;
        existingStat.notplayed = notplayed;
      } else {
        statsMap.set(statKey, {
          player_id: playerId,
          team_id: teamId,
          points,
          assists,
          rebounds,
          notplayed,
        });
      }

      await player.save();
    }
  );

  await Promise.all(playerUpdates);
};

// Delete match (Optimized with early return)
const deleteMatch = async (req, res) => {
  try {
    const match = await MatchModel.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteMatch:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
};

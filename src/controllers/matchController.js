const MatchModel = require('../models/matchModel');
const TeamModel =require('../models/teamModel')
const TournamentModel =require('../models/tournamentModel')
const PlayerModel = require('../models/playerModel');
// Get all matches
const getAllMatches = async (req, res) => {
  try {
    const matches = await MatchModel.find();

    const matchDetails = await Promise.all(matches.map(async (match) => {
      let team1 = await TeamModel.findById(match.team_1).populate('players');
      let team2 = await TeamModel.findById(match.team_2).populate('players');
      const tournament = await TournamentModel.findById(match.tournament_id);

      return {
        matchId: match._id,
        date: match.date,
        team1Id: match.team_1,
        team2Id: match.team_2,
        playerStats: match.player_stats,
        team1Name: team1 ? team1.team_details.name : 'Team not found',
        team2Name: team2 ? team2.team_details.name : 'Team not found',
        tournamentName: tournament ? tournament.name : 'Tournament not found',
        team1Players: team1 ? team1.players : [],
        team2Players: team2 ? team2.players : []
      };
    }));

    res.status(200).json(matchDetails);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

// Get a single match by ID
const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await MatchModel.findById(id).populate('team_1 team_2 tournament_id');
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json(match);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a match
const updateMatch = async (req, res) => {
  try {
    const { matchId, team1Players, team2Players } = req.body;

    // 1. Get the match with current stats
    const match = await MatchModel.findById(matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    // 2. Process players with simple increment/decrement
    const processTeam = async (players, teamId) => {
      for (const player of players) {
        const { playerId, points = 0, assists = 0, rebounds = 0 } = player;

        // Update player totals
        const playerDoc = await PlayerModel.findById(playerId);
        if (!playerDoc) continue;

        // Simple increment/decrement for totals
        playerDoc.total_points += points;
        playerDoc.total_assists += assists;
        playerDoc.total_rebounds += rebounds;

        // Update match history
        let history = playerDoc.match_history.find(h => 
          h.match_id.toString() === matchId
        );
        
        if (history) {
          history.points_scored += points;
          history.assists += assists;
          history.rebounds += rebounds;
        } else {
          playerDoc.match_history.push({
            match_id: matchId,
            tournament_id: match.tournament_id,
            team_id: teamId,
            points_scored: points,
            assists: assists,
            rebounds: rebounds
          });
        }
        await playerDoc.save();

        // Update match player stats
        const matchStat = match.player_stats.find(ps => 
          ps.player_id.toString() === playerId.toString()
        );
        
        if (matchStat) {
          // Increment/decrement existing stats
          matchStat.points += points;
          matchStat.assists += assists;
          matchStat.rebounds += rebounds;
        } else {
          // Create new stats entry
          match.player_stats.push({
            player_id: playerId,
            team_id: teamId,
            points: points,
            assists: assists,
            rebounds: rebounds
          });
        }
      }
    };

    // 3. Process both teams
    await processTeam(team1Players, match.team_1);
    await processTeam(team2Players, match.team_2);

    // 4. Save and return updated match
    await match.save();
    res.status(200).json({ message: 'Stats updated successfully', match });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a match by ID
const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await MatchModel.findByIdAndDelete(id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch
};



const path = require('path');
const { v4: uuidv4 } = require('uuid');
const TournamentModel = require('../models/tournamentModel');
const TeamModel=require('../models/teamModel')
const MatchModel=require('../models/matchModel');
const PlayerModel = require('../models/playerModel');
const uploadToCloudinary = require('./uploadToCloudinary');



const createMatchAndSaveToTournament = async (req, res) => {
  try {
    const { teamAId, teamBId, tournamentId, matchDate,matchTime } = req.body;

    // Find the tournament
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if both teams are registered in the tournament
    const isTeamARegistered = tournament.teams.includes(teamAId);
    const isTeamBRegistered = tournament.teams.includes(teamBId);

    if (!isTeamARegistered || !isTeamBRegistered) {
      return res.status(400).json({ message: 'Both teams must be registered in the tournament' });
    }

    // Create a new match
    const match = new MatchModel({
      tournament_id: tournamentId,
      time: matchTime,
      date: matchDate,
      team_1: teamAId,
      team_2: teamBId
    });

    // Save the match
    const savedMatch = await match.save();

    // Add the match ID to the tournament's matches array
    tournament.matches.push(savedMatch._id);
    await tournament.save();

    // Add the match ID to each player's match history in both teams
    const teamA = await TeamModel.findById(teamAId).populate('players');
    const teamB = await TeamModel.findById(teamBId).populate('players');

    const updatePlayerMatchHistory = async (playerId, teamId) => {
      const player = await PlayerModel.findById(playerId);
      player.match_history.push({
        match_id: savedMatch._id,
        tournament_id: tournamentId,
        team_id: teamId,
        points_scored: 0,
        assists: 0,
        rebounds: 0
      });
      await player.save();
    };

    for (const player of teamA.players) {
      await updatePlayerMatchHistory(player._id, teamAId);
    }

    for (const player of teamB.players) {
      await updatePlayerMatchHistory(player._id, teamBId);
    }

    res.status(201).json({ message: 'Match created and added to tournament successfully', match: savedMatch });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createTournament = async (req, res) => {
  try {
    const { name, startDate, endDate, location, organizer, prizePool, registeringStartDate } = req.body;

    if (!name || !startDate || !endDate || !location || !organizer || !prizePool || !registeringStartDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    if (new Date(registeringStartDate) >= new Date(startDate)) {
      return res.status(400).json({ message: 'Registering start date must be before tournament start date' });
    }

    if (!organizer.name || !organizer.phoneNumber) {
      return res.status(400).json({ message: 'All organizer fields are required' });
    }

    if (!prizePool.firstPrize || !prizePool.secondPrize || !prizePool.thirdPrize || !prizePool.entryFee || !prizePool.mvp) {
      return res.status(400).json({ message: 'All prize pool fields are required' });
    }

    if (!req.files || !req.files.posterImage || !req.files.organizerImage) {
      return res.status(400).json({ message: 'Poster image and organizer image are required' });
    }

    const posterImage = req.files.posterImage[0];
    const organizerImage = req.files.organizerImage[0];

    // Upload buffers using helper
    const posterImageUploadResult = await uploadToCloudinary(
      posterImage.buffer,
      `${Date.now()}-${uuidv4()}`,
      'tournament'
    );

    const organizerImageUploadResult = await uploadToCloudinary(
      organizerImage.buffer,
      `${Date.now()}-${uuidv4()}`,
      'tournament'
    );

    const tournament = new TournamentModel({
      name,
      startDate,
      endDate,
      location,
      posterImage: posterImageUploadResult.secure_url,
      organizer: {
        name: organizer.name,
        image: organizerImageUploadResult.secure_url,
        phoneNumber: organizer.phoneNumber
      },
      prizePool,
      registeringStartDate
    });

    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const getTournamentAdmin = async (req, res) => {
  try {
    const tournament = await TournamentModel.find();
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTournament = async (req, res) => {
  try {
    const { name, startDate, endDate, location, organizer, prizePool, registeringStartDate } = req.body;
    console.log(req.files);
    console.log(req.body);

    // Find the existing tournament
    const tournament = await TournamentModel.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Update only provided fields
    if (name) tournament.name = name;
    if (startDate) tournament.startDate = startDate;
    if (endDate) tournament.endDate = endDate;
    if (location) tournament.location = location;
    if (registeringStartDate) tournament.registeringStartDate = registeringStartDate;

    if (organizer) {
      if (organizer.name) tournament.organizer.name = organizer.name;
      if (organizer.phoneNumber) tournament.organizer.phoneNumber = organizer.phoneNumber;
    }

    if (prizePool) {
      if (prizePool.firstPrize) tournament.prizePool.firstPrize = prizePool.firstPrize;
      if (prizePool.secondPrize) tournament.prizePool.secondPrize = prizePool.secondPrize;
      if (prizePool.thirdPrize) tournament.prizePool.thirdPrize = prizePool.thirdPrize;
      if (prizePool.entryFee) tournament.prizePool.entryFee = prizePool.entryFee;
      if (prizePool.mvp) tournament.prizePool.mvp = prizePool.mvp;
    }

    // Handle file uploads if new files provided
    if (req.files && req.files.posterImage) {
      const posterImage = req.files.posterImage[0];
      const posterImageUploadResult = await uploadToCloudinary(
        posterImage.buffer,
        `${Date.now()}-${uuidv4()}`,
        'tournament'
      );
      tournament.posterImage = posterImageUploadResult.secure_url;
    }

    if (req.files && req.files.organizerImage) {
      const organizerImage = req.files.organizerImage[0];
      const organizerImageUploadResult = await uploadToCloudinary(
        organizerImage.buffer,
        `${Date.now()}-${uuidv4()}`,
        'tournament'
      );
      tournament.organizer.image = organizerImageUploadResult.secure_url;
    }

    await tournament.save();
    res.status(200).json(tournament);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const tournament = await TournamentModel.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getTournaments = async (req, res) => {
  try {
    const tournaments = await TournamentModel.find().sort({ startDate: 1 });
    const currentDate = new Date();

    // Get the latest tournament (closest to today but not in the past)
    const latestTournament = tournaments.find(tournament => new Date(tournament.startDate) >= currentDate);

    // Get upcoming tournaments (those with a start date greater than or equal to today)
    const upcomingTournaments = tournaments.filter(tournament => new Date(tournament.startDate) >= currentDate);
    res.status(200).json({
      latestTournament,
      upcomingTournaments,
      allTournaments: tournaments // All tournaments without any filter
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};


const getTournamentById = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const tournament = await TournamentModel.findById(tournamentId)
      .populate({
        path: 'matches',
        populate: [
          {
            path: 'team_1',
            model: 'Team', // Ensure this matches your Team model name
            select: 'team_details coach players', // Include team details, coach, and players
            populate: {
              path: 'players',
              model: 'Player', // Populate players within the team
              select: 'name jerseyNumber image', // Adjust fields as per your Player schema
            },
          },
          {
            path: 'team_2',
            model: 'Team', // Ensure this matches your Team model name
            select: 'team_details coach players', // Include team details, coach, and players
            populate: {
              path: 'players',
              model: 'Player', // Populate players within the team
              select: 'name jerseyNumber image', // Adjust fields as per your Player schema
            },
          },
          {
            path: 'player_stats.player_id',
            model: 'Player', // Ensure this matches your Player model name
            select: 'name jerseyNumber image', // Adjust fields as per your Player schema
          },
        ],
      })
      .populate({
        path: 'teams',
        model: 'Team', // Ensure this matches your Team model name
        select: 'team_details coach players', // Include team details, coach, and players
        populate: {
          path: 'players',
          model: 'Player', // Populate players within the team
          select: 'name jerseyNumber image', // Adjust fields as per your Player schema
        },
      });

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const assignTeamToTournament = async (req, res) => {
  try {
    const { teamId, tournamentId } = req.body;
    if (!teamId || !tournamentId) {
      return res.status(400).json({ message: 'Team ID and Tournament ID are required' });
    }

    const team = await TeamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    tournament.teams.push(team._id);
    await tournament.save();

    res.status(200).json({ message: 'Team assigned to tournament successfully', tournament });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTournamentAdmin,
  createTournament,
  getTournaments,
  updateTournament,
  deleteTournament,
  assignTeamToTournament,
  createMatchAndSaveToTournament,
  getTournamentById
};
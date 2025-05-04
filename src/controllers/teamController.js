const Team = require('../models/teamModel');
const Player = require('../models/playerModel');
const path = require('path');
const fs = require('fs');
const uploadToCloudinary = require('./uploadToCloudinary');
const { v4: uuidv4 } = require('uuid');

const createTeamStep1 = async (req, res) => {
  try {
    const { name, origin, teamPrimaryNumber } = req.body;
    const logo = req.file;

    if (!name || !origin || !logo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Upload logo to Cloudinary
    const logoUploadResult = await uploadToCloudinary(
      logo.buffer,
      `${Date.now()}-${uuidv4()}`,
      'team'
    );

    const team = new Team({
      team_details: {
        name,
        origin,
        logo: logoUploadResult.secure_url,  // Save Cloudinary URL
        teamPrimaryNumber
      }
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

// Step 2: Add Coach Details to the Team
const addCoachDetails = async (req, res) => {
  try {
    const { teamId, coachname, coachphoneNumber, contact_number_2 } = req.body;
    const coachImage = req.file ? req.file : null;

    if (!teamId || !coachname || !coachphoneNumber || !coachImage) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Upload coach image to Cloudinary
    const coachImageUploadResult = await uploadToCloudinary(
      coachImage.buffer,
      `${Date.now()}-${uuidv4()}`,
      'coach'
    );

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.coach = {
      name: coachname,
      phone_number: coachphoneNumber,
      contact_number_2,
      image: coachImageUploadResult.secure_url  // Store Cloudinary URL
    };

    await team.save();
    res.status(200).json(team);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const addSinglePlayerToTeam = async (req, res) => {
  try {
    const { name, mobileNumber, currentTeam, jerseyNumber,age,height,weight } = req.body;
    const playerImage = req.files.image ? req.files.image[0] : null;
    const playerDocument = req.files.document ? req.files.document[0] : null;

    if (!name || !mobileNumber || !currentTeam || !playerImage || !playerDocument|| !jerseyNumber||!age || !height || !weight) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Upload player image to Cloudinary
    const playerImageUploadResult = await uploadToCloudinary(
      playerImage.buffer,
      `${Date.now()}-${uuidv4()}`,
      'player'
    );

    // Upload player document to Cloudinary
    const playerDocumentUploadResult = await uploadToCloudinary(
      playerDocument.buffer,
      `${Date.now()}-${uuidv4()}`,
      'player'
    );

    const player = new Player({
      name,
      mobileNumber,
      current_team: currentTeam,
      height,
      weight,
      jerseyNumber,
      age,
      image: playerImageUploadResult.secure_url,       // store URL
      document: playerDocumentUploadResult.secure_url   // store URL
    });

    await player.save();

    const team = await Team.findById(currentTeam);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.players.push(player._id);
    await team.save();

    res.status(201).json(player);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
    res.status(200).json(teams);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTeamNames = async (req, res) => {
  try {
    const { teamsId } = req.body;
    if (!teamsId || !Array.isArray(teamsId)) {
      return res.status(400).json({ message: 'teamsId must be an array' });
    }

    const teamDetails = await Promise.all(teamsId.map(async (id) => {
      const foundTeam = await Team.findById(id);
      if (foundTeam) {
        return {
          teamId: foundTeam._id,
          teamName: foundTeam.team_details.name,
          coachName: foundTeam.coach ? foundTeam.coach.name : 'No coach assigned'
        };
      } else {
        return null;
      }
    }));

    res.status(200).json(teamDetails.filter(detail => detail !== null));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { name, origin, coachname, coachphoneNumber, players } = req.body;
    const logo = req.files.logo ? req.files.logo[0] : null;
    const coachImage = req.files.coachImage ? req.files.coachImage[0] : null;
    const playerImages = req.files.playerImages || [];
    const playerDocuments = req.files.playerDocuments || [];

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (name) team.team_details.name = name;
    if (origin) team.team_details.origin = origin;
    if (logo) {
      const logoPath = path.join(__dirname, '../public', `${Date.now()}-${uuidv4()}-${logo.originalname}`);
      fs.writeFileSync(logoPath, logo.buffer);
      team.team_details.logo = logoPath;
    }
    if (coachname && coachphoneNumber) {
      team.coach.name = coachname;
      team.coach.phone_number = coachphoneNumber;
    }
    if (coachImage) {
      const coachImagePath = path.join(__dirname, '../public', `${Date.now()}-${uuidv4()}-${coachImage.originalname}`);
      fs.writeFileSync(coachImagePath, coachImage.buffer);
      team.coach.image = coachImagePath;
    }

    if (players) {
      team.players = [];
      const parsedPlayers = JSON.parse(players);
      for (const [index, playerData] of parsedPlayers.entries()) {
        const playerImage = playerImages.find(file => file.fieldname === `playerImages[${index}]`);
        const playerDocument = playerDocuments.find(file => file.fieldname === `playerDocuments[${index}]`);

        const playerImagePath = playerImage ? path.join(__dirname, '../public', `${Date.now()}-${uuidv4()}-${playerImage.originalname}`) : null;
        if (playerImage) fs.writeFileSync(playerImagePath, playerImage.buffer);

        const playerDocumentPath = playerDocument ? path.join(__dirname, '../public', `${Date.now()}-${uuidv4()}-${playerDocument.originalname}`) : null;
        if (playerDocument) fs.writeFileSync(playerDocumentPath, playerDocument.buffer);

        const player = new Player({
          ...playerData,
          current_team: team._id,
          image: playerImagePath || '', // Ensure image is provided as a string
          document: playerDocumentPath || '', // Ensure document is provided as a string
          mobileNumber: playerData.mobileNumber // Ensure mobileNumber is provided
        });
        await player.save();
        team.players.push(player._id);
      }
    }

    await team.save();
    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTeamStep1,
  addCoachDetails,
  // addPlayerDetails,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addSinglePlayerToTeam,
  getTeamNames
};
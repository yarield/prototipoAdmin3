const express = require('express');
const { searchArtists } = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchArtists);

module.exports = router;

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAvailability, setAvailability, deleteAvailability } = require('../controllers/availabilityController');

const router = express.Router();

router.get('/:artistId', getAvailability);
router.post('/', protect, setAvailability);
router.delete('/:date', protect, deleteAvailability);

module.exports = router;

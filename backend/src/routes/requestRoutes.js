const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyRequests, createRequest, updateRequestStatus } = require('../controllers/requestController');

const router = express.Router();

router.get('/', protect, getMyRequests);
router.post('/', protect, createRequest);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;

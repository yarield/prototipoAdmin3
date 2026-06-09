const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile, updateProfile,
  getMyServices, createService, updateService,
  getPortfolio, uploadPortfolioItem, deletePortfolioItem,
} = require('../controllers/artistController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'video/mp4'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.get('/:id', getProfile);
router.put('/profile', protect, upload.single('photo'), updateProfile);

router.get('/me/services', protect, getMyServices);
router.post('/me/services', protect, createService);
router.put('/me/services/:id', protect, updateService);

router.get('/me/portfolio', protect, getPortfolio);
router.post('/me/portfolio', protect, upload.single('file'), uploadPortfolioItem);
router.delete('/me/portfolio/:id', protect, deletePortfolioItem);

module.exports = router;

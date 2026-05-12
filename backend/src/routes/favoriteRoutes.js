const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, favoriteController.addFavorite);
router.delete('/:goodsId', authMiddleware, favoriteController.removeFavorite);
router.get('/', authMiddleware, favoriteController.getFavorites);

module.exports = router;
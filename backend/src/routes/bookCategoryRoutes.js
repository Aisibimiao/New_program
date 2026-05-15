const express = require('express');
const router = express.Router();
const bookCategoryController = require('../controllers/bookCategoryController');
const authMiddleware = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

router.get('/', bookCategoryController.getBookCategories);
router.get('/all', bookCategoryController.getAllBookCategories);
router.post('/', authMiddleware, adminController.isAdmin, bookCategoryController.addBookCategory);
router.delete('/:id', authMiddleware, adminController.isAdmin, bookCategoryController.deleteBookCategory);

module.exports = router;
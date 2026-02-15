const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentCtrl = require('../controllers/commentController');
router.post('/', auth, commentCtrl.createComment);
router.get('/post/:postId', commentCtrl.getCommentsForPost);
router.delete('/:id', auth, commentCtrl.deleteComment);
module.exports = router;    
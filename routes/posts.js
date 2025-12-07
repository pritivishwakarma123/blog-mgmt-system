const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const postCtrl = require("../controllers/postController");


router.post('/', auth, postCtrl.createPost);
router.get('/', postCtrl.getPosts);
// router.get('/:id', postCtrl.getPostById);
// router.put('/:id', auth, postCtrl.updatePost);
// router.delete('/:id', auth, postCtrl.deletePost);

module.exports = router;
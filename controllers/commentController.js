const { default: mongoose } = require('mongoose');
const comment = require('../models/Comment');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
    try {
        const { content, post } = req.body;

        if (!content || !post) {
            return res.status(400).json({
                message: "  Content and post id are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(post)) {
            return res.status(400).json({
                message: "Invalid post id"
            });
        }

        // Check if post exists
        const existingPost = await Post.findById(post);
        if (!existingPost) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            content,
            post,
            author: req.user._id
        });

        res.status(201).json({
            message: "Comment created successfully",
            Comment
        });

    } catch (err) {
        console.error("Error in createComment:", err);
        res.status(500).json({
            message: "server error"
        });
    }
};

exports.getCommentsForPost = async (req, res) => {
    try {
        const { postId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: "Invalid post id"
            });
        }

        const comments = await Comment.aggregate([
            {
                $match: {
                    post: new mongoose.Types.ObjectId(postId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            },
            {
                $unwind: "$authorDetails"
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        res.status(200).json({
            total: comments.length,
            comments
        });

    } catch (err) {
        console.error("Error in getCommentForPost:", err);
        res.status(500).json({
            message: "server error"
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid comment id"
            });
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        // Only author can delete
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this comment"
            });
        }

        await Comment.findByIdAndDelete(id);

        res.status(200).json({
            message: "Comment deleted successfully ✅"
        });

    } catch (err) {
        console.error("Error in deleteComment:", err);
        res.status(500).json({
            message: "server error"
        });
    }
};
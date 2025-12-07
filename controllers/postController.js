const { default: mongoose } = require('mongoose');
const Post = require('../models/Post')
exports.createPost = async (req, res) => {
    try {
        const { title, body, tags } = req.body || {};
        if (!title || !body) {
            return res.status(400).json({
                message: "Title and body are required."
            })
        }
        const post = await Post.create({ title, body, tags, author: req.user._id });
        res.status(201).json({
            message: 'post created successful'
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'server error'
        })
    }
}

exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const matchStage = {};
        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }


        const posts = await Post.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            },
            { $unwind: "$authorDetails" },
            { $sort: { createdAt: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum }
        ]);


        const total = await Post.countDocuments(matchStage);

        res.status(200).json({
            total,
            page: pageNum,
            limit: limitNum,
            posts
        });
    } catch (err) {
        console.error("Error in getPosts:", err);
        res.status(500).json({ message: 'server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Post id"
            });
        }
        const post = await Post.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
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
            { $unwind: "$authorDetails" }
        ]);
        if (!post || post.length === 0) {
            return res.status(404).json({
                message: "Post not found"
            });
        }
        return res.status(200).json({
            post: post[0]
        });
    } catch (error) {
        console.error("Error in getPostById:", error);
        res.status(500).json({
            message: 'server error'
        });
    }
}

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body, tags } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "invalid post id"
            });
        }
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            })
        }

        //? Check if the user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this post"
            });
        }

        //update field if provided 
        if (title) post.title = title;
        if (body) post.body = body;
        if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(",");
        await post.save();

        const updatePost = await Post.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorDetails",

                }
            },
            { $unwind: "$authorDetails" }
        ]);
        res.status(200).json({
            message: "Post updated successfully",
            post: updatePost[0]
        });
    } catch (error) {
        console.error("Error in update post");
        res.status(500).json({
            message: 'server error'
        });
    }
};
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


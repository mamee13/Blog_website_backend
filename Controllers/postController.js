const Post = require('../Models/postModel');

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const post = new Post({ title, content, tags, author: req.userId });
        await post.save();
        res.status(201).json(post);
        } catch (err) { console.log(err); }
}

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.json(posts);
        } catch (err) { console.log(err); }
}

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
        } catch (err) { console.log(err); }
}

exports.createComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.comments.push({ text: req.body.text, user: req.userId });
        await post.save();
        res.status(201).json(post);
        } catch (err) { console.log(err); }
}

//   app.get('/posts', async (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const posts = await Post.find()
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .populate('author', 'username');
//     res.json(posts);
//   });
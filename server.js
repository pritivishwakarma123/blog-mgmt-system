require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/posts')


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/post', postRoutes)
app.listen(PORT, () => console.log(`server running on port ${PORT} 🚀`));

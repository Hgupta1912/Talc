require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRouter = require('./routes/authRouter.js');
const userRouter = require('./routes/userRouter.js');
const artworkRouter = require('./routes/artworkRouter.js');

const errorHandler = require('./middleware/errorHandler.js');


const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  headers: true,
});
app.use(limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/artworks', artworkRouter);


app.use(errorHandler);

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
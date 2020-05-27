const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const feedRoutes = require('./routes/feed');
const categoryRoutes = require('./routes/categories');
const commentRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');
const repRoutes = require('./routes/rep');

// define variables
const app = express();

const MONGODB_URI = 'mongodb+srv://aisar:1234@aisar-course-o9wvt.mongodb.net/forum?retryWrites=true&w=majority';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

// middlewares
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
      );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/auth', authRoutes);
app.use(repRoutes);
app.use(categoryRoutes);
app.use('/feed', feedRoutes);
app.use(commentRoutes);

// error handeling
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode;
    let message = error.message;
    if (!message) {
      message = 'Ha ocurrido un error. Vuelve a intentarlo.'
    }
    const data = error.data
    res.status(status).json({ message: message, data: data })
})

// init the server
mongoose
.connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
.then(result => {
    console.log('Connected')
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
})
.catch(err =>{
    console.log(err);
});
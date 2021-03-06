const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.Promise = global.Promise;
// Connect to Database
mongoose.connect(config.DATABASE_URL, {
  useMongoClient: true,
});

// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.DATABASE_URL)
});

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err)
});

const app = express();

// Port Number
const port = config.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middliware
app.use(bodyParser.json());

// Passport Mİddleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Module Import
const user = require('./user')(app);
const cryptocurrency = require('./cryptocurrency')(app);
const estimate = require('./estimate')(app);
const vote = require('./vote')(app);


// Index Route
app.get('/', (req, res) => {
  res.send('Invalid endpoint!');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"))
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port ' + port);
});

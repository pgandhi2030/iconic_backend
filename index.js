const express = require('express')
var cookieParser = require('cookie-parser')

const server = express();
const port = 5000
const db = require('./database');
let myMongo = db.connect();
var cors = require('cors')
// server.use(cors())
const transporter = require('./config/sendMail');

const origin = "http://localhost:3000";

server.use(
  cors({
    credentials: true,
    origin
  }),
);

server.use(express.static('public', {
  setHeaders: function setHeaders(res, path, stat) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);
  }

}));


server.use(cookieParser());
server.use('/auth/', require('./routes/authRoutes'));
server.use('/user/', require('./routes/userRoutes'));
server.use('/client/', require('./routes/clientRoutes'));
server.use('/master/', require('./routes/masterRoutes'));

server.listen(port, () => {

  console.log(`Great Your app is working at port: ${port}`)
})

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email Server is ready to take our messages");
  }
});


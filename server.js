const express = require('express');

const app = express();
const server = require('http').createServer(app);

// app.use('/', (req, res, next) => {
//     res.sendFile(__dirname + '/index.html');
//   });
app.use(express.static(__dirname + '/public'));

server.listen(3001, 'localhost', function () {
    console.log(`You're tuned in to port 3001!`);
  }
);
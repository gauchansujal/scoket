const express = require('express');
const http = require('http');
const { Server } = require('socket.io');   // ✅ Correct import
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// server route
app.get('/', (req, res) => {    // ✅ order fixed
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // ✅ fix filename
});


// socket.IO connection handler
//adding users

io.on('connection', (socket) => {
  console.log('A user connected');

  // handle new message
  socket.username = "Anonymous"; //a defult name
  socket.on('chat message', (msg) => { 
      // ✅ lowercase socket
      io.emit('chat message',{ //this send the messafe to all connected users, including the sender
        username: socket.username, //name , time , and message is send
        message: msg,
        timestamp: new Date().toISOString()
      });

  });


// handle username change
socket.on('set username', (username) => {
  const oldUsername = socket.username;//save old user name before new
  socket.username = username || 'Anonymous';//new user name if not defult anonymous

  io.emit('user joined', {
    oldUsername: oldUsername,
    newUsername: socket.username
  });
});

  // handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    io.emit('user left', {username : socket.username});
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

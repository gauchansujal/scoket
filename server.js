const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// server route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected');

  // default username
  socket.username = "Anonymous";

  // handle new message
  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      username: socket.username,
      message: msg,
      timestamp: new Date().toISOString()
    });
  });

  // handle username change
  socket.on('set username', (username) => {
    const oldUsername = socket.username;
    socket.username = username || 'Anonymous';

    io.emit('user joined', {
      oldUsername: oldUsername,
      newUsername: socket.username
    });
  });

  // handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    io.emit('user left', { username: socket.username });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

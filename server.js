const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// predefined rooms
const rooms = new Set(['general', 'random']);

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // default username
  socket.username = "Sujal";

  // join default room
  socket.join("general");

  // handle username change
  socket.on('set username', (username) => {
    const oldUsername = socket.username;
    socket.username = username || 'Anonymous';

    io.emit('user joined', {
      oldUsername,
      newUsername: socket.username
    });
  });

  // join a room
  socket.on('join room', (room) => {
    socket.rooms.forEach(r => {
      if (r !== socket.id) socket.leave(r);
    });

    socket.join(room);

    socket.emit('joined room', room);

    socket.to(room).emit('room message', {
      username: 'System',
      message: `${socket.username} has joined the room`,
      timestamp: new Date().toISOString()
    });
  });

  // create a room
  socket.on('create room', (roomName) => {
    if (!rooms.has(roomName)) {
      rooms.add(roomName);
      io.emit('room created', roomName);
    }
  });

  // chat message handler (room based)
  socket.on('chat message', (data) => {
    const room = Array.from(socket.rooms).find(r => r !== socket.id) || 'general';

    io.to(room).emit('chat message', {
      username: socket.username,
      message: data.message,
      timestamp: new Date().toISOString(),
      room
    });
  });

  // user disconnected
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    io.emit('user left', { username: socket.username });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

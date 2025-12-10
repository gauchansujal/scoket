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
io.on('connection', (socket) => {        // ✅ spelling fixed
  console.log('A user connected');

  // handle new message
  socket.on('chat message', (msg) => {   // ✅ lowercase socket
    console.log('Message received:', msg);
    
    // broadcast message to all users
    io.emit('chat message', msg);
  });

  // handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

const socket = io();

// DOM elements
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

const roomList = document.getElementById('room-list');
const newRoomInput = document.getElementById('new-room');
const createRoomBtn = document.getElementById('create-room-btn');

let currentRoom = 'general';

/* -------------------- ROOM HANDLING -------------------- */

// Click to join room
roomList.addEventListener('click', (e) => {
    if (e.target.classList.contains('room')) {
        const room = e.target.dataset.room;

        socket.emit('join room', room);
        currentRoom = room;

        // update active UI
        document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
        e.target.classList.add('active');
    }
});

// Create new room
createRoomBtn.addEventListener('click', () => {
    const roomName = newRoomInput.value.trim();

    if (roomName && !document.querySelector(`[data-room="${roomName}"]`)) {
        socket.emit('create room', roomName);
        newRoomInput.value = '';
    }
});

// When room created by anyone
socket.on('room created', (roomName) => {
    const li = document.createElement('li');
    li.className = 'room';
    li.dataset.room = roomName;
    li.textContent = roomName;
    roomList.appendChild(li);
});

// When joined a room
socket.on('joined room', (room) => {
    const item = document.createElement('div');
    item.className = 'system-message';
    item.textContent = `You joined ${room}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

/* -------------------- CHAT MESSAGE HANDLING -------------------- */

// send message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) {
        socket.emit('chat message', { message: input.value });
        input.value = '';
    }
});

// receive message
socket.on('chat message', (data) => {
    const item = document.createElement('div');
    item.className = 'message';

    item.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// system room message
socket.on('room message', (data) => {
    const item = document.createElement('div');
    item.className = 'system-message';
    item.textContent = data.message;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

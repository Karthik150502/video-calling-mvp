# WebRTC Signaling Server

This is a simple Node.js WebSocket server that handles WebRTC signaling for peer-to-peer video calls.

## Features

- Room-based connections (2 users per room)
- WebRTC offer/answer exchange
- ICE candidate relay
- Automatic peer discovery
- Connection cleanup on disconnect

## Installation

\`\`\`bash
cd server
npm install
\`\`\`

## Running the Server

\`\`\`bash
npm start
\`\`\`

The server will start on port 3001 by default.

## Message Types

### Client to Server:
- `join-room`: Join a specific room
- `offer`: Send WebRTC offer to peer
- `answer`: Send WebRTC answer to peer
- `ice-candidate`: Send ICE candidate to peer

### Server to Client:
- `client-id`: Your unique client ID
- `waiting-for-peer`: Waiting for another user to join
- `ready-to-connect`: Room has 2 users, ready to establish connection
- `offer`: Received WebRTC offer from peer
- `answer`: Received WebRTC answer from peer
- `ice-candidate`: Received ICE candidate from peer
- `peer-disconnected`: Peer has left the call

## Room System

- Each room can hold exactly 2 users
- When 2 users join the same room, they are automatically connected
- The first user becomes the "initiator" and creates the WebRTC offer
- The second user receives the offer and sends back an answer

const WebSocket = require("ws");
const http = require("http");

// Create HTTP server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok", message: "Signaling server is running" }))
  } else {
    res.writeHead(404)
    res.end()
  }
})

// Create WebSocket server
const wss = new WebSocket.Server({ server })

// Store connected clients
const clients = new Map()
const rooms = new Map()

console.log("WebRTC Signaling Server starting...")

wss.on("connection", (ws, req) => {

  console.log("New client connected")
  const fullUrl = req.url;

  console.log({ fullUrl })

  // Generate unique client ID
  const clientId = generateClientId()
  clients.set(clientId, ws)

  // Send client their ID
  ws.send(
    JSON.stringify({
      type: "client-id",
      clientId: clientId,
    }),
  )

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)
      console.log("Received message:", data.type, "from client:", clientId)

      switch (data.type) {
        case "join-room":
          handleJoinRoom(clientId, data.roomId)
          break

        case "offer":
          handleOffer(clientId, data)
          break

        case "answer":
          handleAnswer(clientId, data)
          break

        case "ice-candidate":
          handleIceCandidate(clientId, data)
          break

        default:
          console.log("Unknown message type:", data.type)
      }
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  ws.on("close", () => {
    console.log("Client disconnected:", clientId)
    handleClientDisconnect(clientId)
  })

  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
  })
})

function generateClientId() {
  return Math.random().toString(36).substring(2, 15)
}

function handleJoinRoom(clientId, roomId) {
  console.log(`Client ${clientId} joining room ${roomId}`)

  // Remove client from any existing room
  for (const [room, roomClients] of rooms.entries()) {
    if (roomClients.has(clientId)) {
      roomClients.delete(clientId)
      if (roomClients.size === 0) {
        rooms.delete(room)
      }
    }
  }

  // Add client to new room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set())
  }

  const roomClients = rooms.get(roomId)
  const existingClients = Array.from(roomClients)
  roomClients.add(clientId)

  const ws = clients.get(clientId)

  if (existingClients.length > 0) {
    ws.send(
      JSON.stringify({
        type: "existing-participants",
        participants: existingClients,
      }),
    )

    for (const existingClientId of existingClients) {
      const existingWs = clients.get(existingClientId)
      if (existingWs && existingWs.readyState === WebSocket.OPEN) {
        existingWs.send(
          JSON.stringify({
            type: "new-participant",
            participantId: clientId,
          }),
        )
      }
    }
  }

  ws.send(
    JSON.stringify({
      type: "room-joined",
      roomId: roomId,
      participantCount: roomClients.size,
      participants: Array.from(roomClients),
    }),
  )

  console.log(`Room ${roomId} now has ${roomClients.size} participants`)
}

function handleOffer(clientId, data) {
  console.log(`Relaying offer from ${clientId} to ${data.targetId}`)

  const targetWs = clients.get(data.targetId)
  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "offer",
        offer: data.offer,
        fromId: clientId,
      }),
    )
  }
}

function handleAnswer(clientId, data) {
  console.log(`Relaying answer from ${clientId} to ${data.targetId}`)

  const targetWs = clients.get(data.targetId)
  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "answer",
        answer: data.answer,
        fromId: clientId,
      }),
    )
  }
}

function handleIceCandidate(clientId, data) {
  console.log(`Relaying ICE candidate from ${clientId} to ${data.targetId}`)

  const targetWs = clients.get(data.targetId)
  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "ice-candidate",
        candidate: data.candidate,
        fromId: clientId,
      }),
    )
  }
}

function handleClientDisconnect(clientId) {
  // Remove client from all rooms and notify peers
  for (const [roomId, roomClients] of rooms.entries()) {
    if (roomClients.has(clientId)) {
      roomClients.delete(clientId)

      for (const remainingClientId of roomClients) {
        const ws = clients.get(remainingClientId)
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "participant-left",
              participantId: clientId,
              remainingParticipants: Array.from(roomClients),
            }),
          )
        }
      }

      // Clean up empty rooms
      if (roomClients.size === 0) {
        rooms.delete(roomId)
      }
    }
  }

  // Remove client from clients map
  clients.delete(clientId)
}

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`WebRTC Signaling Server running on port ${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down signaling server...")
  wss.close(() => {
    server.close(() => {
      console.log("Server closed")
      process.exit(0)
    })
  })
})

import WebSocket, { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
let allSockets = [];
let userCount = 0;
wss.on("connection", (socket) => {
    allSockets.push({ socket, room: "general" });
    userCount++;
    console.log("Client connected");
    console.log("client count:", userCount);
    socket.on("message", (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        }
        catch (err) {
            console.log("Invalid JSON:", message.toString());
            socket.send(JSON.stringify({ error: "Invalid JSON" }));
            return;
        }
        if (!data.type) {
            socket.send(JSON.stringify({ error: "Missing type field" }));
            return;
        }
        if (data.type === "join") {
            const user = allSockets.find((s) => s.socket === socket);
            if (user) {
                user.room = data.room;
                socket.send(JSON.stringify({ status: "joined", room: data.room }));
            }
            return;
        }
        if (data.type === "message") {
            const user = allSockets.find((s) => s.socket === socket);
            if (!user) {
                socket.send(JSON.stringify({ error: "User not found" }));
                return;
            }
            if (!user.room) {
                socket.send(JSON.stringify({ error: "Join a room first" }));
                return;
            }
            const room = user.room;
            const text = data.message;
            const receivers = allSockets.filter((s) => s.room === room);
            receivers.forEach((r) => r.socket.send(JSON.stringify({
                type: "message",
                message: text,
                senderId: data.senderId,
                room,
            })));
        }
    });
    socket.on("close", () => {
        allSockets = allSockets.filter((s) => s.socket !== socket);
        userCount--;
        console.log("Client disconnected");
    });
});
//# sourceMappingURL=index.js.map
import { useEffect, useRef, useState } from "react";

interface Message {
  text: string;
  isMe: boolean;
}

const isSocketReady = (socket: WebSocket | null) =>
  socket && socket.readyState === WebSocket.OPEN;

export default function ChatApp() {
  const [step, setStep] = useState("home");
  const [room, setRoom] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [isConnected, setIsConnected] = useState(false);

  const userId = useRef(Math.random().toString(36).substring(7));
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const WS_URL = import.meta.env.REACT_APP_WS_URL || "ws://localhost:8080";

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to server");
      setIsConnected(true);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) => [
            ...prev,
            { text: data.message, isMe: data.senderId === userId.current },
          ]);
        }
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createRoom = () => {
    if (!isConnected) return;
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedRoom(code);
    joinRoom(code);
    setStep("created");
  };

  const joinRoom = (code: string) => {
    if (!code || !isSocketReady(socketRef.current)) return;

    socketRef.current?.send(JSON.stringify({ type: "join", room: code }));
    setRoom(code);
    setStep("chat");
  };

  const sendMessage = () => {
    if (!input || !isSocketReady(socketRef.current)) return;

    const payload = {
      type: "message",
      message: input,
      senderId: userId.current,
      room,
    };

    socketRef.current?.send(JSON.stringify(payload));

    setInput("");
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F2] ">
      <div className="max-w-3xl mx-auto px-6 py-12 relative overflow-hidden">
        {/* HEADER */}
        <header className="mb-16 text-center">
          <h1
            className="text-[#1C1C1B] text-4xl font-light mb-3 tracking-tight"
            style={{ fontFamily: "serif" }}
          >
            Private Rooms
          </h1>
          <p
            className="text-[#AEB7C3] text-sm tracking-wide uppercase"
            style={{ letterSpacing: "0.1em" }}
          >
            Temporary conversations · Expires after exit
          </p>
        </header>

        {/* STEP 1: HOME SCREEN */}
        {step === "home" && (
          <div className="flex flex-col items-stretch space-y-6 mt-24">
            <button
              className="w-[calc(50%-8px)] mx-auto px-10 py-5 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)]"
              onClick={createRoom}
              style={{ fontWeight: 400 }}
            >
              Create New Room
            </button>

            <button
              className="w-[calc(50%-8px)] mx-auto px-10 py-5 bg-white text-[#1C1C1B] rounded-2xl hover:bg-[#F3F1ED] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.08)] border border-[#D9D6D2]"
              onClick={() => setStep("join")}
              style={{ fontWeight: 400 }}
            >
              Join Existing Room
            </button>
          </div>
        )}

        {/* STEP 2A: ROOM CREATED SCREEN */}
        {step === "created" && (
          <div className="flex flex-col items-center text-center mt-24 space-y-10">
            <div>
              <p
                className="text-[#AEB7C3] text-xs tracking-widest uppercase mb-6"
                style={{ letterSpacing: "0.15em" }}
              >
                Your Room Code
              </p>
              <p
                className="text-[#1C1C1B] text-6xl tracking-wider mb-2"
                style={{ fontFamily: "serif", fontWeight: 300 }}
              >
                {generatedRoom}
              </p>
              <div className="h-px w-32 bg-[#D8CBB8] mx-auto mt-8"></div>
            </div>

            <button
              onClick={() => setStep("chat")}
              className="mt-12 px-12 py-5 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)]"
              style={{ fontWeight: 400 }}
            >
              Enter Room
            </button>
          </div>
        )}

        {/* STEP 2B: JOIN EXISTING ROOM */}
        {step === "join" && (
          <div className="flex flex-col items-center mt-24 space-y-8">
            <input
              className="w-[calc(50%-8px)] px-8 py-6 bg-white border border-[#D9D6D2] text-[#1C1C1B] rounded-2xl outline-none focus:border-[#D8CBB8] transition-all text-center text-3xl tracking-widest uppercase shadow-[0_4px_16px_rgba(28,28,27,0.06)]"
              placeholder="·····"
              value={room}
              onChange={(e) => setRoom(e.target.value.toUpperCase())}
              maxLength={5}
              style={{ fontFamily: "serif", fontWeight: 300 }}
            />

            <button
              onClick={() => joinRoom(room)}
              className="w-[calc(50%-8px)] px-10 py-5 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)]"
              style={{ fontWeight: 400 }}
            >
              Join Room
            </button>
          </div>
        )}

        {/* STEP 3: CHAT SCREEN */}
        {step === "chat" && (
          <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* ROOM INFO BAR */}
            <div className="flex justify-between items-center px-8 py-5 bg-white rounded-2xl mb-8 shadow-[0_4px_16px_rgba(28,28,27,0.06)] border border-[#D9D6D2]">
              <div className="text-sm">
                <span
                  className="text-[#AEB7C3] tracking-wide uppercase"
                  style={{ letterSpacing: "0.1em", fontSize: "0.7rem" }}
                >
                  Room
                </span>{" "}
                <span
                  className="text-[#1C1C1B] font-medium ml-2"
                  style={{ fontFamily: "serif" }}
                >
                  {room}
                </span>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto mb-8 space-y-4 pr-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-6 py-4 rounded-2xl max-w-md shadow-[0_4px_12px_rgba(28,28,27,0.08)] ${
                      msg.isMe
                        ? "bg-[#1C1C1B] text-[#F8F6F2]"
                        : "bg-white text-[#1C1C1B] border border-[#D9D6D2]"
                    }`}
                    style={{ fontWeight: 400, lineHeight: "1.6" }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>

            {/* INPUT BAR */}
            <div className="flex items-center gap-4">
              <input
                className="flex-1 px-6 py-4 bg-white border border-[#D9D6D2] text-[#1C1C1B] rounded-2xl outline-none focus:border-[#D8CBB8] transition-all shadow-[0_4px_12px_rgba(28,28,27,0.06)] placeholder:text-[#AEB7C3]"
                placeholder="Write message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ fontWeight: 400 }}
              />

              <button
                onClick={sendMessage}
                className="px-8 py-4 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)]"
                style={{ fontWeight: 400 }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

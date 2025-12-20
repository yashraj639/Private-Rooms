import { useEffect, useRef, useState, useCallback } from "react";

// --- Types ---

interface Message {
  text: string;
  isMe: boolean;
}

type ViewStep = "home" | "created" | "join" | "chat";


const WS_URL = "wss://api.yashrj.xyz";

// --- Components ---

const Header = () => (
  <header className="mb-16 text-center">
    <h1 className="text-[#1C1C1B] text-4xl font-light mb-3 tracking-tight font-serif">
      Private Rooms
    </h1>
    <p className="text-[#AEB7C3] text-sm tracking-wide uppercase">
      Temporary conversations · Expires after exit
    </p>
  </header>
);

const HomeView = ({
  onCreate,
  onJoinClick,
}: {
  onCreate: () => void;
  onJoinClick: () => void;
}) => (
  <div className="flex flex-col items-stretch space-y-6 mt-24">
    <button
      className="w-[calc(50%-8px)] mx-auto px-10 py-5 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)] font-normal"
      onClick={onCreate}
    >
      Create New Room
    </button>
    <button
      className="w-[calc(50%-8px)] mx-auto px-10 py-5 bg-white text-[#1C1C1B] rounded-2xl hover:bg-[#F3F1ED] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.08)] border border-[#D9D6D2] font-normal"
      onClick={onJoinClick}
    >
      Join Existing Room
    </button>
  </div>
);

const CreatedRoomView = ({
  roomCode,
  onEnter,
}: {
  roomCode: string;
  onEnter: () => void;
}) => (
  <div className="flex flex-col items-center text-center mt-24 space-y-10">
    <div>
      <p className="text-[#AEB7C3] text-xs tracking-[0.15em] uppercase mb-6">
        Your Room Code
      </p>
      <p className="text-[#1C1C1B] text-6xl tracking-wider mb-2 font-serif font-light">
        {roomCode}
      </p>
      <div className="h-px w-32 bg-[#D8CBB8] mx-auto mt-8"></div>
    </div>
    <button
      onClick={onEnter}
      className="mt-12 px-12 py-5 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)] font-normal"
    >
      Enter Room
    </button>
  </div>
);

const JoinRoomView = ({
  roomCode,
  setRoomCode,
  onJoin,
}: {
  roomCode: string;
  setRoomCode: (code: string) => void;
  onJoin: () => void;
}) => (
  <div className="flex flex-col items-center mt-24 space-y-8">
    <input
      className="w-[calc(50%-8px)] px-8 py-6 bg-white border border-[#D9D6D2] text-[#1C1C1B] rounded-2xl outline-none focus:border-[#D8CBB8] transition-all text-center text-3xl tracking-widest uppercase shadow-[0_4px_16px_rgba(28,28,27,0.06)] font-serif font-light"
      placeholder="·····"
      value={roomCode}
      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
      maxLength={5}
    />
    <button
      onClick={onJoin}
      className="w-[calc(50%-8px)] px-10 py-5 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 text-base tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)] font-normal"
    >
      Join Room
    </button>
  </div>
);

const ChatView = ({
  roomCode,
  messages,
  input,
  setInput,
  onSend,
}: {
  roomCode: string;
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSend();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* ROOM INFO BAR */}
      <div className="flex justify-between items-center px-8 py-5 bg-white rounded-2xl mb-8 shadow-[0_4px_16px_rgba(28,28,27,0.06)] border border-[#D9D6D2]">
        <div className="text-sm">
          <span className="text-[#AEB7C3] tracking-widest uppercase text-[0.7rem]">
            Room
          </span>{" "}
          <span className="text-[#1C1C1B] font-medium ml-2 font-serif">
            {roomCode}
          </span>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto mb-8 space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-6 py-4 rounded-2xl max-w-md shadow-[0_4px_12px_rgba(28,28,27,0.08)] font-normal leading-relaxed ${
                msg.isMe
                  ? "bg-[#1C1C1B] text-[#F8F6F2]"
                  : "bg-white text-[#1C1C1B] border border-[#D9D6D2]"
              }`}
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
          className="flex-1 px-6 py-4 bg-white border border-[#D9D6D2] text-[#1C1C1B] rounded-2xl outline-none focus:border-[#D8CBB8] transition-all shadow-[0_4px_12px_rgba(28,28,27,0.06)] placeholder:text-[#AEB7C3] font-normal"
          placeholder="Write message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={onSend}
          className="px-8 py-4 bg-[#1C1C1B] text-[#F8F6F2] rounded-2xl hover:bg-[#2C2C2B] transition-all duration-300 tracking-wide shadow-[0_8px_24px_rgba(28,28,27,0.12)] font-normal"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// --- Logic ---

function useChat(url: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) => [
            ...prev,
            { text: data.message, isMe: data.senderId === userIdRef.current },
          ]);
        }
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const joinRoom = useCallback((room: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return;
    socketRef.current.send(JSON.stringify({ type: "join", room }));
  }, []);

  const sendMessage = useCallback((text: string, room: string) => {
    if (
      !text ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    )
      return;

    const payload = {
      type: "message",
      message: text,
      senderId: userIdRef.current,
      room,
    };

    socketRef.current.send(JSON.stringify(payload));
  }, []);

  return { isConnected, messages, joinRoom, sendMessage };
}

// --- Main Container ---

export default function ChatApp() {
  const [step, setStep] = useState<ViewStep>("home");
  const [room, setRoom] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [input, setInput] = useState("");

  const { isConnected, messages, joinRoom, sendMessage } = useChat(WS_URL);

  const handleCreateRoom = () => {
    if (!isConnected) return;
    const code = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedRoom(code);
    joinRoom(code);
    setStep("created");
    setRoom(code); // Ensure room state is consistent
  };

  const handleJoinExistingRoom = () => {
    setStep("join");
  };

  const handleEnterRoom = () => {
    setStep("chat");
  };

  const handleJoinConfirm = () => {
    if (!room) return;
    joinRoom(room);
    setStep("chat");
  };

  const handleSendMessage = () => {
    if (!input) return;
    sendMessage(input, room);
    setInput("");
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F2]">
      <div className="max-w-3xl mx-auto px-6 py-12 relative overflow-hidden">
        <Header />

        {step === "home" && (
          <HomeView
            onCreate={handleCreateRoom}
            onJoinClick={handleJoinExistingRoom}
          />
        )}

        {step === "created" && (
          <CreatedRoomView roomCode={generatedRoom} onEnter={handleEnterRoom} />
        )}

        {step === "join" && (
          <JoinRoomView
            roomCode={room}
            setRoomCode={setRoom}
            onJoin={handleJoinConfirm}
          />
        )}

        {step === "chat" && (
          <ChatView
            roomCode={room}
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}

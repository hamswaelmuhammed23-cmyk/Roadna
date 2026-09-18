import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// ─── TYPES (for backend integration) ─────────────────────────────────────────
// Conversation: { id, userName, lastMessage, timestamp, userImage, isOnline }
// Message:      { id, chatId, senderId, text, timestamp, status }
// API stubs:
//   GET  /messages/:chatId  → Message[]
//   POST /messages          → Message

// ─── SAMPLE CONVERSATIONS ─────────────────────────────────────────────────────
const SAMPLE_CONVERSATIONS = [
  { id: "c1", userName: "Ahmed Ali",   lastMessage: "Got it! See you soon.",        timestamp: "2:30 PM",   userImage: null, isOnline: true  },
  { id: "c2", userName: "Sarah",       lastMessage: "Looking forward to it!",       timestamp: "1:15 PM",   userImage: null, isOnline: false },
  { id: "c3", userName: "Ali",         lastMessage: "Sounds great! Let's plan it.", timestamp: "11:45 AM",  userImage: null, isOnline: true  },
  { id: "c4", userName: "Farah",       lastMessage: "I haven't been there yet",     timestamp: "9:20 AM",   userImage: null, isOnline: false },
  { id: "c5", userName: "Omar",        lastMessage: "I'll check and let you know",  timestamp: "Yesterday", userImage: null, isOnline: true  },
  { id: "c6", userName: "Lina Hassan", lastMessage: "Keep in touch anytime",        timestamp: "Yesterday", userImage: null, isOnline: false },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Removed letter avatars as requested, will use real images or a generic placeholder.
function fmtTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── ANIMATED PARTICLES ───────────────────────────────────────────────────────
function ParticleBackground() {
  useEffect(() => {
    if (!document.getElementById('particles-script-chat')) {
      const script = document.createElement('script');
      script.id  = 'particles-script-chat';
      script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
      script.async = true;
      script.onload = initParticles;
      document.body.appendChild(script);
    } else {
      initParticles();
    }

    function initParticles() {
      window.particlesJS?.('particles-js-chat', {
        particles: {
          number:  { value: 100 },
          size:    { value: 4 },
          color:   { value: '#ffffff' },
          opacity: { value: 0.8 },
          move:    { speed: 2.5 },
          line_linked: { enable: true, color: '#ffffff', opacity: 0.5 },
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
          },
        },
        retina_detect: true,
      });
    }

    return () => {
      try { window.pJSDom?.find(p => p.canvas.el.id === 'particles-js-chat')?.pJS?.fn?.vendors?.destroypJS?.(); } catch { /* ignore */ }
    };
  }, []);

  return (
    <div
      id="particles-js-chat"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, opacity:1 }}
    />
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ userImage, userName, size = 44, isOnline }) {
  const [imgErr, setImgErr] = useState(false);
  const noImg = !userImage || imgErr;
  return (
    <div style={{ position:"relative", flexShrink:0, width:size, height:size }}>
      {noImg ? (
        <div style={{
          width:"100%", height:"100%", borderRadius:"50%",
          background: "#f1f5f9",
          display:"flex", alignItems:"center", justifyContent:"center",
          border:"2px solid rgba(255,255,255,0.8)", userSelect:"none",
          overflow: "hidden"
        }}>
          <svg viewBox="0 0 24 24" fill="#cbd5e1" style={{ width: size*0.75, height: size*0.75, marginTop: size*0.15 }}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      ) : (
        <img
          src={userImage} alt={userName} onError={() => setImgErr(true)}
          style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(255,255,255,0.8)" }}
        />
      )}
      {isOnline !== undefined && (
        <span style={{
          position:"absolute", bottom:1, right:1,
          width: size * 0.26, height: size * 0.26,
          borderRadius:"50%", border:"2px solid #fff",
          background: isOnline ? "#22c55e" : "#cbd5e1",
        }}/>
      )}
    </div>
  );
}

// ─── CONVERSATION ITEM ────────────────────────────────────────────────────────
function ConversationItem({ conv, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:"100%", display:"flex", alignItems:"center", gap:12,
        padding:"10px 12px", borderRadius:16, textAlign:"left",
        border:"none", cursor:"pointer", transition:"all 0.2s",
        background: isActive
          ? "#ffffff"
          : hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.30)",
        boxShadow: isActive ? "0 4px 20px rgba(47,128,237,0.15)" : "none",
      }}
    >
      <Avatar userImage={conv.userImage} userName={conv.userName} size={46} isOnline={conv.isOnline} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
          <span style={{
            fontWeight:800, fontSize:14.5,
            color: isActive ? "#2F80ED" : "#1e3a5f",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {conv.userName}
          </span>
          <span style={{ fontSize:11, color: isActive ? "#475569" : "#475569", fontWeight:600, flexShrink:0 }}>
            {conv.timestamp}
          </span>
        </div>
        <p style={{
          fontSize:12.5, margin:"3px 0 0", fontWeight:500,
          color: isActive ? "#334155" : "#334155",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>
          {conv.lastMessage}
        </p>
      </div>
    </button>
  );
}

// ─── CHAT SIDEBAR ─────────────────────────────────────────────────────────────
function ChatSidebar({ conversations, activeId, onSelect, search, onSearch }) {
  const navigate = useNavigate();

  const filtered = useMemo(
    () => conversations.filter(c => c.userName.toLowerCase().includes(search.toLowerCase())),
    [conversations, search]
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", width:"100%" }}>

      {/* Logo & Back */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 18px 14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Back button */}
          <button 
            onClick={() => navigate('/explore')}
            style={{ width:36, height:36, borderRadius:12, background:"rgba(255,255,255,0.25)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.35)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.25)"}
            title="Back to Explore"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ width:20, height:20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span style={{ fontSize:22, fontWeight:900, color:"#2F80ED", letterSpacing:"-0.5px", textShadow:"0 2px 12px rgba(255,255,255,0.5)" }}>
            Message
          </span>
        </div>
        <button style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.4)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="16" height="16" fill="none" stroke="#1e293b" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding:"0 14px 12px" }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:"rgba(255,255,255,0.85)", borderRadius:30,
          padding:"10px 16px", boxShadow:"0 2px 8px rgba(14,116,144,0.08)",
        }}>
          <svg style={{ width:15, height:15, flexShrink:0 }} fill="none" stroke="#2F80ED" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text" placeholder="Search..." value={search}
            onChange={e => onSearch(e.target.value)}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:"#334155", fontFamily:"inherit" }}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 10px 12px", display:"flex", flexDirection:"column", gap:4 }}>
        {filtered.length === 0
          ? <p style={{ textAlign:"center", fontSize:13, color:"#1e293b", fontWeight:600, marginTop:40 }}>No conversations found</p>
          : filtered.map(conv => (
              <ConversationItem
                key={conv.id} conv={conv}
                isActive={conv.id === activeId}
                onClick={() => onSelect(conv.id)}
              />
            ))
        }
      </div>
    </div>
  );
}

// ─── CHAT HEADER ──────────────────────────────────────────────────────────────
function ChatHeader({ user }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 24px", background:"#ffffff",
      borderBottom:"1px solid #e8f4fd", flexShrink:0,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Avatar userImage={user.userImage} userName={user.userName} size={44} isOnline={user.isOnline} />
        <div>
          <div style={{ fontWeight:800, fontSize:15.5, color:"#2F80ED", lineHeight:1.2 }}>{user.userName}</div>
          <div style={{ fontSize:12, fontWeight:600, color: user.isOnline ? "#22c55e" : "#94a3b8", marginTop:2 }}>
            {user.isOnline ? "● Online" : "● Offline"}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        {/* More button */}
        <button style={{ width:38, height:38, borderRadius:"50%", background:"#f0f9ff", border:"1px solid #e0f2fe", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="#dbeafe"}
          onMouseLeave={e => e.currentTarget.style.background="#f0f9ff"}
        >
          <svg style={{ width:16, height:16 }} fill="none" stroke="#64b5d9" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn, senderName, senderImage }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, flexDirection: isOwn ? "row-reverse" : "row" }}>
      {!isOwn && (
        <div style={{ flexShrink:0 }}>
          <Avatar userImage={senderImage} userName={senderName} size={30} />
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", alignItems: isOwn ? "flex-end" : "flex-start", maxWidth:"65%" }}>
        <div style={{
          padding:"10px 16px", fontSize:13.5, lineHeight:1.55, borderRadius:20,
          borderBottomRightRadius: isOwn ? 5 : 20,
          borderBottomLeftRadius:  isOwn ? 20 : 5,
          background: isOwn ? "linear-gradient(135deg,#4CB8E7,#2F80ED)" : "#ffffff",
          color: isOwn ? "#ffffff" : "#1e3a5f",
          boxShadow: isOwn
            ? "0 3px 12px rgba(47,128,237,0.30)"
            : "0 2px 8px rgba(14,116,144,0.08)",
          border: isOwn ? "none" : "1px solid #e8f4fd",
        }}>
          {message.text}
        </div>
        <span style={{ fontSize:10.5, color:"#94a3b8", marginTop:4, padding:"0 4px" }}>
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}

// ─── MESSAGE INPUT ────────────────────────────────────────────────────────────
function MessageInput({ value, onChange, onSend }) {
  const [focused, setFocused] = useState(false);
  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };
  return (
    <div style={{ padding:"16px 20px", background:"#ffffff", borderTop:"1px solid #e8f4fd", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <input
          type="text" value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type a message..."
          style={{
            flex:1, background:"#f5fafd",
            border: focused ? "1.5px solid #2F80ED" : "1.5px solid #e0f2fe",
            borderRadius:30, padding:"12px 22px",
            fontSize:13.5, color:"#1e3a5f", outline:"none",
            fontFamily:"inherit", transition:"border-color 0.2s",
            boxShadow: focused ? "0 0 0 3px rgba(47,128,237,0.12)" : "none",
          }}
        />
        {/* Paper plane send button */}
        <button
          onClick={onSend}
          disabled={!value.trim()}
          style={{
            width:46, height:46, borderRadius:"50%", border:"none",
            cursor: value.trim() ? "pointer" : "not-allowed",
            background: value.trim()
              ? "linear-gradient(135deg,#4CB8E7,#2F80ED)"
              : "#e0f2fe",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
            boxShadow: value.trim() ? "0 4px 14px rgba(47,128,237,0.35)" : "none",
            transition:"all 0.2s",
            transform:"scale(1)",
          }}
          onMouseEnter={e => { if (value.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg style={{ width:20, height:20, marginLeft:2 }} viewBox="0 0 24 24" fill="none" stroke={value.trim() ? "white" : "#94a3b8"} strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L21 4L14 21L11.5 13.5L3 12Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── EMPTY MESSAGES STATE ─────────────────────────────────────────────────────
function EmptyMessages() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:18, userSelect:"none" }}>
      {/* Speech bubble matching design */}
      <div style={{ position:"relative", marginBottom:4 }}>
        <div style={{
          width:88, height:72, borderRadius:24,
          background:"linear-gradient(135deg,#d2f1ff,#eef9ff)",
          display:"flex", alignItems:"center", justifyContent:"center",
          gap:6, boxShadow:"0 4px 20px rgba(47,128,237,0.15)",
        }}>
          {[0, 0.25, 0.5].map((delay, i) => (
            <span key={i} style={{
              width:9, height:9, borderRadius:"50%",
              background:"#2F80ED", display:"inline-block",
              animation: `dotBob 1.6s ease-in-out ${delay}s infinite`,
            }}/>
          ))}
        </div>
        {/* Bubble tail */}
        <div style={{
          position:"absolute", bottom:-10, left:22,
          width:20, height:20,
          background:"#d2f1ff",
          clipPath:"polygon(0 0, 100% 0, 0 100%)",
          borderRadius:"0 0 0 6px",
        }}/>
      </div>
      <div style={{ textAlign:"center", marginTop:8 }}>
        <p style={{ fontSize:18, fontWeight:800, color:"#2F80ED", margin:0 }}>Start a conversation</p>
        <p style={{ fontSize:13, color:"#94a3b8", marginTop:8, lineHeight:1.5 }}>Send a message to begin chatting</p>
      </div>
    </div>
  );
}

// ─── NO CHAT SELECTED ─────────────────────────────────────────────────────────
function NoChatSelected() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16, userSelect:"none" }}>
      <div style={{ width:70, height:70, borderRadius:22, background:"linear-gradient(135deg,#d2f1ff,#eef9ff)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(47,128,237,0.12)" }}>
        <svg style={{ width:34, height:34 }} fill="none" stroke="#2F80ED" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:15, fontWeight:800, color:"#2F80ED", margin:0 }}>Select a conversation</p>
        <p style={{ fontSize:13, color:"#94a3b8", marginTop:6 }}>Choose from the list to start chatting</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(null);
  const [messages, setMessages]           = useState({});
  const [inputMsg, setInputMsg]           = useState("");
  const [search, setSearch]               = useState("");
  const [typingChats, setTypingChats]     = useState({});
  const messagesEndRef                    = useRef(null);
  const socketRef                         = useRef(null);
  const typingTimeoutRef                  = useRef(null);

  const me = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile') || '{}')
    } catch { return {} }
  }, [])

  const currentUserId = me._id || me.id;

  const fmtTimeMsg = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date()
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch { return "" }
  }

  const activeConv = conversations.find(c => c.id === activeId) ?? null;
  const chatMsgs   = useMemo(() => activeId ? (messages[activeId] ?? []) : [], [activeId, messages]);

  const loadMessages = useCallback(async (chatId) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`/api/v1/chat/conversations/${chatId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && data.data?.messages) {
        const mapped = data.data.messages.map(msg => {
          const isOwn = msg.sender._id === currentUserId || msg.sender === currentUserId
          return {
            id: msg._id,
            chatId,
            senderId: isOwn ? "me" : "them",
            text: msg.content,
            timestamp: fmtTimeMsg(msg.createdAt),
            status: "received"
          }
        })
        setMessages(prev => ({ ...prev, [chatId]: mapped }))
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }, [currentUserId])

  const loadConversations = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('/api/v1/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && data.data?.conversations) {
        const mapped = data.data.conversations.map(conv => {
          const partner = conv.participants.find(p => p._id !== currentUserId) || {}
          return {
            id: conv._id,
            userName: partner.fullName || "User",
            lastMessage: conv.lastMessage ? conv.lastMessage.content : "No messages yet",
            timestamp: conv.lastMessage ? fmtTimeMsg(conv.lastMessage.createdAt) : "",
            userImage: partner.photo || null,
            isOnline: false,
            partnerId: partner._id
          }
        })
        setConversations(mapped)

        // Parse search query parameter for target user ID
        const params = new URLSearchParams(window.location.search)
        const targetUserId = params.get('userId')
        if (targetUserId) {
          const existing = mapped.find(c => c.partnerId === targetUserId)
          if (existing) {
            setActiveId(existing.id)
            loadMessages(existing.id)
            const socket = socketRef.current
            if (socket) {
              socket.emit("join_room", existing.id)
              socket.emit("mark_read", { conversationId: existing.id })
            }
          } else {
            // Create or fetch the conversation on the backend
            const res2 = await fetch('/api/v1/chat/conversations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ participantId: targetUserId })
            })
            const data2 = await res2.json()
            if (data2.success && data2.data?.conversation) {
              const conv = data2.data.conversation
              const partner = conv.participants.find(p => p._id !== currentUserId) || {}
              const newMappedConv = {
                id: conv._id,
                userName: partner.fullName || "User",
                lastMessage: conv.lastMessage ? conv.lastMessage.content : "No messages yet",
                timestamp: conv.lastMessage ? fmtTimeMsg(conv.lastMessage.createdAt) : "",
                userImage: partner.photo || null,
                isOnline: false,
                partnerId: partner._id
              }
              setConversations(prev => {
                if (prev.some(c => c.id === conv._id)) return prev
                return [newMappedConv, ...prev]
              })
              setActiveId(conv._id)
              loadMessages(conv._id)
              const socket = socketRef.current
              if (socket) {
                socket.emit("join_room", conv._id)
                socket.emit("mark_read", { conversationId: conv._id })
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
    }
  }, [currentUserId, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatMsgs, typingChats]);

  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    loadConversations()

    const socket = io({ auth: { token } })
    socketRef.current = socket

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server")
      socket.emit("get_online_users", (res) => {
        if (res.success && res.onlineUsers) {
          setConversations(prev => prev.map(c => 
            res.onlineUsers.includes(c.partnerId) ? { ...c, isOnline: true } : c
          ))
        }
      })
      if (activeIdRef.current) {
        socket.emit("join_room", activeIdRef.current)
      }
    })

    socket.on("user_online", ({ userId }) => {
      setConversations(prev => prev.map(c => c.partnerId === userId ? { ...c, isOnline: true } : c))
    })

    socket.on("user_offline", ({ userId }) => {
      setConversations(prev => prev.map(c => c.partnerId === userId ? { ...c, isOnline: false } : c))
    })

    socket.on("receive_message", ({ message, conversationId }) => {
      const isOwn = message.sender._id === currentUserId || message.sender === currentUserId
      const mappedMsg = {
        id: message._id,
        chatId: conversationId,
        senderId: isOwn ? "me" : "them",
        text: message.content,
        timestamp: fmtTimeMsg(message.createdAt),
        status: "received"
      }
      setMessages(prev => {
        const currentMsgs = prev[conversationId] ?? []
        if (currentMsgs.some(m => m.id === message._id)) {
          return prev
        }
        return {
          ...prev,
          [conversationId]: [...currentMsgs, mappedMsg]
        }
      })
      setConversations(prev => prev.map(c => 
        c.id === conversationId 
          ? { ...c, lastMessage: message.content, timestamp: fmtTimeMsg(message.createdAt) } 
          : c
      ))
    })

    socket.on("user_typing", ({ userId, conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setTypingChats(prev => ({ ...prev, [conversationId]: true }))
      }
    })

    socket.on("user_stop_typing", ({ userId, conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setTypingChats(prev => ({ ...prev, [conversationId]: false }))
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [navigate, loadConversations, currentUserId])

  const handleSelect = (id) => {
    const prevId = activeId
    setActiveId(id)
    loadMessages(id)
    setInputMsg("")
    const socket = socketRef.current
    if (socket) {
      if (prevId) socket.emit("leave_room", prevId)
      socket.emit("join_room", id)
      socket.emit("mark_read", { conversationId: id })
    }
  }

  const handleSend = useCallback(() => {
    const text = inputMsg.trim()
    if (!text || !activeId) return
    const socket = socketRef.current
    if (socket) {
      socket.emit("stop_typing", activeId)
      socket.emit("send_message", { conversationId: activeId, content: text }, (res) => {
        if (!res.success) {
          console.error("Failed to send message:", res.error)
        }
      })
    }
    setInputMsg("")
  }, [inputMsg, activeId])

  const handleInputChange = (val) => {
    setInputMsg(val)
    const socket = socketRef.current
    if (socket && activeId) {
      socket.emit("typing", activeId)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", activeId)
      }, 2000)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; font-family:'Nunito',sans-serif; }
        body { margin:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(47,128,237,0.4); border-radius:99px; }
        input::placeholder { color:#64748b; }
        @keyframes dotBob {
          0%,100% { transform:translateY(0); opacity:0.7; }
          50%      { transform:translateY(-7px); opacity:1; }
        }
        #particles-js-chat canvas {
          opacity: 1 !important;
        }
      `}</style>

      {/* ── Full page — sky blue gradient background ── */}
      <div style={{
        position:"fixed",
        inset: 0,
        display:"flex", alignItems:"center", justifyContent:"center",
        width:"100vw", height:"100vh", overflow:"hidden",
        background:"linear-gradient(to bottom right, #4CB8E7, #2F80ED)",
      }}>

        {/* Background Soft Glows */}
        <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "40%", height: "40%", background: "rgba(255,255,255,0.4)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "rgba(147,197,253,0.3)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* ── Particles layer — clearly visible ── */}
        <ParticleBackground />

        {/* ── Main card ── */}
        <div style={{
          position:"relative", zIndex:1,
          display:"flex", width:"100%",
          maxWidth:1300,
          height:"calc(100vh - 40px)", /* Taking up most of the screen */
          borderRadius:28, overflow:"hidden",
          background:"rgba(255,255,255,0.08)",
          boxShadow:"0 32px 80px rgba(14,86,122,0.22), 0 4px 20px rgba(14,86,122,0.14), inset 0 1px 0 rgba(255,255,255,0.3)",
          border:"1px solid rgba(255,255,255,0.25)",
        }}>

          {/* ── SIDEBAR ── */}
          <div style={{
            width:340, flexShrink:0, height:"100%",
            overflow:"hidden", display:"flex", flexDirection:"column",
            // More readable sidebar background
            background:"rgba(255, 255, 255, 0.45)",
            backdropFilter:"blur(16px)",
            borderRight:"1px solid rgba(255,255,255,0.25)",
          }}>
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              search={search}
              onSearch={setSearch}
            />
          </div>

          {/* ── CHAT WINDOW ── */}
          <div style={{
            flex:1, display:"flex", flexDirection:"column",
            height:"100%", minWidth:0,
            // White right panel like design
            background:"rgba(255,255,255,0.95)",
            backdropFilter:"blur(20px)",
          }}>
            {!activeConv ? (
              <NoChatSelected />
            ) : (
              <>
                <ChatHeader user={activeConv} />

                {/* Messages area */}
                <div style={{
                  flex:1, overflowY:"auto", padding:"24px 28px",
                  background:"linear-gradient(180deg, #f5fbff 0%, #ffffff 100%)",
                }}>
                  {chatMsgs.length === 0 ? (
                    <EmptyMessages />
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      {chatMsgs.map(msg => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={msg.senderId === "me"}
                          senderName={activeConv.userName}
                          senderImage={activeConv.userImage}
                        />
                      ))}
                      
                      {/* Typing indicator */}
                      {activeId && typingChats[activeId] && (
                        <div style={{ display:"flex", alignItems:"flex-end", gap:8, flexDirection:"row" }}>
                          <div style={{ flexShrink:0 }}>
                            <Avatar userImage={activeConv.userImage} userName={activeConv.userName} size={30} />
                          </div>
                          <div style={{
                            padding:"12px 16px", borderRadius:20, borderBottomLeftRadius:5,
                            background:"#ffffff", border:"1px solid #e8f4fd",
                            boxShadow:"0 2px 8px rgba(14,116,144,0.08)",
                            display: "flex", gap: 5, alignItems: "center", height: 38
                          }}>
                            <span style={{ width: 6, height: 6, background: "#2F80ED", borderRadius: "50%", animation: "dotBob 1.2s infinite ease-in-out" }}></span>
                            <span style={{ width: 6, height: 6, background: "#2F80ED", borderRadius: "50%", animation: "dotBob 1.2s infinite ease-in-out 0.2s" }}></span>
                            <span style={{ width: 6, height: 6, background: "#2F80ED", borderRadius: "50%", animation: "dotBob 1.2s infinite ease-in-out 0.4s" }}></span>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <MessageInput value={inputMsg} onChange={handleInputChange} onSend={handleSend} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


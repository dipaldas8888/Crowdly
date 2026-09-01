import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  Search,
  Send,
  Image,
  CheckCheck,
  Check,
  Loader2,
  X,
  User,
  MessageSquareDot,
  Phone,
  Video as VideoIcon,
  MoreHorizontal,
} from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if a user is online
  const isUserOnline = useCallback(
    (userId) => onlineUsers.includes(userId?.toString()),
    [onlineUsers]
  );

  // Fetch all conversations (friends + people we've messaged)
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConv(true);
      const data = await apiRequest("/messages/conversations");
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchConversations error:", err);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle ?user=<id> query param — auto-open chat with that user
  // This runs independently of the conversations list so it works even when
  // conversations is empty (first-time message to someone).
  const didLoadTargetUser = useRef(false);
  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (!targetUserId || didLoadTargetUser.current) return;

    // Check if already in loaded conversations
    const existing = conversations.find((c) => c.user?._id === targetUserId);
    if (existing) {
      didLoadTargetUser.current = true;
      setActivePartner(existing.user);
      return;
    }

    // Either conversations haven't loaded yet OR this user isn't in the list.
    // Fetch their profile directly so we can open the chat right away.
    apiRequest(`/users/profile/${targetUserId}`)
      .then((res) => {
        if (res.user) {
          didLoadTargetUser.current = true;
          setActivePartner(res.user);
          // Insert a placeholder conversation entry in the sidebar
          setConversations((prev) => {
            const already = prev.some((c) => c.user?._id === res.user._id);
            if (already) return prev;
            return [{ user: res.user, lastMessage: null, unreadCount: 0 }, ...prev];
          });
        }
      })
      .catch(console.error);
  // Run when conversations finish loading OR the search param changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadingConv]);

  // Fetch messages for active partner
  useEffect(() => {
    if (!activePartner?._id) return;

    const fetchMessages = async () => {
      try {
        setLoadingMsg(true);
        const data = await apiRequest(`/messages/${activePartner._id}`);
        setMessages(Array.isArray(data) ? data : []);
        // Clear unread badge
        setConversations((prev) =>
          prev.map((c) =>
            c.user?._id === activePartner._id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        console.error("fetchMessages error:", err);
      } finally {
        setLoadingMsg(false);
      }
    };

    fetchMessages();
  }, [activePartner?._id]);

  // Listen for real-time incoming messages via Socket.io
  useEffect(() => {
    const sock = socket.current;
    if (!sock) return;

    const handleNewMessage = (msg) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;

      // If this message is from the currently active chat, append it
      if (senderId === activePartner?._id) {
        setMessages((prev) => [...prev, msg]);
        // Also mark as read immediately
        apiRequest(`/messages/${senderId}`).catch(() => {});
      } else {
        // Otherwise, increment unread count in conversation list
        setConversations((prev) => {
          const exists = prev.some((c) => c.user?._id === senderId);
          if (exists) {
            return prev.map((c) =>
              c.user?._id === senderId
                ? {
                    ...c,
                    lastMessage: msg,
                    unreadCount: (c.unreadCount || 0) + 1,
                  }
                : c
            );
          }
          // New conversation not yet in list — add it
          const senderUser =
            typeof msg.sender === "object"
              ? msg.sender
              : { _id: senderId, username: "User" };
          return [
            { user: senderUser, lastMessage: msg, unreadCount: 1 },
            ...prev,
          ];
        });
      }
    };

    const handleTyping = ({ from }) => {
      if (from === activePartner?._id) {
        setPartnerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(
          () => setPartnerTyping(false),
          3000
        );
      }
    };

    const handleStopTyping = ({ from }) => {
      if (from === activePartner?._id) {
        setPartnerTyping(false);
      }
    };

    sock.on("newMessage", handleNewMessage);
    sock.on("typing", handleTyping);
    sock.on("stopTyping", handleStopTyping);

    return () => {
      sock.off("newMessage", handleNewMessage);
      sock.off("typing", handleTyping);
      sock.off("stopTyping", handleStopTyping);
    };
  }, [socket, activePartner?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // Emit typing events when user types
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!activePartner?._id || !socket.current) return;

    socket.current.emit("typing", { to: activePartner._id });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current?.emit("stopTyping", { to: activePartner._id });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !image) || !activePartner || sendingMsg) return;

    const formData = new FormData();
    if (text.trim()) formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      setSendingMsg(true);
      socket.current?.emit("stopTyping", { to: activePartner._id });

      const newMsg = await apiRequest(`/messages/${activePartner._id}`, {
        method: "POST",
        body: formData,
      });

      // Add to local messages immediately (optimistic)
      setMessages((prev) => [...prev, newMsg]);

      // Emit to partner via socket for real-time delivery
      socket.current?.emit("sendMessage", newMsg);

      // Update conversation list last message
      setConversations((prev) => {
        const exists = prev.some((c) => c.user?._id === activePartner._id);
        if (exists) {
          return prev.map((c) =>
            c.user?._id === activePartner._id
              ? { ...c, lastMessage: newMsg }
              : c
          );
        }
        return [
          { user: activePartner, lastMessage: newMsg, unreadCount: 0 },
          ...prev,
        ];
      });

      setText("");
      setImage(null);
    } catch (err) {
      console.error("sendMessage error:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-[1600px] w-full mx-auto flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Nav Sidebar */}
        <LeftSidebar />

        {/* 2-column messaging layout */}
        <main className="flex-1 flex overflow-hidden bg-white border-x border-slate-200/80">
          {/* ── Conversations sidebar ── */}
          <div className="w-72 xl:w-80 shrink-0 border-r border-slate-200/80 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 pb-3 border-b border-slate-100 space-y-3 bg-white shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Messages</h2>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {conversations.length}
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-100 border border-transparent rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loadingConv ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquareDot className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-xs text-slate-400 font-medium">
                    {search ? "No chats match your search." : "No conversations yet. Add friends to start chatting!"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((item) => {
                  const isSelected = activePartner?._id === item.user?._id;
                  const online = isUserOnline(item.user?._id);
                  return (
                    <button
                      key={item.user?._id}
                      onClick={() => setActivePartner(item.user)}
                      className={`w-full text-left p-3.5 flex items-center gap-3 transition-all cursor-pointer border-b border-slate-50 ${
                        isSelected
                          ? "bg-blue-50 border-l-[3px] border-l-blue-600"
                          : "hover:bg-slate-50/80 border-l-[3px] border-l-transparent"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={
                            item.user?.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          }
                          alt={item.user?.username}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        {online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? "text-blue-700" : "text-slate-900"}`}>
                            {item.user?.username}
                          </h4>
                          {item.lastMessage && (
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {formatTime(item.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className={`text-[11px] truncate ${item.unreadCount > 0 ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                            {item.lastMessage
                              ? item.lastMessage.text || "📷 Image"
                              : "Start a conversation..."}
                          </p>
                          {item.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white font-bold text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0 ml-1">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div className="flex-1 flex flex-col h-full bg-slate-50/40">
            {activePartner ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          activePartner.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        }
                        alt={activePartner.username}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      {isUserOnline(activePartner._id) && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {activePartner.username}
                      </h3>
                      <p className="text-[11px] font-medium">
                        {partnerTyping ? (
                          <span className="text-blue-500 italic animate-pulse">
                            typing...
                          </span>
                        ) : isUserOnline(activePartner._id) ? (
                          <span className="text-emerald-500">● Online</span>
                        ) : (
                          <span className="text-slate-400">Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                      <VideoIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {loadingMsg ? (
                    <div className="flex justify-center p-10">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                        <User className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600">
                          Say hi to {activePartner.username}!
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Start a conversation below.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const senderId =
                          typeof msg.sender === "object"
                            ? msg.sender._id
                            : msg.sender;
                        const isMe = senderId === user?._id || senderId === user?.id;
                        const prevMsg = messages[idx - 1];
                        const prevSenderId = prevMsg
                          ? typeof prevMsg.sender === "object"
                            ? prevMsg.sender._id
                            : prevMsg.sender
                          : null;
                        const showAvatar = !isMe && senderId !== prevSenderId;

                        return (
                          <div
                            key={msg._id}
                            className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {/* Partner avatar (only first in group) */}
                            {!isMe && (
                              <div className="w-7 shrink-0">
                                {showAvatar ? (
                                  <img
                                    src={
                                      activePartner.avatar ||
                                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                                    }
                                    alt={activePartner.username}
                                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                  />
                                ) : null}
                              </div>
                            )}

                            <div className={`flex flex-col gap-0.5 max-w-xs md:max-w-md ${isMe ? "items-end" : "items-start"}`}>
                              <div
                                className={`px-4 py-2.5 rounded-2xl shadow-xs space-y-2 ${
                                  isMe
                                    ? "bg-blue-600 text-white rounded-br-sm"
                                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"
                                }`}
                              >
                                {msg.image && (
                                  <div className="rounded-xl overflow-hidden max-h-52">
                                    <img
                                      src={msg.image}
                                      alt="attachment"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                {msg.text && (
                                  <p className="text-xs sm:text-sm leading-relaxed">
                                    {msg.text}
                                  </p>
                                )}
                              </div>

                              <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <span>{formatTime(msg.createdAt)}</span>
                                {isMe &&
                                  (msg.read ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <Check className="w-3 h-3 text-slate-400" />
                                  ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing bubble */}
                      {partnerTyping && (
                        <div className="flex items-end gap-2">
                          <img
                            src={
                              activePartner.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                            }
                            alt={activePartner.username}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image attachment preview */}
                {image && (
                  <div className="px-5 py-2 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="attachment preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setImage(null)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">Image attached</span>
                  </div>
                )}

                {/* Message input bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Attach Image"
                  >
                    <Image className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${activePartner.username}...`}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        handleSendMessage(e);
                      }
                    }}
                    className="flex-1 bg-slate-100 border border-transparent rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />

                  <button
                    type="submit"
                    disabled={sendingMsg || (!text.trim() && !image)}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {sendingMsg ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Send className="w-4.5 h-4.5" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <MessageSquareDot className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-600">
                    Your Messages
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a conversation or start a new one.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

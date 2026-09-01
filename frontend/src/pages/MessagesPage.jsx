import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
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
  Trash2,
  Smile,
  FileText,
  Download,
  Paperclip,
  Pencil,
} from "lucide-react";

// Preset emoji categories for emoji picker
const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "😎", "🥳", "🤠", "🤯", "🧐", "🤓"],
  },
  {
    name: "Hearts & Hands",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💖", "💗", "💓", "💞", "💕", "❣️", "💔", "❤️‍🔥", "🔥", "✨", "⭐", "🎉", "👏", "👍", "👎", "👊", "✊", "🤛", "🤜", "🙌", "👐", "🤲", "🙏", "🤝", "💪", "✌️", "🤘", "👌", "🤌", "<ctrl42>", "🖐️"],
  },
  {
    name: "Objects & Fun",
    emojis: ["🚀", "💡", "📷", "🎥", "💻", "📱", "📚", "📄", "📌", "💬", "🔔", "💯", "🎯", "🏆", "🎁", "🌈", "☀️", "🌙", "☕", "🍕", "🍔", "⚽", "🏀", "🚗", "🎧", "🎮", "🔑", "💎"],
  },
];

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Editing message states
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [savingMsgEdit, setSavingMsgEdit] = useState(false);
  
  // Attachments
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState("");

  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [search, setSearch] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  // Popovers & menus
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState(0);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Check if a user is online via socket or flag
  const isUserOnline = (userId) => {
    if (!userId) return false;
    return (
      onlineUsers?.includes(userId.toString()) ||
      onlineUsers?.includes(userId)
    );
  };

  // Fetch all conversations on mount
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
  const didLoadTargetUser = useRef(false);
  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (!targetUserId || didLoadTargetUser.current) return;

    const existing = conversations.find((c) => c.user?._id === targetUserId);
    if (existing) {
      didLoadTargetUser.current = true;
      setActivePartner(existing.user);
      return;
    }

    apiRequest(`/users/profile/${targetUserId}`)
      .then((res) => {
        if (res.user) {
          didLoadTargetUser.current = true;
          setActivePartner(res.user);
          setConversations((prev) => {
            const already = prev.some((c) => c.user?._id === res.user._id);
            if (already) return prev;
            return [{ user: res.user, lastMessage: null, unreadCount: 0 }, ...prev];
          });
        }
      })
      .catch(console.error);
  }, [searchParams, loadingConv, conversations]);

  // Fetch messages for active partner
  useEffect(() => {
    if (!activePartner?._id) return;

    const fetchMessages = async () => {
      try {
        setLoadingMsg(true);
        const data = await apiRequest(`/messages/${activePartner._id}`);
        setMessages(Array.isArray(data) ? data : []);
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

  // Socket event listeners for real-time messages & typing
  useEffect(() => {
    const sock = socket?.current;
    if (!sock) return;

    const handleNewMessage = (msg) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;

      if (activePartner && senderId === activePartner._id) {
        setMessages((prev) => [...prev, msg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.user?._id === activePartner._id
              ? { ...c, lastMessage: msg, unreadCount: 0 }
              : c
          )
        );
      } else {
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
  }, [socket, activePartner]);

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
    if ((!text.trim() && !image && !docFile) || !activePartner || sendingMsg) return;

    const formData = new FormData();
    if (text.trim()) formData.append("text", text);
    if (image) formData.append("image", image);
    if (docFile) formData.append("image", docFile);

    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      sender: user,
      recipient: activePartner,
      text: text.trim(),
      image: imagePreview,
      fileUrl: docFile ? URL.createObjectURL(docFile) : "",
      fileName: docFileName,
      read: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    setImage(null);
    setImagePreview(null);
    setDocFile(null);
    setDocFileName("");
    setShowEmojiPicker(false);
    socket.current?.emit("stopTyping", { to: activePartner._id });

    try {
      setSendingMsg(true);
      const savedMsg = await apiRequest(`/messages/${activePartner._id}`, {
        method: "POST",
        body: formData,
      });

      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMsg._id ? savedMsg : m))
      );

      setConversations((prev) => {
        const exists = prev.some((c) => c.user?._id === activePartner._id);
        if (exists) {
          return prev.map((c) =>
            c.user?._id === activePartner._id
              ? { ...c, lastMessage: savedMsg }
              : c
          );
        }
        return [
          { user: activePartner, lastMessage: savedMsg, unreadCount: 0 },
          ...prev,
        ];
      });

      socket.current?.emit("sendMessage", savedMsg);
    } catch (err) {
      console.error("handleSendMessage error:", err);
      toast.error(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
    } finally {
      setSendingMsg(false);
    }
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setDocFile(null);
    setDocFileName("");
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePdfPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocFile(file);
    setDocFileName(file.name);
    setImage(null);
    setImagePreview(null);
  };

  const handleAddEmoji = (emojiStr) => {
    setText((prev) => prev + emojiStr);
  };

  // Edit single message
  const handleSaveMessageEdit = async (messageId) => {
    if (!editingText.trim() || savingMsgEdit) return;
    try {
      setSavingMsgEdit(true);
      const updatedMsg = await apiRequest(`/messages/message/${messageId}`, {
        method: "PUT",
        body: { text: editingText.trim() },
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? updatedMsg : m))
      );
      setEditingMsgId(null);
      setEditingText("");
      toast.success("Message edited.");
    } catch (err) {
      console.error("Edit message error:", err);
      toast.error(err.message || "Failed to edit message");
    } finally {
      setSavingMsgEdit(false);
    }
  };

  // Delete single message
  const handleDeleteMessage = async (messageId) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await apiRequest(`/messages/message/${messageId}`, { method: "DELETE" });
      toast.info("Message deleted.");
    } catch (err) {
      console.error("Delete message error:", err);
      toast.error(err.message || "Failed to delete message");
    }
  };

  // Delete entire conversation
  const handleDeleteConversation = async () => {
    if (!activePartner?._id) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the entire chat with ${activePartner.username}?`
      )
    )
      return;

    try {
      await apiRequest(`/messages/conversation/${activePartner._id}`, {
        method: "DELETE",
      });
      setMessages([]);
      setConversations((prev) =>
        prev.filter((c) => c.user?._id !== activePartner._id)
      );
      setShowChatMenu(false);
      toast.info(`Conversation with ${activePartner.username} deleted.`);
    } catch (err) {
      console.error("Delete conversation error:", err);
      toast.error(err.message || "Failed to delete conversation");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = conversations.filter((c) =>
    c.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-[1600px] w-full mx-auto flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        <LeftSidebar />

        <main className="flex-1 flex overflow-hidden bg-white border-x border-slate-200/80">
          {/* ── Left list panel: Conversations ── */}
          <div className="w-80 md:w-96 border-r border-slate-200/80 flex flex-col shrink-0 bg-white">
            {/* Header & Search */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900">Messages</h2>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
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
                              ? item.lastMessage.fileUrl
                                ? "📄 PDF Document"
                                : item.lastMessage.text || "📷 Image"
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
          <div className="flex-1 flex flex-col h-full bg-slate-50/40 relative">
            {activePartner ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0 shadow-xs relative">
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

                  {/* Header Actions & Dropdown */}
                  <div className="flex items-center gap-1 relative">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                      <VideoIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowChatMenu((prev) => !prev)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showChatMenu && (
                      <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 w-44 text-xs font-medium">
                        <button
                          onClick={handleDeleteConversation}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                          <span>Delete Entire Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages stream */}
                <div
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                  onClick={() => {
                    if (showChatMenu) setShowChatMenu(false);
                    if (showEmojiPicker) setShowEmojiPicker(false);
                  }}
                >
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

                        const isEditingThis = editingMsgId === msg._id;

                        return (
                          <div
                            key={msg._id}
                            className={`flex items-end gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
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
                              <div className="flex items-center gap-1.5 group/bubble relative">
                                {isEditingThis ? (
                                  /* Inline message edit box */
                                  <div className="flex items-center gap-1.5 bg-white border border-blue-500 rounded-2xl px-3 py-1.5 shadow-md">
                                    <input
                                      type="text"
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleSaveMessageEdit(msg._id);
                                        }
                                      }}
                                      className="text-xs text-slate-800 outline-none bg-transparent"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveMessageEdit(msg._id)}
                                      disabled={savingMsgEdit}
                                      className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-1"
                                      title="Save"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingMsgId(null);
                                        setEditingText("");
                                      }}
                                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    className={`px-4 py-2.5 rounded-2xl shadow-xs space-y-2 ${
                                      isMe
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"
                                    }`}
                                  >
                                    {/* Attached Image */}
                                    {msg.image && (
                                      <div className="rounded-xl overflow-hidden max-h-52">
                                        <img
                                          src={msg.image}
                                          alt="attachment"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}

                                    {/* Attached PDF / File */}
                                    {msg.fileUrl && (
                                      <div className="flex items-center gap-3 p-2.5 bg-slate-900/10 dark:bg-white/10 rounded-xl border border-white/20">
                                        <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                                          <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold truncate">
                                            {msg.fileName || "Document.pdf"}
                                          </p>
                                          <span className="text-[10px] opacity-75">PDF Document</span>
                                        </div>
                                        <a
                                          href={msg.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          download
                                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer shrink-0"
                                          title="Download / View PDF"
                                        >
                                          <Download className="w-4 h-4" />
                                        </a>
                                      </div>
                                    )}

                                    {/* Message Text */}
                                    {msg.text && (
                                      <p className="text-xs sm:text-sm leading-relaxed">
                                        {msg.text}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Hover action buttons for user's own sent messages */}
                                {isMe && !isEditingThis && (
                                  <div className="opacity-0 group-hover/bubble:opacity-100 flex items-center gap-0.5 transition-all">
                                    {msg.text && (
                                      <button
                                        onClick={() => {
                                          setEditingMsgId(msg._id);
                                          setEditingText(msg.text);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer shrink-0"
                                        title="Edit Message"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteMessage(msg._id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                                      title="Delete Message"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <span>{formatTime(msg.createdAt)}</span>
                                {msg.isEdited && (
                                  <span className="italic text-[9px] text-slate-400">(edited)</span>
                                )}
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
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Attachment previews (Image or Document) */}
                {imagePreview && (
                  <div className="px-5 py-2 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <span className="text-xs text-slate-500 font-medium">Image attached</span>
                    </div>
                    <button
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {docFile && (
                  <div className="px-5 py-2.5 bg-rose-50/60 border-t border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {docFileName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">PDF Attachment ready</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDocFile(null);
                        setDocFileName("");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── Emoji Picker Popover Modal ── */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-5 z-30 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 w-72 sm:w-80">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveEmojiTab(idx)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              activeEmojiTab === idx
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                      {EMOJI_CATEGORIES[activeEmojiTab].emojis.map((em, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddEmoji(em)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-lg transition-transform active:scale-125 cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="px-5 py-3 border-t border-slate-200/80 bg-white flex items-center gap-2 shrink-0 relative"
                >
                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      showEmojiPicker
                        ? "bg-amber-50 text-amber-500"
                        : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
                    }`}
                    title="Insert Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Image Attachment Button */}
                  <label
                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Attach Image"
                  >
                    <Image className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagePick}
                      className="hidden"
                    />
                  </label>

                  {/* PDF / Document Attachment Button */}
                  <label
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Attach PDF Document"
                  >
                    <Paperclip className="w-5 h-5" />
                    <input
                      type="file"
                      accept="application/pdf,.pdf,.doc,.docx"
                      onChange={handlePdfPick}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    placeholder={`Message ${activePartner.username}...`}
                    value={text}
                    onChange={handleTextChange}
                    className="flex-1 bg-slate-100 border border-transparent rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  />

                  <button
                    type="submit"
                    disabled={(!text.trim() && !image && !docFile) || sendingMsg}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                  >
                    {sendingMsg ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* No partner selected placeholder */
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-8">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <MessageSquareDot className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-slate-800">
                    Your Messages
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select a conversation from the sidebar or start a new chat with a friend.
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

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { Image, MapPin, Tag, X, Check } from "lucide-react";

export default function CreatePost({ setPosts, groupId }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [showFriendsPicker, setShowFriendsPicker] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await apiRequest("/friends");
        setFriendsList(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchFriends();
  }, []);

  const toggleTagFriend = (friendId) => {
    setTaggedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image && !location.trim()) return;

    const formData = new FormData();
    formData.append("text", text);
    if (location) formData.append("location", location);
    if (taggedFriends.length > 0) {
      formData.append("taggedFriends", JSON.stringify(taggedFriends));
    }
    if (groupId) formData.append("group", groupId);

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      const endpoint = groupId ? `/groups/${groupId}/posts` : "/posts";

      const newPost = await apiRequest(endpoint, {
        method: "POST",
        body: formData,
      });

      setPosts((prev) => [newPost, ...prev]);
      toast.success("Post published successfully!");

      setText("");
      setImage(null);
      setLocation("");
      setShowLocationInput(false);
      setTaggedFriends([]);
      setShowFriendsPicker(false);
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs mb-6">
      {/* Top Input Bar */}
      <div className="flex items-center gap-3.5">
        <img
          src={
            user?.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
          }
          alt={user?.username || "User"}
          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100"
        />
        <input
          type="text"
          placeholder={`What's on your mind ${user?.username || ""}?`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="flex-1 text-base bg-transparent border-none outline-none placeholder-slate-400 text-slate-800"
        />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="relative mt-3.5 rounded-xl overflow-hidden max-h-80 bg-slate-950/5 flex items-center justify-center border border-slate-200">
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            className="w-full h-auto max-h-80 object-contain mx-auto"
          />
          <button
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Location Input Banner */}
      {showLocationInput && (
        <div className="mt-3.5 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          <input
            type="text"
            placeholder="Add location (e.g. New York, NY)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-700"
          />
          {location && (
            <button
              onClick={() => setLocation("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Tag Friends Picker Modal/Dropdown */}
      {showFriendsPicker && (
        <div className="mt-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tag Friends:</span>
            <button
              onClick={() => setShowFriendsPicker(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Done
            </button>
          </div>
          {friendsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No friends added yet to tag.</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-1">
              {friendsList.map((friend) => {
                const isSelected = taggedFriends.includes(friend._id);
                return (
                  <button
                    key={friend._id}
                    type="button"
                    onClick={() => toggleTagFriend(friend._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{friend.username}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tagged Friends Pills Display */}
      {taggedFriends.length > 0 && !showFriendsPicker && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-slate-500 font-medium">With:</span>
          {taggedFriends.map((id) => {
            const friend = friendsList.find((f) => f._id === id);
            return (
              <span
                key={id}
                className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1"
              >
                {friend?.username || "Friend"}
                <button onClick={() => toggleTagFriend(id)}>
                  <X className="w-3 h-3 hover:text-blue-800" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <hr className="my-3.5 border-slate-100" />

      {/* Action Toolbar & Share Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Hidden File Input */}
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
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded flex items-center justify-center bg-emerald-100 text-emerald-600">
              <Image className="w-4 h-4" />
            </div>
            <span>Add Image</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLocationInput((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              location ? "bg-rose-50 text-rose-600" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="w-6 h-6 rounded flex items-center justify-center bg-rose-100 text-rose-600">
              <MapPin className="w-4 h-4" />
            </div>
            <span>{location ? "Location Added" : "Add Place"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFriendsPicker((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              taggedFriends.length > 0 ? "bg-sky-50 text-sky-600" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="w-6 h-6 rounded flex items-center justify-center bg-sky-100 text-sky-600">
              <Tag className="w-4 h-4" />
            </div>
            <span>{taggedFriends.length > 0 ? `${taggedFriends.length} Tagged` : "Tag Friends"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !image && !location.trim())}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ml-auto"
        >
          {loading ? "Sharing..." : "Share"}
        </button>
      </div>
    </div>
  );
}

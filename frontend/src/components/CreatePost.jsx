import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { Image, MapPin, Tag, X, Check, Navigation, Loader2 } from "lucide-react";

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

  // Free OpenStreetMap Nominatim Place Search & GPS Detection State
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locationCoords, setLocationCoords] = useState(null);
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

  // Debounced search using OpenStreetMap Nominatim API
  useEffect(() => {
    if (!locationInput.trim() || locationInput.length < 2) {
      setPlaceSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingLocation(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            locationInput
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
            },
          }
        );
        const data = await res.json();
        setPlaceSuggestions(data || []);
      } catch (err) {
        console.error("Location search error:", err);
      } finally {
        setSearchingLocation(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationInput]);

  // Use Browser Geolocation API + Nominatim Reverse Geocoding
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en-US,en;q=0.9",
              },
            }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
          const state = addr.state || "";
          const country = addr.country || "";

          const formatted = [city, state, country].filter(Boolean).join(", ");
          const finalLocation =
            formatted || data.display_name?.split(",").slice(0, 3).join(",") || "Current Location";

          setLocation(finalLocation);
          setLocationInput(finalLocation);
          setLocationCoords({ lat: latitude, lng: longitude });
          setPlaceSuggestions([]);
          toast.success(`Location set: ${finalLocation}`);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          toast.error("Failed to fetch address for current location");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error(
          error.code === 1
            ? "Location access permission denied"
            : "Could not retrieve your position"
        );
        setDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
    if (locationCoords) formData.append("locationCoords", JSON.stringify(locationCoords));
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
      setLocationInput("");
      setLocationCoords(null);
      setPlaceSuggestions([]);
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

      {/* Location Input Banner with OpenStreetMap Autocomplete */}
      {showLocationInput && (
        <div className="mt-3.5 space-y-2 relative">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-rose-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-rose-200 transition-all">
            <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0" />
            <input
              type="text"
              placeholder="Search city, place, or landmark..."
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setLocation(e.target.value);
              }}
              className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            />
            {searchingLocation && (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            )}
            <button
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={detectingLocation}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Detect current position via GPS"
            >
              {detectingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Use GPS</span>
            </button>
            {locationInput && (
              <button
                type="button"
                onClick={() => {
                  setLocation("");
                  setLocationInput("");
                  setPlaceSuggestions([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {placeSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
              {placeSuggestions.map((place) => {
                const addr = place.address || {};
                const placeName =
                  addr.amenity || addr.name || addr.road || place.display_name.split(",")[0];
                const detail = [
                  addr.city || addr.town || addr.village || addr.county,
                  addr.state,
                  addr.country,
                ]
                  .filter(Boolean)
                  .join(", ");
                const formattedName = detail ? `${placeName}, ${detail}` : place.display_name;

                return (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => {
                      setLocation(formattedName);
                      setLocationInput(formattedName);
                      if (place.lat && place.lon) {
                        setLocationCoords({
                          lat: parseFloat(place.lat),
                          lng: parseFloat(place.lon),
                        });
                      }
                      setPlaceSuggestions([]);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50/60 transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                        {placeName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        {detail || place.display_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
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

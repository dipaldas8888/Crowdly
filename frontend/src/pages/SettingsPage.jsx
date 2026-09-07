import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import {
  User,
  Shield,
  Key,
  Globe,
  BadgeCheck,
  AlertTriangle,
  Trash2,
  Power,
  Check,
  Loader2,
  Lock,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account"); // "account" | "privacy" | "security"

  // Account form state
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [handle, setHandle] = useState(user?.handle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [dob, setDob] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState(user?.gender || "");
  const [language, setLanguage] = useState(user?.language || "English");
  const [country, setCountry] = useState(user?.country || "");
  const [savingAccount, setSavingAccount] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Privacy state
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [privacy, setPrivacy] = useState({
    whoCanFollow: user?.privacySettings?.whoCanFollow || "Everyone",
    whoCanMessage: user?.privacySettings?.whoCanMessage || "Everyone",
    whoCanComment: user?.privacySettings?.whoCanComment || "Everyone",
    whoCanMention: user?.privacySettings?.whoCanMention || "Everyone",
    whoCanTag: user?.privacySettings?.whoCanTag || "Everyone",
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Modal dialog states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync state when user updates
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setHandle(user.handle || "");
      setBio(user.bio || "");
      setDob(
        user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : ""
      );
      setGender(user.gender || "");
      setLanguage(user.language || "English");
      setCountry(user.country || "");
      setIsPrivate(user.isPrivate || false);
      setPrivacy({
        whoCanFollow: user.privacySettings?.whoCanFollow || "Everyone",
        whoCanMessage: user.privacySettings?.whoCanMessage || "Everyone",
        whoCanComment: user.privacySettings?.whoCanComment || "Everyone",
        whoCanMention: user.privacySettings?.whoCanMention || "Everyone",
        whoCanTag: user.privacySettings?.whoCanTag || "Everyone",
      });
    }
  }, [user]);

  // Save Account Settings
  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      setSavingAccount(true);
      const updatedUser = await apiRequest("/users/settings/account", {
        method: "PUT",
        body: {
          username,
          email,
          phone,
          dateOfBirth: dob,
          gender,
          language,
          country,
          handle,
          bio,
        },
      });
      setUser(updatedUser);
      toast.success("Account settings updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update account settings");
    } finally {
      setSavingAccount(false);
    }
  };

  // Save Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    try {
      setSavingPassword(true);
      await apiRequest("/users/settings/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  // Save Privacy Settings
  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    try {
      setSavingPrivacy(true);
      const updatedUser = await apiRequest("/users/settings/privacy", {
        method: "PUT",
        body: {
          isPrivate,
          privacySettings: privacy,
        },
      });
      setUser(updatedUser);
      toast.success("Privacy settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save privacy settings");
    } finally {
      setSavingPrivacy(false);
    }
  };

  // Deactivate Account
  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await apiRequest("/users/settings/deactivate", { method: "POST" });
      toast.warn("Account deactivated.");
      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to deactivate account");
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await apiRequest("/users/settings/delete", { method: "DELETE" });
      toast.error("Account deleted permanently.");
      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full space-y-4 sm:space-y-6 pb-16 md:pb-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Settings & Preferences
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Manage your account credentials, security, and privacy preferences.
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
            {[
              { key: "account", label: "Account Settings", icon: User },
              { key: "privacy", label: "Privacy Settings", icon: Shield },
              { key: "security", label: "Password & Security", icon: Key },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ACCOUNT SETTINGS */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Account Summary</h3>
                  {user?.isVerified ? (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                      <BadgeCheck className="w-4 h-4" />
                      <span>Verified Account</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
                      Standard Member
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Username *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="+91 XXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Handle */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Handle (@username)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. @jishu"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Gender (Optional)
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>

                    {/* Country/Region */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Country / Region
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. India, USA"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Bio Description
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Write something about yourself..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all resize-none font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-3">
                    <button
                      type="submit"
                      disabled={savingAccount}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingAccount ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Save Account Changes</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone / Account Actions */}
              <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-2xs space-y-4">
                <h3 className="font-bold text-rose-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Account Actions</span>
                </h3>

                <p className="text-xs text-slate-500">
                  Deactivating will temporarily hide your profile. Deleting will permanently remove your account and all your content.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                    <span>Deactivate Account</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY SETTINGS */}
          {activeTab === "privacy" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Account Privacy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control who can see your profile, posts, and interact with you.
                </p>
              </div>

              <form onSubmit={handleSavePrivacy} className="space-y-6 text-xs">
                {/* Private Account Switch */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="private-account-checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor="private-account-checkbox"
                      className="font-bold text-slate-900 text-xs block cursor-pointer"
                    >
                      Private Account
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      If enabled: Only approved followers can see your posts, photos, and videos.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-5">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600">
                    Who can interact with me?
                  </h4>

                  {/* Who can follow you */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Who can follow you?
                    </label>
                    <div className="space-y-1.5 pl-1">
                      {["Everyone", "People you approve"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                        >
                          <input
                            type="radio"
                            name="whoCanFollow"
                            value={option}
                            checked={privacy.whoCanFollow === option}
                            onChange={(e) =>
                              setPrivacy((prev) => ({ ...prev, whoCanFollow: e.target.value }))
                            }
                            className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Who can message you */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Who can message you?
                    </label>
                    <div className="space-y-1.5 pl-1">
                      {["Everyone", "Followers", "Nobody"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                        >
                          <input
                            type="radio"
                            name="whoCanMessage"
                            value={option}
                            checked={privacy.whoCanMessage === option}
                            onChange={(e) =>
                              setPrivacy((prev) => ({ ...prev, whoCanMessage: e.target.value }))
                            }
                            className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Who can comment */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Who can comment on your posts?
                    </label>
                    <div className="space-y-1.5 pl-1">
                      {["Everyone", "Followers", "Nobody"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                        >
                          <input
                            type="radio"
                            name="whoCanComment"
                            value={option}
                            checked={privacy.whoCanComment === option}
                            onChange={(e) =>
                              setPrivacy((prev) => ({ ...prev, whoCanComment: e.target.value }))
                            }
                            className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Who can mention you */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Who can mention you?
                    </label>
                    <div className="space-y-1.5 pl-1">
                      {["Everyone", "Followers", "Nobody"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                        >
                          <input
                            type="radio"
                            name="whoCanMention"
                            value={option}
                            checked={privacy.whoCanMention === option}
                            onChange={(e) =>
                              setPrivacy((prev) => ({ ...prev, whoCanMention: e.target.value }))
                            }
                            className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Who can tag you */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Who can tag you?
                    </label>
                    <div className="space-y-1.5 pl-1">
                      {["Everyone", "Followers", "Nobody"].map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium"
                        >
                          <input
                            type="radio"
                            name="whoCanTag"
                            value={option}
                            checked={privacy.whoCanTag === option}
                            onChange={(e) =>
                              setPrivacy((prev) => ({ ...prev, whoCanTag: e.target.value }))
                            }
                            className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingPrivacy}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingPrivacy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Save Privacy Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PASSWORD & SECURITY */}
          {activeTab === "security" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Change Password</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your password regularly to keep your account safe and secure.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                {/* Current Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Current Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DEACTIVATE MODAL DIALOG */}
          {showDeactivateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Power className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-slate-900 text-base">Deactivate Account?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your profile and content will be temporarily hidden until you sign back in.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivate}
                    disabled={deactivating}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    {deactivating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Deactivate</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE MODAL DIALOG */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-slate-900 text-base">Permanently Delete Account?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This action is irreversible. All your posts, photos, and profile data will be permanently deleted.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

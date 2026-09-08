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
  Bell,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  UserCircle,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active section — matches the nav items
  const [activeSection, setActiveSection] = useState("edit-profile");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
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

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setHandle(user.handle || "");
      setBio(user.bio || "");
      setDob(user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "");
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

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      setSavingAccount(true);
      const updatedUser = await apiRequest("/users/settings/account", {
        method: "PUT",
        body: { username, email, phone, dateOfBirth: dob, gender, language, country, handle, bio },
      });
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match!");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
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
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    try {
      setSavingPrivacy(true);
      const updatedUser = await apiRequest("/users/settings/privacy", {
        method: "PUT",
        body: { isPrivate, privacySettings: privacy },
      });
      setUser(updatedUser);
      toast.success("Privacy settings saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save privacy settings");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await apiRequest("/users/settings/deactivate", { method: "POST" });
      toast.warn("Account deactivated.");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Failed to deactivate account");
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await apiRequest("/users/settings/delete", { method: "DELETE" });
      toast.error("Account deleted permanently.");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Nav sections definition ──────────────────────────────────────
  const navGroups = [
    {
      label: "Your Account",
      items: [
        { key: "edit-profile", icon: UserCircle, label: "Edit Profile" },
        { key: "account-info", icon: User, label: "Account Information" },
        { key: "password", icon: Key, label: "Password & Security" },
      ],
    },
    {
      label: "Who can see your content",
      items: [
        { key: "privacy", icon: Shield, label: "Account Privacy" },
        { key: "interactions", icon: Bell, label: "Interactions" },
      ],
    },
    {
      label: "Manage Account",
      items: [
        { key: "danger", icon: AlertTriangle, label: "Account Actions", danger: true },
      ],
    },
  ];

  const navLabel = navGroups
    .flatMap((g) => g.items)
    .find((i) => i.key === activeSection)?.label || "Settings";

  const handleNav = (key) => {
    setActiveSection(key);
    setMobileNavOpen(false);
  };

  // ── Privacy radio helper ────────────────────────────────────────
  const PrivacyRadio = ({ name, field, options }) => (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <p className="text-sm font-bold text-slate-800 mb-3">{name}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              privacy[field] === opt
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name={field}
              value={opt}
              checked={privacy[field] === opt}
              onChange={(e) => setPrivacy((prev) => ({ ...prev, [field]: e.target.value }))}
              className="sr-only"
            />
            {privacy[field] === opt && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  // ── Field input helper ──────────────────────────────────────────
  const Field = ({ label, icon: Icon, children }) => (
    <div>
      <label className="text-xs font-bold text-slate-700 block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        {children}
      </div>
    </div>
  );

  const inputCls = (hasIcon = true) =>
    `w-full bg-slate-50 border border-slate-200 rounded-xl ${hasIcon ? "pl-9" : "px-3.5"} pr-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-800 text-xs transition-all font-medium`;

  // ── Sidebar left nav ────────────────────────────────────────────
  const SettingsNav = () => (
    <nav className="flex flex-col gap-0.5">
      {/* Search bar at top */}
      <div className="relative mb-3">
        <Settings className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search settings…"
          className="w-full bg-slate-100 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-all"
          readOnly
        />
      </div>

      {navGroups.map((group) => (
        <div key={group.label} className="mb-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-1">
            {group.label}
          </p>
          {group.items.map(({ key, icon: Icon, label, danger }) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                activeSection === key
                  ? danger
                    ? "bg-rose-50 text-rose-600"
                    : "bg-blue-50 text-blue-700"
                  : danger
                  ? "text-rose-500 hover:bg-rose-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {activeSection === key && (
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
              )}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );

  // ── Content panels ──────────────────────────────────────────────
  const renderContent = () => {
    switch (activeSection) {

      // ── Edit Profile ────────────────────────────────────────────
      case "edit-profile":
        return (
          <div className="space-y-6">
            <SectionHeader title="Edit Profile" subtitle="Update your public profile information." />

            {/* Avatar Strip */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                alt={user?.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 truncate">{user?.handle || user?.email}</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Change photo
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Username *" icon={User}>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputCls()} />
                </Field>
                <Field label="Handle (@username)" icon={null}>
                  <input type="text" placeholder="@jishu" value={handle} onChange={(e) => setHandle(e.target.value)} className={inputCls(false)} />
                </Field>
              </div>
              <Field label="Bio">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={150}
                  placeholder="Write something about yourself…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-800 text-xs transition-all resize-none font-medium"
                />
                <p className="text-right text-[10px] text-slate-400 mt-0.5">{bio.length}/150</p>
              </Field>

              <SaveBtn saving={savingAccount} label="Save Profile" />
            </form>
          </div>
        );

      // ── Account Information ─────────────────────────────────────
      case "account-info":
        return (
          <div className="space-y-6">
            <SectionHeader title="Account Information" subtitle="Manage your personal details and preferences." />
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address *" icon={Mail}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls()} />
                </Field>
                <Field label="Phone Number" icon={Phone}>
                  <input type="text" placeholder="+91 XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls()} />
                </Field>
                <Field label="Date of Birth" icon={Calendar}>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls()} />
                </Field>
                <Field label="Gender (Optional)" icon={null}>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls(false) + " cursor-pointer"}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </Field>
                <Field label="Language" icon={null}>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls(false) + " cursor-pointer"}>
                    {["English","Spanish","French","German","Hindi"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Country / Region" icon={Globe}>
                  <input type="text" placeholder="e.g. India, USA" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls()} />
                </Field>
              </div>

              {/* Verification badge */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <BadgeCheck className={`w-4 h-4 shrink-0 ${user?.isVerified ? "text-blue-500" : "text-slate-300"}`} />
                <span className="text-xs font-semibold text-slate-700">
                  {user?.isVerified ? "Verified Account" : "Account not verified"}
                </span>
              </div>

              <SaveBtn saving={savingAccount} label="Save Changes" />
            </form>
          </div>
        );

      // ── Password & Security ─────────────────────────────────────
      case "password":
        return (
          <div className="space-y-6">
            <SectionHeader title="Password & Security" subtitle="Keep your account safe with a strong password." />
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Field label="Current Password *" icon={Lock}>
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={inputCls() + " pr-10"}
                />
                <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
              <Field label="New Password *" icon={Lock}>
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={inputCls() + " pr-10"}
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
              <Field label="Confirm New Password *" icon={Lock}>
                <input
                  type={showNewPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputCls() + " pr-10"}
                />
              </Field>

              {/* Strength hint */}
              {newPassword.length > 0 && (
                <div className="flex items-center gap-2">
                  {[1,2,3,4].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                      newPassword.length >= level * 3
                        ? level <= 1 ? "bg-rose-400" : level === 2 ? "bg-amber-400" : level === 3 ? "bg-yellow-400" : "bg-emerald-500"
                        : "bg-slate-200"
                    }`} />
                  ))}
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {newPassword.length < 6 ? "Weak" : newPassword.length < 9 ? "Fair" : newPassword.length < 12 ? "Good" : "Strong"}
                  </span>
                </div>
              )}

              <SaveBtn saving={savingPassword} label="Update Password" />
            </form>
          </div>
        );

      // ── Account Privacy ─────────────────────────────────────────
      case "privacy":
        return (
          <div className="space-y-6">
            <SectionHeader title="Account Privacy" subtitle="Control who can see your profile and content." />
            <form onSubmit={handleSavePrivacy} className="space-y-4">
              {/* Private account toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-900">Private Account</p>
                  <p className="text-xs text-slate-500 mt-0.5">Only approved followers can see your posts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 ${isPrivate ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPrivate ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <PrivacyRadio name="Who can follow you?" field="whoCanFollow" options={["Everyone", "People you approve"]} />
              <SaveBtn saving={savingPrivacy} label="Save Privacy" />
            </form>
          </div>
        );

      // ── Interactions ────────────────────────────────────────────
      case "interactions":
        return (
          <div className="space-y-4">
            <SectionHeader title="Interactions" subtitle="Control how others can interact with you." />
            <form onSubmit={handleSavePrivacy} className="space-y-1">
              <PrivacyRadio name="Who can message you?" field="whoCanMessage" options={["Everyone","Followers","Nobody"]} />
              <PrivacyRadio name="Who can comment on your posts?" field="whoCanComment" options={["Everyone","Followers","Nobody"]} />
              <PrivacyRadio name="Who can mention you?" field="whoCanMention" options={["Everyone","Followers","Nobody"]} />
              <PrivacyRadio name="Who can tag you?" field="whoCanTag" options={["Everyone","Followers","Nobody"]} />
              <div className="pt-4">
                <SaveBtn saving={savingPrivacy} label="Save Interaction Settings" />
              </div>
            </form>
          </div>
        );

      // ── Danger Zone ─────────────────────────────────────────────
      case "danger":
        return (
          <div className="space-y-4">
            <SectionHeader title="Account Actions" subtitle="Permanent and irreversible account operations." />

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Deactivate Account</p>
                  <p className="text-xs text-slate-500">Temporarily hide your profile. You can reactivate by signing in.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Power className="w-4 h-4" /> Deactivate Account
              </button>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Delete Account</p>
                  <p className="text-xs text-slate-500">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Account Permanently
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        {/* ── Settings Two-Panel Layout ── */}
        <main className="flex-1 min-w-0 flex h-[calc(100vh-3.5rem)] overflow-hidden pb-14 md:pb-0">

          {/* Left Settings Nav Panel */}
          <aside className={`
            w-full md:w-64 lg:w-72 shrink-0
            bg-white border-r border-slate-200/80
            flex flex-col
            overflow-y-auto
            transition-transform duration-300
            ${mobileNavOpen ? "fixed inset-0 z-40 w-72 shadow-2xl" : "hidden md:flex"}
          `}>
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-black text-slate-900 text-base">Settings</h2>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex-1">
              <SettingsNav />
            </div>
          </aside>

          {/* Backdrop for mobile nav */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
          )}

          {/* Right Content Panel */}
          <div className="flex-1 overflow-y-auto">
            {/* Mobile top bar with current section name */}
            <div className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <Settings className="w-5 h-5" />
              </button>
              <span className="font-bold text-slate-900 text-sm">{navLabel}</span>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
              {renderContent()}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* ── Deactivate Modal ── */}
      {showDeactivateModal && (
        <ConfirmModal
          icon={<Power className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-100"
          title="Deactivate Account?"
          description="Your profile and content will be temporarily hidden. You can reactivate by signing in again."
          confirmLabel="Deactivate"
          confirmCls="bg-amber-500 hover:bg-amber-600 text-white"
          onCancel={() => setShowDeactivateModal(false)}
          onConfirm={handleDeactivate}
          loading={deactivating}
        />
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <ConfirmModal
          icon={<Trash2 className="w-6 h-6 text-rose-600" />}
          iconBg="bg-rose-100"
          title="Delete Account Permanently?"
          description="All your data, posts, messages and connections will be removed forever. This action cannot be undone."
          confirmLabel="Delete Forever"
          confirmCls="bg-rose-600 hover:bg-rose-700 text-white"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="pb-4 border-b border-slate-100">
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function SaveBtn({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
}

function ConfirmModal({ icon, iconBg, title, description, confirmLabel, confirmCls, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mx-auto`}>
          {icon}
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 ${confirmCls}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState } from "react";
import { Trash2, Camera, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { UploadService } from "../../services/upload.service";

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  avatarUrl: string;
  authProvider?: "local" | "google";
}

interface ProfileTabProps {
  profileForm: ProfileFormData;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  onSaveProfile: (e: React.FormEvent) => Promise<void>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profileForm,
  setProfileForm,
  onSaveProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const isGoogleAuth = profileForm.authProvider === "google";
  const isGoogleAvatar =
    isGoogleAuth &&
    profileForm.avatarUrl &&
    profileForm.avatarUrl.includes("googleusercontent.com");

  // Handle uploading picture to Supabase bucket 'aurevilux-user'
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPEG, PNG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Profile portrait must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const publicUrl = await UploadService.uploadAvatar(file);
      setProfileForm((prev) => ({
        ...prev,
        avatarUrl: publicUrl,
      }));
      setUploadSuccess("Portrait uploaded successfully to atelier storage.");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setUploadError(
        err.response?.data?.message || err.message || "Failed to upload portrait to storage."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setProfileForm((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
    setUploadSuccess("Custom portrait removed. Monogram will be displayed.");
  };

  // Compute initials for luxury monogram
  const getInitials = (fullName: string) => {
    if (!fullName) return "AU";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-5xl">
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
          Personal Profile
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Update client credentials, contact records, and bespoke portrait.
        </p>
      </div>

      <form
        onSubmit={onSaveProfile}
        className="border border-zinc-900 bg-zinc-950/60 p-6 md:p-8 rounded-lg space-y-6 w-full"
      >
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-zinc-900 pb-6">
          <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-brand-gold/40 bg-zinc-900 flex-shrink-0 flex items-center justify-center shadow-lg shadow-black">
            {profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt={profileForm.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-2xl font-bold text-brand-gold tracking-widest">
                {getInitials(profileForm.name)}
              </span>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
                Atelier Portrait
              </span>
              {isGoogleAvatar && (
                <span className="bg-blue-950/40 border border-blue-800 text-blue-400 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                  Google Account Picture
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-500">
              Upload a high-resolution portrait (JPEG, PNG, WEBP, up to 5MB). Stored securely in private atelier storage.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-brand-gold text-white text-[10px] font-bold tracking-widest rounded uppercase transition-colors disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5 text-brand-gold" />
                <span>{profileForm.avatarUrl ? "Change Portrait" : "Upload Portrait"}</span>
              </button>

              {profileForm.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 hover:bg-red-950/40 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-red-400 text-[10px] font-bold tracking-widest rounded uppercase transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {uploadError && (
              <p className="text-red-400 text-[11px] font-mono pt-1">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="text-emerald-400 text-[11px] font-mono pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{uploadSuccess}</span>
              </p>
            )}
          </div>
        </div>

        {/* Profile Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="space-y-1">
            <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lady Vivienne Westwood"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white rounded outline-none focus:border-brand-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={profileForm.email}
                className="w-full bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-2.5 text-zinc-400 rounded outline-none cursor-not-allowed font-mono"
              />
              {isGoogleAuth && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-brand-gold font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-brand-gold" />
                  <span>Google Verified</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm({ ...profileForm, phone: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white rounded outline-none focus:border-brand-gold/50 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
              Date of Birth
            </label>
            <input
              type="date"
              value={profileForm.birthday}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  birthday: e.target.value,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white rounded outline-none focus:border-brand-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
              Gender Identity
            </label>
            <select
              value={profileForm.gender || "prefer-not-to-say"}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  gender: e.target.value,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-white rounded outline-none focus:border-brand-gold/50 cursor-pointer"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900 flex justify-end">
          <button
            type="submit"
            className="bg-brand-gold hover:bg-brand-goldHover text-brand-black px-6 py-2.5 text-xs font-bold tracking-widest rounded uppercase transition-colors"
          >
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};

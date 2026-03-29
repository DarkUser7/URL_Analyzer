import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Profile() {
  const { user, token } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  // Update profile in database
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, info, name }),
      });
      if (res.ok) {
        setSuccess("Profile updated successfully");
      } else {
        const data = await res.json();
        setError(data.message || "Profile update failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (res.ok) {
        setSuccess("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
      } else {
        const data = await res.json();
        setError(data.message || "Change failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6 mb-8">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                data-testid="input-name"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
              <Input
                type="text"
                placeholder="Personal Info (optional)"
                value={info}
                onChange={e => setInfo(e.target.value)}
                data-testid="input-info"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-update-profile">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
                data-testid="input-old-password"
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                data-testid="input-new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-change-password">
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

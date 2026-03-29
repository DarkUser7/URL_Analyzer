import GuestBanner from "../GuestBanner";

export default function GuestBannerExample() {
  return (
    <div className="p-6 max-w-4xl space-y-4">
      <GuestBanner scansUsed={2} maxScans={5} onLogin={() => console.log("Login clicked")} />
      <GuestBanner scansUsed={4} maxScans={5} onLogin={() => console.log("Login clicked")} />
    </div>
  );
}

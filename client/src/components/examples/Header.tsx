import Header from "../Header";

export default function HeaderExample() {
  return (
    <div className="space-y-4">
      <Header
        isAuthenticated={false}
        onLogin={() => console.log("Login clicked")}
      />
      <Header
        isAuthenticated={true}
        user={{
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        }}
        onLogout={() => console.log("Logout clicked")}
        onProfile={() => console.log("Profile clicked")}
      />
    </div>
  );
}

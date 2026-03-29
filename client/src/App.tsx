import { Switch, Route, Redirect, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import NotFound from "./pages/not-found";

function Router() {
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/dashboard" component={Dashboard} />
            <PrivateRoute path="/change-password" component={ChangePassword} />
            <PrivateRoute path="/profile" component={Profile} />
            <Route>404 Not Found</Route>
          </Switch>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );

function PrivateRoute({ component: Component, ...rest }: any) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Component {...rest} />;
}
}

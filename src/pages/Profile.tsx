import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserAuth } from "@/context/UserAuthContext";

const Profile = () => {
  const { user, logout } = useUserAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
        <div className="container mx-auto px-4 py-24 max-w-xl text-center space-y-6">
          <h1 className="text-3xl font-bold">No active session</h1>
          <p className="text-muted-foreground">
            Please log in or sign up from the header to access your personalized dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">My Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Email</h2>
              <p className="mt-2 text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">User ID</h2>
              <p className="mt-2 text-sm font-mono">{user.id}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Last Login</h2>
              <p className="mt-2 text-lg font-semibold">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Recently'}
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

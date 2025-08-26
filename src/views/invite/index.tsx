/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Building,
  XCircle,
  Loader2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const InviteView = () => {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [isAccepting, setIsAccepting] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  // Get basic invitation preview (public endpoint for minimal data)
  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = trpc.invitation.getInvitationPreview.useQuery(
    { token },
    { enabled: !!token }
  );

  // Get detailed invitation info (protected endpoint - only when authenticated)
  const {
    data: inviteData,
    isLoading: inviteLoading,
    error: inviteError,
  } = trpc.invitation.getInvitationInfo.useQuery(
    { token },
    {
      enabled: !!token && isAuthenticated,
      retry: false,
    }
  );

  // Accept invitation mutation (requires auth)
  const acceptInviteMutation = trpc.invitation.accept.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully joined ${data.tenant.name} as ${data.role}!`);
      // Redirect to apps page after successful acceptance
      setTimeout(() => {
        router.push("/apps");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Failed to accept invitation: ${error.message}`);
      setIsAccepting(false);
    },
  });

  // Accept invitation with signup mutation (public endpoint)
  const acceptWithSignupMutation = trpc.invitation.acceptWithSignup.useMutation(
    {
      onSuccess: (data) => {
        toast.success(
          `Account created and joined ${data.tenant.name} as ${data.role}!`
        );
        // Redirect to login page after successful signup
        setTimeout(() => {
          router.push(
            "/login?message=Account created successfully. Please sign in."
          );
        }, 2000);
      },
      onError: (error) => {
        toast.error(`Failed to create account: ${error.message}`);
        setIsAccepting(false);
      },
    }
  );

  const handleAcceptInvitation = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (!token) {
      toast.error("Invalid invitation token");
      return;
    }

    setIsAccepting(true);
    acceptInviteMutation.mutate({ token });
  };

  const handleSignIn = () => {
    const returnUrl = encodeURIComponent(window.location.pathname);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleSignUp = () => {
    // Show signup form instead of redirecting to register page
    if (previewData) {
      setSignupData((prev) => ({ ...prev, email: previewData.email }));
    }
    setShowSignupForm(true);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!signupData.password || signupData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsAccepting(true);
    acceptWithSignupMutation.mutate({
      token,
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
    });
  };

  // Loading state
  if (sessionLoading || previewLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error states for preview (token invalid/expired)
  if (previewError || !previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Invalid Invitation</h3>
              <p className="text-muted-foreground mb-4">
                {previewError?.message ||
                  "This invitation link is invalid or has expired."}
              </p>
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user email matches invitation (only after auth)
  const emailMatches =
    isAuthenticated && session.user.email === previewData.email;

  // Success state after accepting
  if (acceptInviteMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Welcome to the Team!
              </h3>
              <p className="text-muted-foreground mb-4">
                You have successfully joined{" "}
                {acceptInviteMutation.data?.tenant.name} as a{" "}
                <Badge variant="outline" className="capitalize">
                  {acceptInviteMutation.data?.role}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Redirecting you to the dashboard...
              </p>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state after signup and accepting
  if (acceptWithSignupMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-muted-foreground mb-4">
                {`Your account has been created and you've joined{" "}`}
                {acceptWithSignupMutation.data?.tenant.name} as a{" "}
                <Badge variant="outline" className="capitalize">
                  {acceptWithSignupMutation.data?.role}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Redirecting you to sign in...
              </p>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {previewData.tenantLogo ? (
              <img
                src={previewData.tenantLogo}
                alt={`${previewData.tenantName} logo`}
                className="h-16 w-16 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.style.display = "none";
                  const placeholder = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center"
              style={{ display: previewData.tenantLogo ? "none" : "flex" }}
            >
              <Building className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{`You're Invited!`}</h1>
          <p className="text-lg text-muted-foreground">
            Join <span className="font-semibold">{previewData.tenantName}</span>{" "}
            team
          </p>
        </div>

        {/* Basic Invitation Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Invited Email */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Invited Email:</span>
              <span className="font-medium">{previewData.email}</span>
            </div>

            {/* Organization */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Organization:</span>
              <span className="font-medium">{previewData.tenantName}</span>
            </div>

            {/* Detailed info only shown when authenticated and email matches */}
            {isAuthenticated && inviteData && emailMatches && (
              <>
                {/* Role */}
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="capitalize">
                    {inviteData.invitation.role}
                  </Badge>
                </div>

                {/* Invited By */}
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Invited By:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {inviteData.invitation.invitedBy.name
                          ?.substring(0, 2)
                          .toUpperCase() || "IN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {inviteData.invitation.invitedBy.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inviteData.invitation.invitedBy.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiry */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Expires:</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">
                      {inviteData.daysUntilExpiry > 0 ? (
                        <>
                          In {inviteData.daysUntilExpiry} day
                          {inviteData.daysUntilExpiry !== 1 ? "s" : ""}
                        </>
                      ) : (
                        "Today"
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Authentication and Action Section */}
        <Card>
          <CardContent className="py-6">
            {!isAuthenticated ? (
              !showSignupForm ? (
                // Not authenticated - show sign in/up options
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Sign in to accept invitation
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You need to sign in with the email{" "}
                    <strong>{previewData.email}</strong> to accept this
                    invitation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleSignIn}
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSignUp}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                </div>
              ) : (
                // Show signup form
                <div>
                  <div className="text-center mb-6">
                    <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Create Your Account
                    </h3>
                    <p className="text-muted-foreground">
                      Fill out the form below to create your account and join{" "}
                      <strong>{previewData.tenantName}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={signupData.email}
                        disabled
                        className="bg-muted mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This is the email address you were invited to
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Create a password (min. 8 characters)"
                        className="mt-2"
                        required
                        minLength={8}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        type="submit"
                        variant="origin"
                        disabled={
                          isAccepting || acceptWithSignupMutation.isPending
                        }
                        className="flex items-center gap-2"
                      >
                        {isAccepting || acceptWithSignupMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Create Account & Join
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSignupForm(false)}
                        disabled={
                          isAccepting || acceptWithSignupMutation.isPending
                        }
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </div>
              )
            ) : inviteLoading ? (
              // Loading detailed invitation info
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Loading invitation details...
                </p>
              </div>
            ) : inviteError ? (
              // Error loading detailed info (likely email mismatch)
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-4">
                  This invitation is for <strong>{previewData.email}</strong>,
                  {`but you're signed in as`}{" "}
                  <strong>{session.user.email}</strong>.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Please sign in with the correct email address to accept this
                  invitation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleSignIn} variant="outline">
                    Sign in with different account
                  </Button>
                  <Button onClick={() => authClient.signOut()} variant="ghost">
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : inviteData && emailMatches ? (
              // Authenticated with correct email - show accept button
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to join!</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to accept your invitation and join{" "}
                  <strong>{inviteData.invitation.tenant.name}</strong> as a{" "}
                  <Badge variant="outline" className="capitalize">
                    {inviteData.invitation.role}
                  </Badge>
                </p>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={isAccepting || acceptInviteMutation.isPending}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isAccepting || acceptInviteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting Invitation...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Footer - only show when detailed info is available */}
        {inviteData && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>
              This invitation was sent on{" "}
              {formatDistanceToNow(new Date(inviteData.invitation.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteView;

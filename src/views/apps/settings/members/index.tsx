"use client";

import { useState } from "react";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Calendar,
  Users,
  Shield,
  Crown,
} from "lucide-react";
import Link from "next/link";

const MembersView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  // Get user profile to determine current tenant
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();

  // Get user's tenants
  const { data: userTenants } = trpc.tenant.getUserTenants.useQuery();

  // Use first tenant as default, or user can select
  const currentTenantId = selectedTenantId || userProfile?.tenantId || "";

  // Get members for current tenant
  const { data: membersData, isLoading: membersLoading } =
    trpc.tenant.getMembers.useQuery(
      { tenantId: currentTenantId },
      {
        enabled: !!currentTenantId,
        refetchOnWindowFocus: false,
      }
    );

  // Get pending invitations
  const { data: invitationsData } = trpc.invitation.getByTenant.useQuery(
    { tenantId: currentTenantId },
    {
      enabled: !!currentTenantId,
      refetchOnWindowFocus: false,
    }
  );

  // Filter members based on search
  const filteredMembers =
    membersData?.members.filter(
      (member) =>
        member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Check if current user can invite members
  const canInviteMembers =
    userProfile?.role && ["superadmin", "admin"].includes(userProfile.role);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentTenantId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Tenant Available
              </h3>
              <p className="text-muted-foreground mb-4">
                You need to be part of a tenant to manage members.
              </p>
              <Button asChild>
                <Link href="/apps">Go to Apps</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>

        {canInviteMembers && (
          <Button asChild>
            <Link href="/apps/settings/members/invite">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Link>
          </Button>
        )}
      </div>

      {/* Tenant Selector (if user has multiple tenants) */}
      {userTenants && userTenants.tenants.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userTenants.tenants.map((tenant) => (
                <Button
                  key={tenant.tenant.id}
                  variant={
                    tenant.tenant.id === currentTenantId ? "default" : "outline"
                  }
                  onClick={() => setSelectedTenantId(tenant.tenant.id)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium">{tenant.tenant.name}</div>
                    <div className="text-xs opacity-70">
                      Your role: {tenant.role}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">
                  {membersData?.members.length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">
                  {invitationsData?.invitations.length || 0}
                </p>
              </div>
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {membersData?.members.filter((m) =>
                    ["admin", "superadmin"].includes(m.role)
                  ).length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search members by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {canInviteMembers && (
              <Button variant="outline" asChild>
                <Link href="/apps/settings/invitations">
                  View Invitations ({invitationsData?.invitations.length || 0})
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({filteredMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No members found" : "No members yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start by inviting team members to join your organization"}
              </p>
              {canInviteMembers && !searchQuery && (
                <Button asChild>
                  <Link href="/apps/settings/members/invite">
                    <UserPlus className="h-4 w-4" />
                    Invite First Member
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.user.name}</h3>
                        {member.user.id === userProfile.userId && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getRoleColor(member.role)}
                      className="flex items-center gap-1"
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          member.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {canInviteMembers &&
                      member.user.id !== userProfile.userId && (
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MembersView;

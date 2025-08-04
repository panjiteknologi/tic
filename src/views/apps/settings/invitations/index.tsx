"use client";

import { useState } from "react";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  ArrowLeft,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FilterState {
  status: "all" | "pending" | "accepted" | "expired";
  search: string;
}

const InvitationsView = () => {
  const [filter, setFilter] = useState<FilterState>({
    status: "all",
    search: "",
  });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Get user profile to determine current tenant
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();
  const currentTenantId = userProfile?.tenantId || "";

  // Get invitations
  const {
    data: invitationsData,
    isLoading,
    refetch,
  } = trpc.invitation.getByTenant.useQuery(
    { tenantId: currentTenantId },
    { enabled: !!currentTenantId }
  );

  // Get invitation stats
  const { data: inviteStats } = trpc.invitation.getStats.useQuery(
    { tenantId: currentTenantId },
    { enabled: !!currentTenantId }
  );

  // Resend invitation mutation
  const resendInviteMutation = trpc.invitation.resend.useMutation({
    onSuccess: (data) => {
      toast.success(`Invitation resent to ${data.invitation.email}!`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to resend invitation: ${error.message}`);
    },
  });

  // Cancel invitation mutation
  const cancelInviteMutation = trpc.invitation.cancel.useMutation({
    onSuccess: () => {
      toast.success("Invitation cancelled successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel invitation: ${error.message}`);
    },
  });

  const handleResendInvitation = (invitationId: string) => {
    resendInviteMutation.mutate({ invitationId });
  };

  const handleCancelInvitation = (invitationId: string) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      cancelInviteMutation.mutate({ invitationId });
    }
  };

  const copyToClipboard = async (url: string, email: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invitation URL copied to clipboard!");
      setCopiedUrl(email);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const getInvitationStatus = (invitation: any) => {
    const now = new Date();
    if (invitation.acceptedAt) {
      return { status: "accepted", label: "Accepted", color: "bg-green-500" };
    }
    if (new Date(invitation.expiresAt) < now) {
      return { status: "expired", label: "Expired", color: "bg-red-500" };
    }
    return { status: "pending", label: "Pending", color: "bg-yellow-500" };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Filter invitations
  const filteredInvitations =
    invitationsData?.invitations.filter((invitation) => {
      const inviteStatus = getInvitationStatus(invitation);
      const matchesStatus =
        filter.status === "all" || inviteStatus.status === filter.status;
      const matchesSearch =
        invitation.email.toLowerCase().includes(filter.search.toLowerCase()) ||
        invitation.invitedBy.name
          ?.toLowerCase()
          .includes(filter.search.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  if (!userProfile?.tenantId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Tenant Available
              </h3>
              <p className="text-muted-foreground mb-4">
                You need to be part of a tenant to view invitations.
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

  if (
    !userProfile.role ||
    !["superadmin", "admin"].includes(userProfile.role)
  ) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">
                Only superadmin or admin can view invitations.
              </p>
              <Button asChild>
                <Link href="/apps/settings/members">Back to Members</Link>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/apps/settings/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Team Invitations</h1>
            <p className="text-muted-foreground">
              Manage invitations for {userProfile.tenantName}
            </p>
          </div>
        </div>
        <Button asChild variant={"origin"}>
          <Link href="/apps/settings/members/invite">
            <UserPlus className="h-4 w-4 mr-2" />
            Send Invitation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {inviteStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                  <p className="text-2xl font-bold">{inviteStats.total}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{inviteStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">{inviteStats.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold">{inviteStats.expired}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or inviter name..."
                  value={filter.search}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    {filter.status === "all"
                      ? "All Status"
                      : filter.status.charAt(0).toUpperCase() +
                        filter.status.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setFilter({ ...filter, status: "all" })}
                  >
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilter({ ...filter, status: "pending" })}
                  >
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilter({ ...filter, status: "accepted" })}
                  >
                    Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilter({ ...filter, status: "expired" })}
                  >
                    Expired
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations ({filteredInvitations.length})</CardTitle>
          <CardDescription>
            Manage all team invitations and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">Loading invitations...</span>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Invitations Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {filter.status !== "all" || filter.search
                  ? "No invitations match your current filters."
                  : "You haven't sent any invitations yet."}
              </p>
              {(!filter.status || filter.status === "all") &&
                !filter.search && (
                  <Button asChild>
                    <Link href="/apps/settings/members/invite">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send First Invitation
                    </Link>
                  </Button>
                )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  const invitationUrl = `${window.location.origin}/invite?token=${invitation.token}`;

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <Badge
                            variant="secondary"
                            className={`text-white ${status.color}`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invitation.invitedBy.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invitation.invitedBy.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(invitation.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        {status.status === "expired" ? (
                          <span className="text-red-600 text-sm">Expired</span>
                        ) : invitation.acceptedAt ? (
                          <span className="text-green-600 text-sm">
                            {formatDistanceToNow(
                              new Date(invitation.acceptedAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {formatDistanceToNow(
                              new Date(invitation.expiresAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {status.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    copyToClipboard(
                                      invitationUrl,
                                      invitation.email
                                    )
                                  }
                                >
                                  {copiedUrl === invitation.email ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                  )}
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleResendInvitation(invitation.id)
                                  }
                                  disabled={resendInviteMutation.isPending}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                              </>
                            )}
                            {!invitation.acceptedAt && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancelInvitation(invitation.id)
                                }
                                disabled={cancelInviteMutation.isPending}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationsView;

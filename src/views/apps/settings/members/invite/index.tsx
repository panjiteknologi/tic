/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
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
  UserPlus,
  Mail,
  ArrowLeft,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  Send,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface InviteForm {
  email: string;
  role: "admin" | "member";
}

const InviteView = () => {
  const [inviteMode, setInviteMode] = useState<"single" | "bulk">("single");
  const [singleInvite, setSingleInvite] = useState<InviteForm>({
    email: "",
    role: "member",
  });
  const [bulkInvites, setBulkInvites] = useState<InviteForm[]>([
    { email: "", role: "member" },
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [bulkResults, setBulkResults] = useState<null | any>(null);

  // Get user profile to determine current tenant
  const { data: userProfile } = trpc.user.getUserProfile.useQuery();

  // Current tenant ID
  const currentTenantId = userProfile?.tenantId || "";

  // Get invitation stats
  const { data: inviteStats } = trpc.invitation.getStats.useQuery(
    { tenantId: currentTenantId },
    { enabled: !!currentTenantId }
  );

  // Single invitation mutation
  const sendInviteMutation = trpc.invitation.send.useMutation({
    onSuccess: (data) => {
      setSingleInvite({ email: "", role: "member" });
      toast.success(
        `Invitation sent successfully to ${data.invitation.email}!`
      );
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error.message);
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });

  // Bulk invitation mutation
  const sendBulkInviteMutation = trpc.invitation.sendBulk.useMutation({
    onSuccess: (data: {
      summary: { total: number; successful: number; failed: number };
      results: any[];
      errors: any[];
    }) => {
      setBulkResults(data as any);
      if (data.errors.length === 0) {
        setBulkInvites([{ email: "", role: "member" }]);
        toast.success(
          `All ${data.summary.successful} invitations sent successfully!`
        );
      } else if (data.summary.successful > 0) {
        toast.success(
          `${data.summary.successful} invitations sent successfully, ${data.summary.failed} failed.`
        );
      } else {
        toast.error(`All ${data.summary.failed} invitations failed to send.`);
      }
    },
    onError: (error) => {
      console.error("Failed to send bulk invitations:", error.message);
      toast.error(`Failed to send bulk invitations: ${error.message}`);
    },
  });

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleInvite.email || !currentTenantId) return;

    sendInviteMutation.mutate({
      tenantId: currentTenantId,
      email: singleInvite.email,
      role: singleInvite.role,
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validInvites = bulkInvites.filter(
      (invite) => invite.email.trim() !== ""
    );
    if (validInvites.length === 0 || !currentTenantId) return;

    sendBulkInviteMutation.mutate({
      tenantId: currentTenantId,
      invitations: validInvites,
    });
  };

  const addBulkInvite = () => {
    if (bulkInvites.length < 10) {
      setBulkInvites([...bulkInvites, { email: "", role: "member" }]);
    }
  };

  const removeBulkInvite = (index: number) => {
    if (bulkInvites.length > 1) {
      setBulkInvites(bulkInvites.filter((_, i) => i !== index));
    }
  };

  const updateBulkInvite = (
    index: number,
    field: keyof InviteForm,
    value: string
  ) => {
    const updated = [...bulkInvites];
    updated[index] = { ...updated[index], [field]: value };
    setBulkInvites(updated);
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index ?? 0);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const resetBulkResults = () => {
    setBulkResults(null);
  };

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
                You need to be part of a tenant to invite members.
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
              <X className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">
                Only superadmin or admin can invite members.
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/apps/settings/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Invite Team Members</h1>
          <p className="text-muted-foreground">
            Add new members to {userProfile.tenantName}
          </p>
        </div>
      </div>

      {/* Stats */}
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
                <Users className="h-8 w-8 text-orange-500" />
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
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {inviteStats.acceptanceRate}%
                  </p>
                </div>
                <div className="h-8 w-8 flex items-center justify-center text-green-500 text-2xl">
                  %
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mode Selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Invitation Mode:</span>
            <div className="flex gap-2">
              <Button
                variant={inviteMode === "single" ? "default" : "outline"}
                size="sm"
                onClick={() => setInviteMode("single")}
              >
                Single Invite
              </Button>
              <Button
                variant={inviteMode === "bulk" ? "default" : "outline"}
                size="sm"
                onClick={() => setInviteMode("bulk")}
              >
                Bulk Invite (up to 10)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single Invite Form */}
      {inviteMode === "single" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send Invitation
            </CardTitle>
            <CardDescription>
              Invite a new member to join your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="member@company.com"
                    value={singleInvite.email}
                    onChange={(e) =>
                      setSingleInvite({
                        ...singleInvite,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={singleInvite.role}
                    onChange={(e) =>
                      setSingleInvite({
                        ...singleInvite,
                        role: e.target.value as "admin" | "member",
                      })
                    }
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant={"origin"}
                  disabled={sendInviteMutation.isPending || !singleInvite.email}
                >
                  {sendInviteMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Single Invite Success */}
            {sendInviteMutation.data && (
              <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">
                    Invitation Sent Successfully!
                  </h3>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Invitation sent to {sendInviteMutation.data.invitation.email}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={sendInviteMutation.data.invitationUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(sendInviteMutation.data!.invitationUrl)
                    }
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Single Invite Error */}
            {sendInviteMutation.error && (
              <div className="mt-6 p-4 border rounded-lg bg-red-50 border-red-200">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">
                    {sendInviteMutation.error.message}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk Invite Form */}
      {inviteMode === "bulk" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Invitations
            </CardTitle>
            <CardDescription>
              Invite multiple members at once (maximum 10 invitations)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {bulkInvites.map((invite, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      type="email"
                      placeholder={`member${index + 1}@company.com`}
                      value={invite.email}
                      onChange={(e) =>
                        updateBulkInvite(index, "email", e.target.value)
                      }
                    />
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                      value={invite.role}
                      onChange={(e) =>
                        updateBulkInvite(
                          index,
                          "role",
                          e.target.value as "admin" | "member"
                        )
                      }
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {bulkInvites.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBulkInvite(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                {bulkInvites.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBulkInvite}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={
                    sendBulkInviteMutation.isPending ||
                    bulkInvites.every((inv) => !inv.email)
                  }
                >
                  {sendBulkInviteMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send All Invitations
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Bulk Results */}
            {bulkResults && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Bulk Invitation Results</h3>
                  <Button variant="ghost" size="sm" onClick={resetBulkResults}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {bulkResults?.summary.total}
                    </div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {bulkResults?.summary.successful}
                    </div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {bulkResults?.summary.failed}
                    </div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>

                {/* Successful Invitations */}
                {bulkResults?.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700">
                      Successful Invitations
                    </h4>
                    {bulkResults?.results.map((result: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{result.email}</span>
                            <Badge variant="outline" className="ml-2">
                              {result.role}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(result.invitationUrl, index)
                            }
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Input
                          value={result.invitationUrl}
                          readOnly
                          className="mt-2 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Failed Invitations */}
                {bulkResults?.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-700">
                      Failed Invitations
                    </h4>
                    {bulkResults?.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{error.email}</span>
                          <span className="text-sm text-red-600">
                            {error.error}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/apps/settings/invitations">View All Invitations</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/apps/settings/members">Back to Members</Link>
        </Button>
      </div>
    </div>
  );
};

export default InviteView;

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SettingsSidebar from "@/components/settings-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Building2, Shield, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

export interface SettingsViewProps {
  children?: React.ReactNode;
}

const SettingsView: React.FC<SettingsViewProps> = ({ children }) => {
  const pathname = usePathname();
  const isRootSettings = pathname === "/apps/settings";

  return (
    <div className="flex min-h-screen">
      <SettingsSidebar />
      
      <div className="flex-1 p-6">
        {isRootSettings ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Settings Overview</h1>
              <p className="text-muted-foreground">
                Manage your application settings and team
              </p>
            </div>

            {/* Quick Actions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Organization Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Configure organization details and branding
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/apps/settings/organization">
                      Manage Organization
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Members Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Manage team members and their roles
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/apps/settings/members">
                      Manage Members
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Invitations Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Invitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Send and manage team invitations
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/apps/settings/invitations">
                      Manage Invitations
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Configure security settings and permissions
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/apps/settings/security">
                      Security Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* General Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    General application settings
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/apps/settings/general">
                      General Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SettingsView;
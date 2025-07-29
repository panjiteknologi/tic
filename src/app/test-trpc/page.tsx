"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/react";

export default function TestTRPCPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // Query untuk get all users
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = trpc.test.getUsers.useQuery();

  // Query untuk get user by ID
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = trpc.test.getUserById.useQuery(
    { id: parseInt(userId) },
    { enabled: !!userId && !isNaN(parseInt(userId)) }
  );

  // Mutation untuk create user
  const createUserMutation = trpc.test.createUser.useMutation({
    onSuccess: () => {
      setUserName("");
      setUserEmail("");
      refetchUsers();
    },
  });

  // Mutation untuk update user
  const updateUserMutation = trpc.test.updateUser.useMutation({
    onSuccess: () => {
      refetchUsers();
    },
  });

  const handleCreateUser = () => {
    if (userName && userEmail) {
      createUserMutation.mutate({
        name: userName,
        email: userEmail,
      });
    }
  };

  const handleUpdateUser = () => {
    if (userId && (userName || userEmail)) {
      updateUserMutation.mutate({
        id: parseInt(userId),
        ...(userName && { name: userName }),
        ...(userEmail && { email: userEmail }),
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">tRPC Test Page</h1>

      {/* Get All Users */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-2">
              {usersData?.users.map((user) => (
                <div key={user.id} className="p-2 border rounded">
                  <strong>{user.name}</strong> - {user.email} (ID: {user.id})
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Get User by ID */}
      <Card>
        <CardHeader>
          <CardTitle>Get User by ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            type="number"
          />
          {userLoading && <p>Loading user...</p>}
          {userError && (
            <p className="text-red-500">Error: {userError.message}</p>
          )}
          {userData && (
            <div className="p-2 border rounded bg-green-50">
              <strong>{userData.user.name}</strong> - {userData.user.email}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User */}
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <Button
            onClick={handleCreateUser}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
          {createUserMutation.isSuccess && (
            <p className="text-green-600">User created successfully!</p>
          )}
          {createUserMutation.error && (
            <p className="text-red-500">
              Error: {createUserMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Update User */}
      <Card>
        <CardHeader>
          <CardTitle>Update User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="User ID to update"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            type="number"
          />
          <Input
            placeholder="New name (optional)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input
            placeholder="New email (optional)"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <Button
            onClick={handleUpdateUser}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Updating..." : "Update User"}
          </Button>
          {updateUserMutation.isSuccess && (
            <p className="text-green-600">User updated successfully!</p>
          )}
          {updateUserMutation.error && (
            <p className="text-red-500">
              Error: {updateUserMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

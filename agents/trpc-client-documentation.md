# tRPC Client Documentation - React/Next.js Usage

## Overview

Dokumentasi ini menjelaskan cara menggunakan tRPC router di sisi client (React/Next.js) untuk operasi CRUD (Create, Read, Update, Delete) termasuk router GHG (Greenhouse Gas) terbaru.

## Setup tRPC Client

### 1. Provider Setup

Pastikan aplikasi Anda dibungkus dengan `TRPCProvider`:

```tsx
// src/trpc/react.tsx
import { TRPCProvider } from "@/trpc/react";

export default function App({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
```

### 2. Import tRPC Client

```tsx
import { trpc } from "@/trpc/react";
```

## CRUD Operations

### 1. CREATE (Mutation)

#### Basic Create

```tsx
const createUserMutation = trpc.test.createUser.useMutation({
  onSuccess: (data) => {
    console.log("User created:", data);
    // Refresh data atau redirect
  },
  onError: (error) => {
    console.error("Error creating user:", error.message);
  },
});

// Trigger mutation
const handleCreate = () => {
  createUserMutation.mutate({
    name: "John Doe",
    email: "john@example.com",
  });
};
```

#### Create dengan Optimistic Updates

```tsx
const utils = trpc.useUtils();

const createTenantMutation = trpc.tenant.create.useMutation({
  onMutate: async (newTenant) => {
    // Cancel outgoing refetches
    await utils.tenant.getUserTenants.cancel();

    // Snapshot previous value
    const previousTenants = utils.tenant.getUserTenants.getData();

    // Optimistically update
    utils.tenant.getUserTenants.setData(undefined, (old) => {
      if (!old) return old;
      return {
        tenants: [
          ...old.tenants,
          {
            tenant: newTenant,
            role: "superadmin",
            joinedAt: new Date(),
            isActive: true,
          },
        ],
      };
    });

    return { previousTenants };
  },
  onError: (err, newTenant, context) => {
    // Rollback on error
    utils.tenant.getUserTenants.setData(undefined, context?.previousTenants);
  },
  onSettled: () => {
    // Always refetch after error or success
    utils.tenant.getUserTenants.invalidate();
  },
});
```

### 2. READ (Query)

#### Basic Query

```tsx
const { data, isLoading, error, refetch } =
  trpc.tenant.getUserTenants.useQuery();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return (
  <div>
    {data?.tenants.map((tenant) => (
      <div key={tenant.tenant.id}>
        {tenant.tenant.name} - {tenant.role}
      </div>
    ))}
  </div>
);
```

#### Query dengan Parameters

```tsx
const [tenantId, setTenantId] = useState("");

const { data: tenantData, isLoading } = trpc.tenant.getById.useQuery(
  { tenantId },
  {
    enabled: !!tenantId, // Only run query when tenantId exists
    refetchOnWindowFocus: false, // Disable refetch on window focus
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  }
);
```

#### Conditional Queries

```tsx
const [userId, setUserId] = useState("");

const { data: userData } = trpc.test.getUserById.useQuery(
  { id: parseInt(userId) },
  {
    enabled: !!userId && !isNaN(parseInt(userId)), // Only run when valid userId
    retry: 1, // Only retry once on failure
  }
);
```

#### Infinite Queries (untuk pagination)

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  trpc.tenant.getInfinite.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
```

### 3. UPDATE (Mutation)

#### Basic Update

```tsx
const updateUserMutation = trpc.test.updateUser.useMutation({
  onSuccess: () => {
    // Invalidate and refetch relevant queries
    utils.test.getUsers.invalidate();
    utils.test.getUserById.invalidate();
  },
});

const handleUpdate = (userId: string, updates: any) => {
  updateUserMutation.mutate({
    id: parseInt(userId),
    ...updates,
  });
};
```

#### Update dengan Optimistic Updates

```tsx
const updateTenantLogoMutation = trpc.tenant.updateLogo.useMutation({
  onMutate: async ({ tenantId, logoUrl }) => {
    await utils.tenant.getById.cancel({ tenantId });

    const previousTenant = utils.tenant.getById.getData({ tenantId });

    utils.tenant.getById.setData({ tenantId }, (old) => {
      if (!old) return old;
      return {
        ...old,
        tenant: { ...old.tenant, logo: logoUrl },
      };
    });

    return { previousTenant };
  },
  onError: (err, { tenantId }, context) => {
    utils.tenant.getById.setData({ tenantId }, context?.previousTenant);
  },
  onSettled: (data, error, { tenantId }) => {
    utils.tenant.getById.invalidate({ tenantId });
  },
});
```

### 4. DELETE (Mutation)

#### Basic Delete

```tsx
const deleteUserMutation = trpc.test.deleteUser.useMutation({
  onSuccess: () => {
    utils.test.getUsers.invalidate();
  },
});

const handleDelete = (userId: string) => {
  if (confirm("Are you sure you want to delete this user?")) {
    deleteUserMutation.mutate({ id: parseInt(userId) });
  }
};
```

#### Delete dengan Optimistic Updates

```tsx
const removeMemberMutation = trpc.tenant.removeMember.useMutation({
  onMutate: async ({ memberId, tenantId }) => {
    await utils.tenant.getMembers.cancel({ tenantId });

    const previousMembers = utils.tenant.getMembers.getData({ tenantId });

    utils.tenant.getMembers.setData({ tenantId }, (old) => {
      if (!old) return old;
      return {
        members: old.members.filter((member) => member.id !== memberId),
      };
    });

    return { previousMembers };
  },
  onError: (err, { tenantId }, context) => {
    utils.tenant.getMembers.setData({ tenantId }, context?.previousMembers);
  },
  onSettled: (data, error, { tenantId }) => {
    utils.tenant.getMembers.invalidate({ tenantId });
  },
});
```

## Advanced Usage

### 1. Manual Query Invalidation

```tsx
const utils = trpc.useUtils();

// Invalidate specific query
utils.tenant.getUserTenants.invalidate();

// Invalidate all tenant queries
utils.tenant.invalidate();

// Invalidate with specific input
utils.tenant.getById.invalidate({ tenantId: "123" });
```

### 2. Manual Data Setting

```tsx
const utils = trpc.useUtils();

// Set data manually
utils.tenant.getUserTenants.setData(undefined, {
  tenants: [...newTenants],
});

// Set data with specific input
utils.tenant.getById.setData(
  { tenantId: "123" },
  {
    tenant: updatedTenant,
    userRole: "admin",
  }
);
```

### 3. Prefetching Data

```tsx
const utils = trpc.useUtils();

// Prefetch data
useEffect(() => {
  utils.tenant.getUserTenants.prefetch();
}, []);

// Prefetch with input
const prefetchTenant = (tenantId: string) => {
  utils.tenant.getById.prefetch({ tenantId });
};
```

### 4. Subscription (jika menggunakan WebSocket)

```tsx
const { data } = trpc.notifications.onUpdate.useSubscription(
  { userId: user.id },
  {
    onData: (notification) => {
      console.log("New notification:", notification);
    },
  }
);
```

## Error Handling

### 1. Global Error Handling

```tsx
// src/trpc/react.tsx
export function TRPCProvider(props: PropsWithChildren) {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
          headers: () => ({
            authorization: getAuthHeader(),
          }),
        }),
      ],
      transformer: superjson,
      errorFormatter: ({ shape, error }) => {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError:
              error.code === "BAD_REQUEST" ? error.cause?.zodError : null,
          },
        };
      },
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 2. Component Level Error Handling

```tsx
const { data, error, isLoading } = trpc.tenant.getById.useQuery(
  { tenantId },
  {
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        router.push("/unauthorized");
      } else if (error.data?.code === "NOT_FOUND") {
        router.push("/not-found");
      }
    },
  }
);

// Handle mutation errors
const createMutation = trpc.tenant.create.useMutation({
  onError: (error) => {
    if (error.data?.zodError) {
      // Handle validation errors
      const fieldErrors = error.data.zodError.fieldErrors;
      setFormErrors(fieldErrors);
    } else {
      // Handle other errors
      toast.error(error.message);
    }
  },
});
```

## Best Practices

### 1. Loading States

```tsx
const { data, isLoading, isFetching } = trpc.tenant.getUserTenants.useQuery();

// isLoading: true pada initial load
// isFetching: true ketika refetching
return (
  <div>
    {isLoading ? (
      <div>Initial loading...</div>
    ) : (
      <div>
        {isFetching && <div>Refreshing...</div>}
        {data?.tenants.map((tenant) => (
          <div key={tenant.tenant.id}>{tenant.tenant.name}</div>
        ))}
      </div>
    )}
  </div>
);
```

### 2. Form Integration

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

type CreateTenantForm = z.infer<typeof createTenantSchema>;

const CreateTenantForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
  });

  const createMutation = trpc.tenant.create.useMutation({
    onSuccess: () => {
      reset();
      toast.success("Tenant created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateTenantForm) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Tenant Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("slug")} placeholder="Tenant Slug" />
      {errors.slug && <span>{errors.slug.message}</span>}

      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create Tenant"}
      </button>
    </form>
  );
};
```

### 3. Custom Hooks

```tsx
// hooks/useTenants.ts
export const useTenants = () => {
  return trpc.tenant.getUserTenants.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateTenant = () => {
  const utils = trpc.useUtils();

  return trpc.tenant.create.useMutation({
    onSuccess: () => {
      utils.tenant.getUserTenants.invalidate();
      toast.success("Tenant created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Usage in component
const MyComponent = () => {
  const { data: tenants, isLoading } = useTenants();
  const createTenant = useCreateTenant();

  // ...
};
```

## Contoh Implementasi Lengkap

```tsx
"use client";

import { useState } from "react";
import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TenantManagement() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: tenants, isLoading } = trpc.tenant.getUserTenants.useQuery();

  const { data: selectedTenant } = trpc.tenant.getById.useQuery(
    { tenantId: selectedTenantId },
    { enabled: !!selectedTenantId }
  );

  // Mutations
  const createMutation = trpc.tenant.create.useMutation({
    onSuccess: () => {
      setName("");
      setSlug("");
      utils.tenant.getUserTenants.invalidate();
    },
  });

  const updateMutation = trpc.tenant.updateLogo.useMutation({
    onSuccess: () => {
      utils.tenant.getById.invalidate({ tenantId: selectedTenantId });
    },
  });

  const handleCreate = () => {
    if (name && slug) {
      createMutation.mutate({ name, slug });
    }
  };

  if (isLoading) return <div>Loading tenants...</div>;

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="space-y-4">
        <h2>Create Tenant</h2>
        <Input
          placeholder="Tenant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Tenant Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create"}
        </Button>
      </div>

      {/* Tenant List */}
      <div className="space-y-2">
        <h2>Your Tenants</h2>
        {tenants?.tenants.map((tenant) => (
          <div
            key={tenant.tenant.id}
            className="p-4 border rounded cursor-pointer"
            onClick={() => setSelectedTenantId(tenant.tenant.id)}
          >
            <h3>{tenant.tenant.name}</h3>
            <p>Role: {tenant.role}</p>
          </div>
        ))}
      </div>

      {/* Selected Tenant Details */}
      {selectedTenant && (
        <div className="p-4 border rounded">
          <h2>Tenant Details</h2>
          <p>Name: {selectedTenant.tenant.name}</p>
          <p>Slug: {selectedTenant.tenant.slug}</p>
          <p>Your Role: {selectedTenant.userRole}</p>
        </div>
      )}
    </div>
  );
}
```

## User Profile Router

### Get User Profile with Tenant Details

```tsx
import { trpc } from "@/trpc/react";

// Get current user profile with tenant information
const UserProfile = () => {
  const {
    data: userProfile,
    isLoading,
    error,
  } = trpc.user.getUserProfile.useQuery();

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!userProfile) return <div>No user data</div>;

  return (
    <div className="space-y-4">
      {/* User Details */}
      <div className="border p-4 rounded">
        <h2>User Information</h2>
        <p>
          <strong>Name:</strong> {userProfile.name}
        </p>
        <p>
          <strong>Email:</strong> {userProfile.email}
        </p>
        <p>
          <strong>User ID:</strong> {userProfile.userId}
        </p>
        <p>
          <strong>Email Verified:</strong>{" "}
          {userProfile.emailVerified ? "Yes" : "No"}
        </p>
        {userProfile.image && (
          <img
            src={userProfile.image}
            alt="Profile"
            className="w-12 h-12 rounded-full"
          />
        )}
      </div>

      {/* Tenant Details (if user belongs to a tenant) */}
      {userProfile.tenantId && (
        <div className="border p-4 rounded">
          <h2>Tenant Information</h2>
          <p>
            <strong>Tenant Name:</strong> {userProfile.tenantName}
          </p>
          <p>
            <strong>Tenant ID:</strong> {userProfile.tenantId}
          </p>
          <p>
            <strong>Role:</strong> {userProfile.role}
          </p>
          <p>
            <strong>Slug:</strong> {userProfile.tenantSlug}
          </p>
          {userProfile.tenantDomain && (
            <p>
              <strong>Domain:</strong> {userProfile.tenantDomain}
            </p>
          )}
          {userProfile.tenantLogo && (
            <img
              src={userProfile.tenantLogo}
              alt="Tenant Logo"
              className="w-16 h-16"
            />
          )}
          <p>
            <strong>Joined At:</strong>{" "}
            {new Date(userProfile.joinedAt!).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
```

### Custom Hook for User Profile

```tsx
// hooks/useUserProfile.ts
import { trpc } from "@/trpc/react";

export const useUserProfile = () => {
  return trpc.user.getUserProfile.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Usage in component
const MyComponent = () => {
  const { data: user, isLoading } = useUserProfile();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      {user?.tenantName && (
        <p>
          Organization: {user.tenantName} ({user.role})
        </p>
      )}
    </div>
  );
};
```

### Conditional Rendering Based on User Role

```tsx
const AdminPanel = () => {
  const { data: user } = useUserProfile();

  // Only show admin features if user is superadmin or admin
  if (!user || !["superadmin", "admin"].includes(user.role || "")) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>
        Welcome {user.name} ({user.role})
      </p>
      {/* Admin features */}
    </div>
  );
};
```

### Type-Safe User Profile Usage

```tsx
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type UserProfile = RouterOutput["user"]["getUserProfile"];

const ProfileCard = ({ user }: { user: UserProfile }) => {
  return (
    <div className="profile-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {user.tenantName && (
        <div className="tenant-info">
          <span>{user.tenantName}</span>
          <span className="role-badge">{user.role}</span>
        </div>
      )}
    </div>
  );
};

// Usage
const UserDashboard = () => {
  const { data: user } = trpc.user.getUserProfile.useQuery();

  if (!user) return null;

  return <ProfileCard user={user} />;
};
```

### Available User Profile Fields

```tsx
// Complete user profile structure returned by trpc.user.getUserProfile.useQuery()
interface UserProfile {
  // User Details
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;

  // Tenant Details (null if user has no active tenant)
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
  tenantDomain: string | null;
  tenantLogo: string | null;
  role: "superadmin" | "admin" | "member" | null;
  joinedAt: Date | null;
}
```

### Integration with Authentication

```tsx
import { useRouter } from "next/navigation";

const useAuthenticatedUser = () => {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    error,
  } = trpc.user.getUserProfile.useQuery(undefined, {
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      }
    },
  });

  return { user, isLoading, error };
};

// Usage in protected components
const ProtectedComponent = () => {
  const { user, isLoading } = useAuthenticatedUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null; // Will redirect to login via onError

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Hello {user.name}!</p>
    </div>
  );
};
```

## Router yang Tersedia

Berdasarkan konfigurasi aplikasi, router yang tersedia:

### Core System Routers

- `trpc.hello` - Test endpoint
- `trpc.test` - Test CRUD operations
- `trpc.tenant` - Tenant management
- `trpc.invitation` - Invitation system
- `trpc.user` - User profile & details

### Carbon Calculation Routers

- `trpc.carbonProject` - Carbon project management

### GHG (Greenhouse Gas) Calculation Routers

- `trpc.ghgVerification` - Step 1: GHG verification data management
- `trpc.ghgCalculation` - Step 2: GHG calculation data management
- `trpc.ghgProcess` - Step 3: GHG calculation process data management
- `trpc.ghgAdditional` - Step 3: Additional GHG data management
- `trpc.ghgOtherCase` - Step 3: Other case GHG data management
- `trpc.ghgAudit` - Step 4: GHG audit data management

### Common Operations

Setiap router GHG memiliki operasi standar:

- **`addBulk`** - Create Many record (useMutation)
- **`add`** - Create new record (useMutation)
- **`update`** - Update existing record (useMutation)
- **`delete`** - Delete record (useMutation)
- **`getById`** - Get single record by ID (useQuery)
- **`getByCarbonProjectId`** - Get records by carbon project (useQuery)

### Procedure Types

- **Query**: untuk operasi READ (useQuery)
- **Mutation**: untuk operasi CREATE/UPDATE/DELETE (useMutation)
- **Subscription**: untuk real-time updates (useSubscription) - jika tersedia

## GHG (Greenhouse Gas) Router Examples

### 1. GHG Verification Router (Step 1)

```tsx
// Create GHG verification data
const createGhgVerification = trpc.ghgVerification.add.useMutation({
  onSuccess: () => {
    utils.ghgVerification.getByCarbonProjectId.invalidate();
  },
});

const handleCreateGhgVerification = () => {
  createGhgVerification.mutate({
    carbonProjectId: "project-uuid",
    keterangan: "Initial verification assessment",
    nilaiInt: 100,
    nilaiString: "High priority verification",
    satuan: "kg CO2e",
    source: "Field measurement",
  });
};

// Get all verification data for a project
const { data: verifications } =
  trpc.ghgVerification.getByCarbonProjectId.useQuery({
    carbonProjectId: "project-uuid",
  });

// Update specific verification
const updateVerification = trpc.ghgVerification.update.useMutation();
updateVerification.mutate({
  id: 1,
  keterangan: "Updated verification data",
  nilaiInt: 150,
});

// Delete verification
const deleteVerification = trpc.ghgVerification.delete.useMutation();
deleteVerification.mutate({ id: 1 });

// Get single verification by ID
const { data: verification } = trpc.ghgVerification.getById.useQuery({
  id: 1,
});
```

### 2. GHG Calculation Router (Step 2)

```tsx
// Create GHG calculation data
const createGhgCalculation = trpc.ghgCalculation.add.useMutation({
  onSuccess: () => {
    utils.ghgCalculation.getByCarbonProjectId.invalidate();
    toast.success("GHG calculation created successfully");
  },
  onError: (error) => {
    toast.error(`Failed to create calculation: ${error.message}`);
  },
});

const handleCreateCalculation = () => {
  createGhgCalculation.mutate({
    carbonProjectId: "project-uuid",
    keterangan: "Baseline emission calculations",
    nilaiInt: 250,
    nilaiString: "Medium impact calculation",
    satuan: "tCO2e/ha",
    source: "IPCC guidelines",
  });
};

// Get calculations with loading state
const {
  data: calculations,
  isLoading,
  error,
} = trpc.ghgCalculation.getByCarbonProjectId.useQuery({
  carbonProjectId: "project-uuid",
});

if (isLoading) return <div>Loading calculations...</div>;
if (error) return <div>Error: {error.message}</div>;

return (
  <div>
    {calculations?.stepDuaGhgCalculations.map((calc) => (
      <div key={calc.id}>
        <h3>{calc.keterangan}</h3>
        <p>Value: {calc.nilaiInt || calc.nilaiString}</p>
        <p>Unit: {calc.satuan}</p>
        <p>Source: {calc.source}</p>
      </div>
    ))}
  </div>
);
```

### 3. GHG Process Router (Step 3 - Process)

```tsx
// Create GHG calculation process data
const createGhgProcess = trpc.ghgProcess.add.useMutation({
  onMutate: async (newProcess) => {
    // Optimistic update
    await utils.ghgProcess.getByCarbonProjectId.cancel();
    const previousData = utils.ghgProcess.getByCarbonProjectId.getData({
      carbonProjectId: newProcess.carbonProjectId,
    });

    utils.ghgProcess.getByCarbonProjectId.setData(
      {
        carbonProjectId: newProcess.carbonProjectId,
      },
      (old) => {
        if (!old) return old;
        return {
          stepTigaGhgCalculationProcesses: [
            ...old.stepTigaGhgCalculationProcesses,
            { ...newProcess, id: Date.now() }, // Temporary ID
          ],
        };
      }
    );

    return { previousData };
  },
  onError: (err, newProcess, context) => {
    // Rollback optimistic update
    utils.ghgProcess.getByCarbonProjectId.setData(
      {
        carbonProjectId: newProcess.carbonProjectId,
      },
      context?.previousData
    );
  },
  onSettled: (data, error, variables) => {
    utils.ghgProcess.getByCarbonProjectId.invalidate({
      carbonProjectId: variables.carbonProjectId,
    });
  },
});

const handleCreateProcess = () => {
  createGhgProcess.mutate({
    carbonProjectId: "project-uuid",
    keterangan: "Land use change process evaluation",
    nilaiInt: 75,
    satuan: "kg CO2e/m²",
    source: "Satellite imagery analysis",
  });
};
```

### 4. GHG Additional Router (Step 3 - Additional)

```tsx
// Create additional GHG data
const createGhgAdditional = trpc.ghgAdditional.add.useMutation();

// Form integration with validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const additionalGhgSchema = z.object({
  carbonProjectId: z.string().uuid(),
  keterangan: z.string().min(1, "Description is required"),
  nilaiInt: z.number().optional(),
  nilaiString: z.string().optional(),
  satuan: z.string().optional(),
  source: z.string().optional(),
});

const GhgAdditionalForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(additionalGhgSchema),
  });

  const createAdditional = trpc.ghgAdditional.add.useMutation({
    onSuccess: () => {
      toast.success("Additional data created");
      reset();
    },
  });

  const onSubmit = (data) => {
    createAdditional.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("keterangan")} placeholder="Description" />
      {errors.keterangan && <span>{errors.keterangan.message}</span>}

      <input
        {...register("nilaiInt", { valueAsNumber: true })}
        type="number"
        placeholder="Numeric value"
      />

      <input {...register("satuan")} placeholder="Unit" />

      <button type="submit" disabled={createAdditional.isPending}>
        {createAdditional.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
};
```

### 5. GHG Other Case Router (Step 3 - Other Case)

```tsx
// Create other case GHG data with conditional queries
const [projectId, setProjectId] = useState("");

const createGhgOtherCase = trpc.ghgOtherCase.add.useMutation();

// Only fetch when project is selected
const { data: otherCases } = trpc.ghgOtherCase.getByCarbonProjectId.useQuery(
  { carbonProjectId: projectId },
  {
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  }
);

const handleCreateOtherCase = () => {
  createGhgOtherCase.mutate({
    carbonProjectId: projectId,
    keterangan: "Special case emission factors",
    nilaiString: "Custom calculation method",
    satuan: "kg CO2e/unit",
    source: "Expert judgment",
  });
};

// Bulk operations
const handleBulkDelete = async (ids: number[]) => {
  const deletePromises = ids.map((id) =>
    trpc.ghgOtherCase.delete.mutate({ id })
  );

  try {
    await Promise.all(deletePromises);
    utils.ghgOtherCase.getByCarbonProjectId.invalidate({
      carbonProjectId: projectId,
    });
    toast.success(`Deleted ${ids.length} records`);
  } catch (error) {
    toast.error("Failed to delete some records");
  }
};
```

### 6. GHG Audit Router (Step 4)

```tsx
// Create GHG audit data
const createGhgAudit = trpc.ghgAudit.add.useMutation({
  onSuccess: (data) => {
    console.log("Audit created:", data.stepEmpatGhgAudit);
    utils.ghgAudit.getByCarbonProjectId.invalidate();
  },
});

// Custom hook for audit management
const useGhgAudit = (carbonProjectId: string) => {
  const utils = trpc.useUtils();

  const audits = trpc.ghgAudit.getByCarbonProjectId.useQuery(
    { carbonProjectId },
    { enabled: !!carbonProjectId }
  );

  const createAudit = trpc.ghgAudit.add.useMutation({
    onSuccess: () => {
      audits.refetch();
    },
  });

  const updateAudit = trpc.ghgAudit.update.useMutation({
    onSuccess: () => {
      audits.refetch();
    },
  });

  const deleteAudit = trpc.ghgAudit.delete.useMutation({
    onSuccess: () => {
      audits.refetch();
    },
  });

  return {
    audits: audits.data?.stepEmpatGhgAudits || [],
    isLoading: audits.isLoading,
    createAudit: createAudit.mutate,
    updateAudit: updateAudit.mutate,
    deleteAudit: deleteAudit.mutate,
    isCreating: createAudit.isPending,
    isUpdating: updateAudit.isPending,
    isDeleting: deleteAudit.isPending,
  };
};

// Usage in component
const GhgAuditManager = ({ projectId }: { projectId: string }) => {
  const {
    audits,
    isLoading,
    createAudit,
    updateAudit,
    deleteAudit,
    isCreating,
  } = useGhgAudit(projectId);

  const handleCreateAudit = () => {
    createAudit({
      carbonProjectId: projectId,
      keterangan: "Third-party verification audit",
      nilaiInt: 95,
      nilaiString: "Compliance verified",
      satuan: "% accuracy",
      source: "External auditor report",
    });
  };

  if (isLoading) return <div>Loading audits...</div>;

  return (
    <div>
      <button onClick={handleCreateAudit} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Audit"}
      </button>

      {audits.map((audit) => (
        <div key={audit.id} className="audit-item">
          <h4>{audit.keterangan}</h4>
          <p>Value: {audit.nilaiInt || audit.nilaiString}</p>
          <button
            onClick={() =>
              updateAudit({
                id: audit.id,
                keterangan: "Updated audit data",
              })
            }
          >
            Update
          </button>
          <button onClick={() => deleteAudit({ id: audit.id })}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### 7. Complete GHG Workflow Integration

```tsx
const CompleteGhgWorkflow = ({ carbonProjectId }: { carbonProjectId: string }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({});

  const steps = [
    "GHG Verification",
    "GHG Calculation",
    "GHG Process Analysis",
    "GHG Audit"
  ];

  // Step 1: Verification
  const createVerification = trpc.ghgVerification.add.useMutation({
    onSuccess: () => setCurrentStep(2),
  });

  // Step 2: Calculation
  const createCalculation = trpc.ghgCalculation.add.useMutation({
    onSuccess: () => setCurrentStep(3),
  });

  // Step 3: Process (with additional and other case)
  const createProcess = trpc.ghgProcess.add.useMutation();
  const createAdditional = trpc.ghgAdditional.add.useMutation();
  const createOtherCase = trpc.ghgOtherCase.add.useMutation();

  const handleStep3Complete = async () => {
    try {
      await Promise.all([
        createProcess.mutateAsync({...}),
        createAdditional.mutateAsync({...}),
        createOtherCase.mutateAsync({...}),
      ]);
      setCurrentStep(4);
    } catch (error) {
      console.error("Step 3 failed:", error);
    }
  };

  // Step 4: Audit
  const createAudit = trpc.ghgAudit.add.useMutation({
    onSuccess: () => {
      toast.success("GHG workflow completed!");
      setCurrentStep(5);
    },
  });

  return (
    <div className="ghg-workflow">
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          >
            {step}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <VerificationStep
          onComplete={(data) => {
            createVerification.mutate({
              carbonProjectId,
              ...data
            });
          }}
        />
      )}

      {currentStep === 2 && (
        <CalculationStep
          onComplete={(data) => {
            createCalculation.mutate({
              carbonProjectId,
              ...data
            });
          }}
        />
      )}

      {currentStep === 3 && (
        <ProcessStep
          onComplete={handleStep3Complete}
          carbonProjectId={carbonProjectId}
        />
      )}

      {currentStep === 4 && (
        <AuditStep
          onComplete={(data) => {
            createAudit.mutate({
              carbonProjectId,
              ...data
            });
          }}
        />
      )}

      {currentStep === 5 && (
        <div className="workflow-complete">
          <h2>✅ GHG Workflow Completed!</h2>
          <p>All GHG calculation steps have been successfully completed.</p>
        </div>
      )}
    </div>
  );
};
```

### 8. GHG Data Validation & Error Handling

```tsx
// Custom validation schemas for GHG data
const ghgValidationSchemas = {
  verification: z.object({
    keterangan: z.string().min(5, "Description must be at least 5 characters"),
    nilaiInt: z.number().min(0, "Value must be positive").optional(),
    satuan: z.string().min(1, "Unit is required").optional(),
  }),

  calculation: z.object({
    keterangan: z.string().min(10, "Detailed description required"),
    nilaiInt: z.number().min(0).max(10000, "Value out of range").optional(),
    source: z.string().min(1, "Source must be specified").optional(),
  }),
};

// Error handling with specific GHG error types
const GhgErrorHandler = ({ error }: { error: any }) => {
  if (error?.data?.code === "NOT_FOUND") {
    return <div className="error">Carbon project not found</div>;
  }

  if (error?.data?.code === "FORBIDDEN") {
    return <div className="error">Access denied to this tenant</div>;
  }

  if (error?.data?.zodError) {
    return (
      <div className="validation-errors">
        <div className="mt-2">{Object.entries(error.data.zodError.fieldErrors).map(
          ([field, messages]) => (
            <div key={field} className="field-error">
              <strong>{field}:</strong> {messages?.join(", ")}
            </div>
          )
        )}
      </div>
    );
  }

  return <div className="error">An unexpected error occurred</div>;
};

// Usage with comprehensive error handling
const GhgDataForm = () => {
  const createMutation = trpc.ghgVerification.add.useMutation({
    onError: (error) => {
      console.error("GHG creation failed:", error);
    },
  });

  if (createMutation.error) {
    return <GhgErrorHandler error={createMutation.error} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Processing..." : "Create GHG Data"}
      </button>
    </form>
  );
};
```

## GHG Router Field Specifications

### Common Fields Across All GHG Routers

All GHG routers (`ghgVerification`, `ghgCalculation`, `ghgProcess`, `ghgAdditional`, `ghgOtherCase`, `ghgAudit`) share the same field structure:

```tsx
interface GhgDataStructure {
  id: number; // Auto-generated identity
  carbonProjectId: string; // UUID reference to carbon project
  keterangan: string; // Required description/explanation
  nilaiInt?: number; // Optional integer value
  nilaiString?: string; // Optional string value
  satuan?: string; // Optional unit of measurement
  source?: string; // Optional data source reference
}
```

### Field Usage Guidelines

- **`keterangan`**: Always required, minimum 1 character
- **`nilaiInt`** vs **`nilaiString`**: Use based on data type - numeric calculations use `nilaiInt`, text-based values use `nilaiString`
- **`satuan`**: Recommended for numeric values (e.g., "kg CO2e", "tCO2e/ha", "%")
- **`source`**: Important for audit trails (e.g., "IPCC guidelines", "Field measurement", "Expert judgment")

All GHG routers follow the same CRUD pattern with tenant-based security validation.

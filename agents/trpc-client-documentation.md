# tRPC Client Documentation - React/Next.js Usage

## Overview
Dokumentasi ini menjelaskan cara menggunakan tRPC router di sisi client (React/Next.js) untuk operasi CRUD (Create, Read, Update, Delete).

## Setup tRPC Client

### 1. Provider Setup
Pastikan aplikasi Anda dibungkus dengan `TRPCProvider`:

```tsx
// src/trpc/react.tsx
import { TRPCProvider } from "@/trpc/react";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  );
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
        tenants: [...old.tenants, {
          tenant: newTenant,
          role: 'superadmin',
          joinedAt: new Date(),
          isActive: true,
        }],
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
const { data, isLoading, error, refetch } = trpc.tenant.getUserTenants.useQuery();

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
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = trpc.products.getInfinite.useInfiniteQuery(
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
        members: old.members.filter(member => member.id !== memberId),
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
utils.tenant.getById.setData({ tenantId: "123" }, {
  tenant: updatedTenant,
  userRole: "admin",
});
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
            zodError: error.code === 'BAD_REQUEST' 
              ? error.cause?.zodError 
              : null,
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
      if (error.data?.code === 'FORBIDDEN') {
        router.push('/unauthorized');
      } else if (error.data?.code === 'NOT_FOUND') {
        router.push('/not-found');
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
        {data?.tenants.map(tenant => (
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
        <Button
          onClick={handleCreate}
          disabled={createMutation.isPending}
        >
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

## Router yang Tersedia

Berdasarkan konfigurasi aplikasi, router yang tersedia:

- `trpc.hello` - Test endpoint
- `trpc.test` - Test CRUD operations
- `trpc.tenant` - Tenant management
- `trpc.invitation` - Invitation system
- `trpc.products` - Product management
- `trpc.raws` - Raw materials
- `trpc.carbonProject` - Carbon project management

Setiap router memiliki prosedur yang dapat berupa:
- **Query**: untuk operasi READ (useQuery)
- **Mutation**: untuk operasi CREATE/UPDATE/DELETE (useMutation)
- **Subscription**: untuk real-time updates (useSubscription) - jika tersedia

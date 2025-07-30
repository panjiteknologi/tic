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

### Core System Routers
- `trpc.hello` - Test endpoint
- `trpc.test` - Test CRUD operations
- `trpc.tenant` - Tenant management
- `trpc.invitation` - Invitation system

### Carbon Calculation Routers
- `trpc.carbonProject` - Carbon project management
- `trpc.products` - Product data (corn production)
- `trpc.raws` - Raw materials (seeds & emission factors)
- `trpc.fertilizerNitrogen` - Nitrogen fertilizer calculations
- `trpc.herbicides` - Herbicides & pesticides data
- `trpc.energyDiesel` - Diesel energy consumption
- `trpc.cultivation` - Cultivation emission summaries
- `trpc.actualCarbon` - Actual carbon conditions (current land use)
- `trpc.referenceCarbon` - Reference carbon & LUC calculations

### Common Operations
Setiap router carbon calculation memiliki operasi standar:
- **`add`** - Create new record (useMutation)
- **`update`** - Update existing record (useMutation) 
- **`delete`** - Delete record (useMutation)
- **`getById`** - Get single record by ID (useQuery)
- **`getByCarbonProjectId`** - Get records by carbon project (useQuery)
- **`getByTenantId`** - Get records by tenant (useQuery)

### Procedure Types
- **Query**: untuk operasi READ (useQuery)
- **Mutation**: untuk operasi CREATE/UPDATE/DELETE (useMutation)
- **Subscription**: untuk real-time updates (useSubscription) - jika tersedia

## Carbon Calculation Router Examples

### 1. Products Router (Corn Production Data)
```tsx
// Create product data
const createProduct = trpc.products.add.useMutation({
  onSuccess: () => {
    utils.products.getByCarbonProjectId.invalidate();
  },
});

const handleCreateProduct = () => {
  createProduct.mutate({
    tenantId: "tenant-uuid",
    carbonProjectId: "project-uuid",
    cornWet: "1000.50",
    moistureContent: "25.5",
    cornDry: "745.0",
    cultivationArea: "10.25",
  });
};

// Get products by carbon project
const { data: products } = trpc.products.getByCarbonProjectId.useQuery({
  carbonProjectId: "project-uuid"
});
```

### 2. Fertilizer Nitrogen Router (Complex Calculations)
```tsx
// Create fertilizer nitrogen data
const createFertilizer = trpc.fertilizerNitrogen.add.useMutation();

const handleCreateFertilizer = () => {
  createFertilizer.mutate({
    tenantId: "tenant-uuid",
    carbonProjectId: "project-uuid",
    ammoniumNitrate: "150.0",
    urea: "200.0",
    appliedManure: "500.0",
    totalNSyntheticFertilizer: "350.0",
    emissionFactorAmmoniumNitrate: "5.5",
    emissionFactorUrea: "4.8",
    directN2OEmissions: "125.5",
    co2eqEmissionsNitrogenFertilizersHaYr: "485.75",
  });
};

// Update specific fields
const updateFertilizer = trpc.fertilizerNitrogen.update.useMutation();
updateFertilizer.mutate({
  id: "fertilizer-uuid",
  ammoniumNitrate: "175.0",
  directN2OEmissions: "135.2",
});
```

### 3. Energy & Herbicides Routers
```tsx
// Energy Diesel
const { data: energyData } = trpc.energyDiesel.getByCarbonProjectId.useQuery({
  carbonProjectId: "project-uuid"
});

const createEnergyData = trpc.energyDiesel.add.useMutation();
createEnergyData.mutate({
  tenantId: "tenant-uuid",
  carbonProjectId: "project-uuid", 
  dieselConsumed: "500.75",
  emissionFactorDiesel: "2.68",
  co2eEmissionsDieselYr: "1342.01",
});

// Herbicides
const createHerbicides = trpc.herbicides.add.useMutation();
createHerbicides.mutate({
  tenantId: "tenant-uuid",
  carbonProjectId: "project-uuid",
  acetochlor: "5.25",
  emissionFactorPesticides: "0.85",
  co2eqEmissionsHerbicidesPesticidesHaYr: "12.50",
});
```

### 4. Carbon Condition Routers (LUC Calculations)
```tsx
// Actual Carbon (Current Conditions)
const createActualCarbon = trpc.actualCarbon.add.useMutation();
createActualCarbon.mutate({
  tenantId: "tenant-uuid",
  carbonProjectId: "project-uuid",
  actualLandUse: "Cropland",
  climateRegionActual: "Tropical",
  soilTypeActual: "Clay",
  currentSoilManagementActual: "Full tillage",
  socstActual: "45.50",
  fluActual: "1.00",
  fmgActual: "1.20",
  cvegActual: "2.50",
});

// Reference Carbon (Baseline + LUC Results)
const createReferenceCarbon = trpc.referenceCarbon.add.useMutation();
createReferenceCarbon.mutate({
  tenantId: "tenant-uuid", 
  carbonProjectId: "project-uuid",
  referenceLandUse: "Forest",
  climateRegionReference: "Tropical",
  socstReference: "55.80",
  fluReference: "0.80",
  fmgReference: "1.35",
  soilOrganicCarbonActual: "48.75",
  soilOrganicCarbonReference: "52.20",
  accumulatedSoilCarbon: "-3.45",
  lucCarbonEmissionsPerKgCorn: "0.185",
  totalLUCCO2EmissionsHaYr: "425.80",
  totalLUCCO2EmissionsTDryCorn: "15.65",
});
```

### 5. Cultivation Summary Router
```tsx
// Cultivation aggregates all emission sources
const createCultivation = trpc.cultivation.add.useMutation();
createCultivation.mutate({
  tenantId: "tenant-uuid",
  carbonProjectId: "project-uuid",
  ghgEmissionsRawMaterialInput: "125.50",
  ghgEmissionsFertilizers: "485.75", 
  ghgEmissionsHerbicidesPesticides: "45.25",
  ghgEmissionsEnergy: "235.80",
  totalEmissionsCorn: "892.30", // Sum of all sources
});
```

### 6. Complete Carbon Project Workflow
```tsx
const CarbonProjectForm = () => {
  const [projectId, setProjectId] = useState("");
  const utils = trpc.useUtils();

  // Create carbon project workflow
  const handleCompleteProject = async () => {
    try {
      // 1. Create project
      const project = await trpc.carbonProject.create.mutate({
        tenantId: "tenant-uuid",
        name: "Corn Farm 2024",
      });
      
      setProjectId(project.carbonProject.id);

      // 2. Add product data
      await trpc.products.add.mutate({
        tenantId: "tenant-uuid",
        carbonProjectId: project.carbonProject.id,
        cornWet: "1000.0",
        cornDry: "850.0",
        cultivationArea: "10.5",
      });

      // 3. Add emission sources
      await Promise.all([
        trpc.raws.add.mutate({
          tenantId: "tenant-uuid",
          carbonProjectId: project.carbonProject.id,
          cornSeedsAmount: "25.0",
          emissionFactorCornSeeds: "1.2",
        }),
        
        trpc.fertilizerNitrogen.add.mutate({
          tenantId: "tenant-uuid", 
          carbonProjectId: project.carbonProject.id,
          ammoniumNitrate: "150.0",
          urea: "200.0",
        }),
        
        trpc.energyDiesel.add.mutate({
          tenantId: "tenant-uuid",
          carbonProjectId: project.carbonProject.id,
          dieselConsumed: "500.0",
        }),
      ]);

      // 4. Add LUC data
      await Promise.all([
        trpc.actualCarbon.add.mutate({
          tenantId: "tenant-uuid",
          carbonProjectId: project.carbonProject.id,
          actualLandUse: "Cropland",
          socstActual: "45.5",
        }),
        
        trpc.referenceCarbon.add.mutate({
          tenantId: "tenant-uuid",
          carbonProjectId: project.carbonProject.id,
          referenceLandUse: "Forest",
          socstReference: "55.8",
          totalLUCCO2EmissionsHaYr: "425.80",
        }),
      ]);

      // 5. Create cultivation summary
      await trpc.cultivation.add.mutate({
        tenantId: "tenant-uuid",
        carbonProjectId: project.carbonProject.id,
        totalEmissionsCorn: "892.30",
      });

      // Invalidate all project queries
      utils.carbonProject.invalidate();
      
    } catch (error) {
      console.error("Failed to create carbon project:", error);
    }
  };

  return (
    <Button onClick={handleCompleteProject}>
      Create Complete Carbon Project
    </Button>
  );
};

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

type ApiFunction<TParams, TResponse> = (params: TParams) => Promise<TResponse>;
type MutationFunction<TParams, TResponse> = (
  params: TParams
) => Promise<TResponse>;

// Create a factory for generating query hooks
export function createQueryHook<TParams, TResponse>(
  queryKeyFn: (params: TParams) => QueryKey,
  apiFn: ApiFunction<TParams, TResponse>
) {
  return (
    params: TParams,
    options?: Omit<
      UseQueryOptions<TResponse, AxiosError, TResponse, QueryKey>,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery({
      queryKey: queryKeyFn(params),
      queryFn: () => apiFn(params),
      ...options,
    });
  };
}

// Create a factory for generating mutation hooks
export function createMutationHook<TParams, TResponse>(
  apiFn: MutationFunction<TParams, TResponse>,
  options: {
    onSuccessMessage?: string;
    onErrorMessage?: string;
    invalidateQueries?: (
      queryClient: ReturnType<typeof useQueryClient>,
      params: TParams
    ) => void;
  } = {}
) {
  return (
    mutationOptions?: Omit<
      UseMutationOptions<TResponse, AxiosError, TParams>,
      "mutationFn"
    >
  ) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: apiFn,
      onSuccess: (data, variables) => {
        if (options.invalidateQueries) {
          options.invalidateQueries(queryClient, variables);
        }

        if (options.onSuccessMessage) {
          toast.success(options.onSuccessMessage);
        }

        mutationOptions?.onSuccess?.(data, variables, {
          context: undefined,
        });
      },
      onError: (error, variables) => {
        toast.error(
          options.onErrorMessage ||
            (error.response?.data as { message?: string })?.message ||
            "An error occurred"
        );

        mutationOptions?.onError?.(error, variables, {
          context: undefined,
        });
      },
      ...mutationOptions,
    });
  };
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token?: string;
  user: User;
  message?: string;
  emailSent?: boolean;
  emailVerificationRequired?: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    enabled: !!localStorage.getItem('auth_token'),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data: AuthResponse) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        queryClient.setQueryData(["/api/user"], data.user);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (data: AuthResponse) => {
      // Registration doesn't return a token - user must verify email first
      // Don't set token or user data in localStorage
    },
  });

  const logout = () => {
    localStorage.removeItem('auth_token');
    queryClient.setQueryData(["/api/user"], null);
    queryClient.clear();
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    loginMutation,
    registerMutation,
    logout,
  };
}

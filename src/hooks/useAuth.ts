import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequest, RegisterRequest } from '@/services';
import { useAuthStore } from '@/stores';

export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data.email, data.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
}

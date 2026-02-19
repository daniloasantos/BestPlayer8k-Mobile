import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { playlistsService, CreatePlaylistData } from '@/services';
import type { SSEProgress } from '@/services/playlists.service';

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistsService.getPlaylists(),
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistsService.getPlaylist(id),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, onProgress }: { data: CreatePlaylistData; onProgress?: (p: SSEProgress) => void }) =>
      playlistsService.createPlaylist(data, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlistsService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useSetActivePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => playlistsService.setActivePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRefreshPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, onProgress }: { id: string; onProgress?: (p: SSEProgress) => void }) =>
      playlistsService.refreshPlaylist(id, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

// Auto-activa a primeira playlist quando nenhuma está ativa no backend.
// Deve ser chamado no layout raiz do app para garantir sincronização.
export function useAutoActivatePlaylist() {
  const { data: playlists, isSuccess } = usePlaylists();
  const { mutate: activate, isPending } = useSetActivePlaylist();

  useEffect(() => {
    if (
      isSuccess &&
      !isPending &&
      playlists &&
      playlists.length > 0 &&
      !playlists.some(p => p.isActive)
    ) {
      activate(playlists[0].id);
    }
  }, [isSuccess, isPending, playlists, activate]);
}

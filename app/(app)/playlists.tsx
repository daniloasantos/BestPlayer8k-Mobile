import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  List,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { Card, Button, EmptyState, Modal, Input, Badge } from '@/components/ui';
import {
  usePlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
  useSetActivePlaylist,
  useRefreshPlaylist,
} from '@/hooks';
import type { Playlist } from '@/types';

export default function PlaylistsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');

  const {
    data: playlists,
    isLoading,
    refetch,
    isRefetching,
  } = usePlaylists();

  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const setActivePlaylist = useSetActivePlaylist();
  const refreshPlaylist = useRefreshPlaylist();

  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim() || !newPlaylistUrl.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await createPlaylist.mutateAsync({
        name: newPlaylistName.trim(),
        url: newPlaylistUrl.trim(),
      });
      setShowCreateModal(false);
      setNewPlaylistName('');
      setNewPlaylistUrl('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a playlist');
    }
  }, [newPlaylistName, newPlaylistUrl, createPlaylist]);

  const handleDeletePlaylist = useCallback((playlist: Playlist) => {
    Alert.alert(
      'Excluir playlist',
      `Tem certeza que deseja excluir "${playlist.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletePlaylist.mutate(playlist.id),
        },
      ]
    );
  }, [deletePlaylist]);

  const handleSetActive = useCallback((playlist: Playlist) => {
    if (!playlist.isActive) {
      setActivePlaylist.mutate(playlist.id);
    }
  }, [setActivePlaylist]);

  const handleRefresh = useCallback(async (playlist: Playlist) => {
    setRefreshingId(playlist.id);
    try {
      await refreshPlaylist.mutateAsync(playlist.id);
      Alert.alert('Sucesso', 'Playlist atualizada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a playlist');
    } finally {
      setRefreshingId(null);
    }
  }, [refreshPlaylist]);

  const styles = StyleSheet.create({
    listContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2,
    },
    playlistCard: {
      marginBottom: spacing.md,
      padding: spacing.md,
    },
    playlistHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    playlistInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    playlistName: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    playlistUrl: {
      ...typography.small,
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
    },
    playlistStats: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    statItem: {
      ...typography.small,
      color: colors.mutedForeground,
    },
    playlistActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonActive: {
      backgroundColor: colors.success + '20',
    },
    actionButtonRefresh: {
      backgroundColor: colors.primary + '20',
    },
    actionButtonDelete: {
      backgroundColor: colors.error + '20',
    },
    activeBadge: {
      marginTop: spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    addButton: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalContent: {
      gap: spacing.md,
    },
    modalTitle: {
      ...typography.title,
      color: colors.foreground,
      marginBottom: spacing.md,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
  });

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <Card style={styles.playlistCard}>
      <View style={styles.playlistHeader}>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{item.name}</Text>
          <Text style={styles.playlistUrl} numberOfLines={1}>
            {item.url}
          </Text>
          <View style={styles.playlistStats}>
            {item.channelCount !== undefined && (
              <Text style={styles.statItem}>
                {item.channelCount} canais
              </Text>
            )}
            {item.lastSync && (
              <Text style={styles.statItem}>
                Atualizado: {new Date(item.lastSync).toLocaleDateString()}
              </Text>
            )}
          </View>
          {item.isActive && (
            <Badge variant="success" size="sm" style={styles.activeBadge}>
              Ativa
            </Badge>
          )}
        </View>

        <View style={styles.playlistActions}>
          {/* Botão Ativar/Ativa */}
          <Pressable
            style={[
              styles.actionButton,
              item.isActive ? styles.actionButtonActive : undefined,
            ]}
            onPress={() => handleSetActive(item)}
            disabled={item.isActive || setActivePlaylist.isPending}
          >
            {item.isActive ? (
              <CheckCircle2 size={18} color={colors.success} />
            ) : (
              <Circle size={18} color={colors.mutedForeground} />
            )}
          </Pressable>

          {/* Botão Atualizar */}
          <Pressable
            style={[styles.actionButton, styles.actionButtonRefresh]}
            onPress={() => handleRefresh(item)}
            disabled={refreshingId === item.id}
          >
            {refreshingId === item.id ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <RefreshCw size={18} color={colors.primary} />
            )}
          </Pressable>

          {/* Botão Excluir */}
          <Pressable
            style={[styles.actionButton, styles.actionButtonDelete]}
            onPress={() => handleDeletePlaylist(item)}
            disabled={deletePlaylist.isPending}
          >
            <Trash2 size={18} color={colors.error} />
          </Pressable>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenContainer scrollable={false} noPadding>
      <Header
        title="Playlists"
        icon={List}
        showBack
        onBack={() => router.back()}
      />

      <FlatList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          (!playlists || playlists.length === 0) ? styles.emptyContainer : undefined,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon={List}
              title="Nenhuma playlist"
              description="Adicione uma playlist M3U para começar a assistir seus canais favoritos."
              actionLabel="Adicionar playlist"
              onAction={() => setShowCreateModal(true)}
            />
          )
        }
      />

      {/* FAB */}
      {playlists && playlists.length > 0 && (
        <Pressable
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color={colors.foreground} />
        </Pressable>
      )}

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nova Playlist</Text>

          <Input
            label="Nome"
            placeholder="Minha Playlist"
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
          />

          <Input
            label="URL da playlist (M3U)"
            placeholder="http://exemplo.com/playlist.m3u"
            value={newPlaylistUrl}
            onChangeText={setNewPlaylistUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setShowCreateModal(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Adicionar"
              onPress={handleCreatePlaylist}
              loading={createPlaylist.isPending}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

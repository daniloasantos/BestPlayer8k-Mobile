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
import type { SSEProgress } from '@/services/playlists.service';
import { useLanguage } from '@/contexts';

export default function PlaylistsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useLanguage();

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
  const [importProgress, setImportProgress] = useState<SSEProgress | null>(null);
  const [progressLabel, setProgressLabel] = useState<string>('');

  const getPhaseText = useCallback((phase: string) => {
    const key = `playlists.phases.${phase}`;
    const translated = t(key);
    return translated !== key ? translated : phase;
  }, [t]);

  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim() || !newPlaylistUrl.trim()) {
      Alert.alert(t('common.error'), t('auth.error_fill_all'));
      return;
    }

    setShowCreateModal(false);
    setProgressLabel(t('playlists.importing_playlist'));
    setImportProgress({ phase: 'connecting', current: 0, total: 1, percent: 0 });

    try {
      await createPlaylist.mutateAsync({
        data: {
          name: newPlaylistName.trim(),
          url: newPlaylistUrl.trim(),
        },
        onProgress: (progress) => {
          setImportProgress(progress);
        },
      });
      setNewPlaylistName('');
      setNewPlaylistUrl('');
      Alert.alert(t('common.success'), t('playlists.import_success'));
    } catch (error: any) {
      const message = error?.message || t('playlists.error_create');
      console.error('[Playlists] Create failed:', message);
      Alert.alert(t('common.error'), message);
    } finally {
      setImportProgress(null);
      setProgressLabel('');
    }
  }, [newPlaylistName, newPlaylistUrl, createPlaylist, t]);

  const handleDeletePlaylist = useCallback((playlist: Playlist) => {
    Alert.alert(
      t('playlists.delete_confirm_title'),
      t('playlists.delete_confirm_message', { name: playlist.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deletePlaylist.mutate(playlist.id),
        },
      ]
    );
  }, [deletePlaylist, t]);

  const handleSetActive = useCallback((playlist: Playlist) => {
    if (!playlist.isActive) {
      setActivePlaylist.mutate(playlist.id);
    }
  }, [setActivePlaylist]);

  const handleRefresh = useCallback((playlist: Playlist) => {
    Alert.alert(
      t('playlists.refresh_warning_title'),
      t('playlists.refresh_warning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setRefreshingId(playlist.id);
            setProgressLabel(t('playlists.updating_playlist'));
            setImportProgress({ phase: 'connecting', current: 0, total: 1, percent: 0 });

            try {
              await refreshPlaylist.mutateAsync({
                id: playlist.id,
                onProgress: (progress) => {
                  setImportProgress(progress);
                },
              });
              Alert.alert(t('common.success'), t('playlists.success_updated'));
            } catch (error: any) {
              const message = error?.message || t('playlists.error_update');
              console.error('[Playlists] Refresh failed:', message);
              Alert.alert(t('common.error'), message);
            } finally {
              setRefreshingId(null);
              setImportProgress(null);
              setProgressLabel('');
            }
          },
        },
      ]
    );
  }, [refreshPlaylist, t]);

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
    // Progress modal styles
    progressContainer: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.lg,
    },
    progressTitle: {
      ...typography.title,
      color: colors.foreground,
      textAlign: 'center',
    },
    progressPhase: {
      ...typography.body,
      color: colors.primary,
      textAlign: 'center',
    },
    progressDetail: {
      ...typography.small,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    progressBarContainer: {
      width: '100%',
      paddingHorizontal: spacing.sm,
      gap: spacing.xs,
    },
    progressBarTrack: {
      width: '100%',
      height: 8,
      borderRadius: borderRadius.full,
      backgroundColor: colors.muted,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
    },
    progressPercentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressPercent: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '700',
    },
    progressHint: {
      ...typography.small,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xs,
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
                {t('playlists.channels_count_short', { count: item.channelCount })}
              </Text>
            )}
            {item.lastSync && (
              <Text style={styles.statItem}>
                {t('playlists.updated_at', { date: new Date(item.lastSync).toLocaleDateString() })}
              </Text>
            )}
          </View>
          {item.isActive && (
            <Badge variant="success" size="sm" style={styles.activeBadge}>
              {t('playlists.active_badge')}
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
        title={t('playlists.screen_title')}
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
              title={t('playlists.empty_title')}
              description={t('playlists.empty_description')}
              actionLabel={t('playlists.empty_action')}
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
          <Text style={styles.modalTitle}>{t('playlists.new_playlist')}</Text>

          <Input
            label={t('playlists.name_label')}
            placeholder={t('playlists.name_placeholder')}
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
          />

          <Input
            label={t('playlists.url_label')}
            placeholder={t('playlists.url_placeholder')}
            value={newPlaylistUrl}
            onChangeText={setNewPlaylistUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <View style={styles.modalButtons}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              onPress={() => setShowCreateModal(false)}
              style={{ flex: 1 }}
            />
            <Button
              title={t('playlists.add_button')}
              onPress={handleCreatePlaylist}
              loading={createPlaylist.isPending}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>

      {/* Progress Modal */}
      <Modal
        visible={importProgress !== null}
        onClose={() => {}}
      >
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.progressTitle}>{progressLabel}</Text>

          <Text style={styles.progressPhase}>
            {importProgress ? getPhaseText(importProgress.phase) : ''}
          </Text>

          {/* Detail: current / total for importing and categories */}
          {importProgress && (importProgress.phase === 'importing' || importProgress.phase === 'categories') && importProgress.total > 1 && (
            <Text style={styles.progressDetail}>
              {importProgress.phase === 'importing'
                ? t('playlists.progress_channels', { current: importProgress.current, total: importProgress.total })
                : t('playlists.progress_categories', { current: importProgress.current, total: importProgress.total })
              }
            </Text>
          )}

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressPercentRow}>
              <Text style={styles.progressDetail}>
                {importProgress?.phase === 'done'
                  ? getPhaseText('done')
                  : t('common.loading')
                }
              </Text>
              <Text style={styles.progressPercent}>
                {importProgress?.percent ?? 0}%
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${importProgress?.percent ?? 0}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.progressHint}>
            {t('playlists.progress_hint')}
          </Text>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

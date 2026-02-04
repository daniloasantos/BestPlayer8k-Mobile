import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { Avatar } from './Avatar';
import { Modal } from './Modal';
import type { Profile } from '@/types';

interface ProfileSelectorProps {
  visible: boolean;
  onClose: () => void;
  profiles: Profile[];
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string) => void;
  onAddProfile?: () => void;
  onManageProfiles?: () => void;
}

export function ProfileSelector({
  visible,
  onClose,
  profiles,
  selectedProfileId,
  onSelectProfile,
  onAddProfile,
  onManageProfiles,
}: ProfileSelectorProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.title,
      color: colors.foreground,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    subtitle: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    profilesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.lg,
      marginBottom: spacing.xl,
    },
    profileItem: {
      alignItems: 'center',
      width: 80,
    },
    profileAvatarContainer: {
      position: 'relative',
      marginBottom: spacing.sm,
    },
    selectedRing: {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    checkBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.card,
    },
    profileName: {
      ...typography.label,
      color: colors.foreground,
      textAlign: 'center',
      fontWeight: '600',
    },
    profileNameSelected: {
      color: colors.primary,
    },
    primaryBadge: {
      ...typography.small,
      color: colors.mutedForeground,
      fontSize: 10,
    },
    addProfileButton: {
      alignItems: 'center',
      width: 80,
    },
    addProfileCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    addProfileText: {
      ...typography.label,
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
    manageButton: {
      paddingVertical: spacing.sm,
    },
    manageButtonText: {
      ...typography.body,
      color: colors.primary,
      textAlign: 'center',
      fontWeight: '600',
    },
  });

  const handleSelectProfile = (profileId: string) => {
    onSelectProfile(profileId);
    onClose();
  };

  const renderProfile = ({ item }: { item: Profile }) => {
    const isSelected = item.id === selectedProfileId;

    return (
      <Pressable
        style={styles.profileItem}
        onPress={() => handleSelectProfile(item.id)}
      >
        <View style={styles.profileAvatarContainer}>
          {isSelected && <View style={styles.selectedRing} />}
          <Avatar name={item.name} size={64} />
          {isSelected && (
            <View style={styles.checkBadge}>
              <Check size={14} color="#fff" strokeWidth={3} />
            </View>
          )}
        </View>
        <Text
          style={[
            styles.profileName,
            isSelected && styles.profileNameSelected,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {item.isPrimary && (
          <Text style={styles.primaryBadge}>Principal</Text>
        )}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Quem está assistindo?</Text>
        <Text style={styles.subtitle}>
          Selecione um perfil para continuar
        </Text>

        <View style={styles.profilesGrid}>
          {profiles.map((profile) => (
            <View key={profile.id}>
              {renderProfile({ item: profile })}
            </View>
          ))}

          {onAddProfile && profiles.length < 5 && (
            <Pressable style={styles.addProfileButton} onPress={onAddProfile}>
              <View style={styles.addProfileCircle}>
                <Plus size={28} color={colors.mutedForeground} />
              </View>
              <Text style={styles.addProfileText}>Adicionar</Text>
            </Pressable>
          )}
        </View>

        {onManageProfiles && (
          <View style={styles.footer}>
            <Pressable style={styles.manageButton} onPress={onManageProfiles}>
              <Text style={styles.manageButtonText}>Gerenciar perfis</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

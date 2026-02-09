import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Settings as SettingsIcon,
  Bell,
  Volume2,
  Wifi,
  Download,
  Palette,
  Globe,
  Shield,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useColors, useTheme, spacing, borderRadius, typography } from '@/theme';
import { ScreenContainer, Header } from '@/components/layout';
import { Card } from '@/components/ui';
import { useLanguage } from '@/contexts';

interface SettingItemProps {
  icon: any;
  label: string;
  description?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();

  const [notifications, setNotifications] = React.useState(true);
  const [autoplay, setAutoplay] = React.useState(true);
  const [wifiOnly, setWifiOnly] = React.useState(false);

  const styles = StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.xl * 2,
    },
    section: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
      ...typography.label,
      color: colors.mutedForeground,
      marginBottom: spacing.sm,
      paddingLeft: spacing.sm,
    },
    menuCard: {
      padding: 0,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    menuContent: {
      flex: 1,
    },
    menuLabel: {
      ...typography.body,
      color: colors.foreground,
    },
    menuDescription: {
      ...typography.small,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    menuRight: {
      marginLeft: spacing.sm,
    },
  });

  const SettingItem = ({
    icon: Icon,
    label,
    description,
    onPress,
    showArrow = true,
    rightElement,
  }: SettingItemProps) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.menuIcon}>
        <Icon size={20} color={colors.foreground} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {description && <Text style={styles.menuDescription}>{description}</Text>}
      </View>
      <View style={styles.menuRight}>
        {rightElement || (showArrow && onPress && (
          <ChevronRight size={20} color={colors.mutedForeground} />
        ))}
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <Header
        title={t('settings.screen_title')}
        icon={SettingsIcon}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.section_appearance')}</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={mode === 'dark' ? Moon : Sun}
              label={t('settings.dark_mode')}
              description={t('settings.dark_mode_description')}
              showArrow={false}
              rightElement={
                <Switch
                  value={mode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              }
            />
            <SettingItem
              icon={Palette}
              label={t('settings.accent_color')}
              description={t('settings.accent_color_value')}
              onPress={() => {}}
            />
            <SettingItem
              icon={Globe}
              label={t('settings.language')}
              description={t('settings.language_value')}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Playback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.section_playback')}</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={Volume2}
              label={t('settings.autoplay')}
              description={t('settings.autoplay_description')}
              showArrow={false}
              rightElement={
                <Switch
                  value={autoplay}
                  onValueChange={setAutoplay}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              }
            />
            <SettingItem
              icon={Wifi}
              label={t('settings.wifi_only')}
              description={t('settings.wifi_only_description')}
              showArrow={false}
              rightElement={
                <Switch
                  value={wifiOnly}
                  onValueChange={setWifiOnly}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              }
            />
            <SettingItem
              icon={Download}
              label={t('settings.streaming_quality')}
              description={t('settings.streaming_quality_value')}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.section_notifications')}</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={Bell}
              label={t('settings.push_notifications')}
              description={t('settings.push_notifications_description')}
              showArrow={false}
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={colors.foreground}
                />
              }
            />
          </Card>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.section_privacy')}</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={Shield}
              label={t('settings.privacy_policy')}
              onPress={() => {}}
            />
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

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
        title="Configurações"
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
          <Text style={styles.sectionTitle}>APARÊNCIA</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={mode === 'dark' ? Moon : Sun}
              label="Tema escuro"
              description="Alterna entre modo claro e escuro"
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
              label="Cor de destaque"
              description="Roxo (padrão)"
              onPress={() => {}}
            />
            <SettingItem
              icon={Globe}
              label="Idioma"
              description="Português (Brasil)"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Playback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REPRODUÇÃO</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={Volume2}
              label="Reprodução automática"
              description="Reproduzir próximo conteúdo automaticamente"
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
              label="Apenas Wi-Fi"
              description="Reproduzir apenas quando conectado ao Wi-Fi"
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
              label="Qualidade de streaming"
              description="Automático"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={Bell}
              label="Notificações push"
              description="Receber alertas de novos conteúdos"
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
          <Text style={styles.sectionTitle}>PRIVACIDADE</Text>
          <Card style={styles.menuCard}>
            <SettingItem
              icon={Shield}
              label="Política de privacidade"
              onPress={() => {}}
            />
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

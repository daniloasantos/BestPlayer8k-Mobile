import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { CheckCircle, Send } from 'lucide-react-native';
import { Modal } from './Modal';
import { Input } from './Input';
import { useColors, spacing, borderRadius, typography } from '@/theme';
import { useLanguage } from '@/contexts';
import { api } from '@/services/api';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export function ContactModal({ visible, onClose }: ContactModalProps) {
  const colors = useColors();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const openedAt = useRef(Date.now());

  const isFormValid = name.trim() && email.trim() && phone.trim() && message.trim();

  const handleClose = () => {
    // Reset form state when closing (only if not mid-send)
    if (!sending) {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setError('');
      setSent(false);
      openedAt.current = Date.now();
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid || sending) return;
    setError('');
    setSending(true);
    try {
      await api.post('/contact', {
        name,
        email,
        phone,
        message,
        _t: openedAt.current,
      });
      setSent(true);
    } catch {
      setError(t('support_lightbox.error_send'));
    } finally {
      setSending(false);
    }
  };

  const styles = StyleSheet.create({
    successContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xl * 1.5,
    },
    successIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    successTitle: {
      ...typography.title,
      color: colors.foreground,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    successMessage: {
      ...typography.body,
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 22,
    },
    messageLabel: {
      ...typography.body,
      color: colors.foreground,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    messageInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.input,
      padding: spacing.md,
      color: colors.foreground,
      fontSize: 16,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: spacing.lg,
    },
    errorBox: {
      backgroundColor: colors.error + '15',
      borderWidth: 1,
      borderColor: colors.error + '30',
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    errorText: {
      ...typography.body,
      color: colors.error,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius['2xl'],
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      opacity: isFormValid && !sending ? 1 : 0.4,
    },
    submitButtonText: {
      ...typography.body,
      color: '#fff',
      fontWeight: '700',
    },
  });

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={t('support_lightbox.title')}
      size="lg"
    >
      {sent ? (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={32} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>{t('support_lightbox.success_title')}</Text>
          <Text style={styles.successMessage}>{t('support_lightbox.success_message')}</Text>
        </View>
      ) : (
        <View>
          <Input
            label={t('support_lightbox.name_label')}
            placeholder={t('support_lightbox.name_placeholder')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Input
            label={t('support_lightbox.email_label')}
            placeholder={t('support_lightbox.email_placeholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label={t('support_lightbox.phone_label')}
            placeholder="(00) 00000-0000"
            value={phone}
            onChangeText={(v) => setPhone(formatPhone(v))}
            keyboardType="phone-pad"
          />

          <Text style={styles.messageLabel}>{t('support_lightbox.message_label')}</Text>
          <TextInput
            style={styles.messageInput}
            placeholder={t('support_lightbox.message_placeholder')}
            placeholderTextColor={colors.mutedForeground}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!isFormValid || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={16} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {sending ? t('support_lightbox.sending') : t('support_lightbox.send_button')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
}

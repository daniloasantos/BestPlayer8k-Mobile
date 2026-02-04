import { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useColors } from '@/theme';
import { borderRadius, spacing, iconSizes } from '@/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
}: ModalProps) {
  const colors = useColors();

  const getMaxWidth = () => {
    switch (size) {
      case 'sm':
        return 320;
      case 'lg':
        return 500;
      case 'full':
        return '95%';
      default:
        return 400;
    }
  };

  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.container,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  maxWidth: getMaxWidth(),
                },
              ]}
            >
              {(title || showCloseButton) && (
                <View
                  style={[
                    styles.header,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  {title && (
                    <Text style={[styles.title, { color: colors.foreground }]}>
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={[styles.closeButton, { backgroundColor: colors.muted }]}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={iconSizes.md} color={colors.foreground} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  content: {
    maxHeight: 500,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});

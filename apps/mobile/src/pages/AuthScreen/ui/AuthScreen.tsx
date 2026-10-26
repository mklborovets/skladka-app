import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  ErrorBanner,
  ScreenLayout,
  colors,
  radius,
  spacing,
  typography,
} from '@shared/ui';
import { GoogleUpgradeBanner } from '@features/auth';
import { useAuth } from '@app/providers';

export interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const {
    user,
    isAnonymous,
    isLoading,
    error,
    signInAnonymously,
    linkWithGoogle,
    signOut,
  } = useAuth();

  return (
    <ScreenLayout scrollable>
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>S</Text>
        </View>
        <Text style={styles.brandTitle}>SKLADKA</Text>
        <Text style={styles.brandSubtitle}>
          Shared expenses, fair split, and transparent balances
        </Text>
      </View>

      {error && <ErrorBanner message={error} />}

      {!user ? (
        <View style={styles.actionsContainer}>
          <Button
            title="Continue anonymously"
            onPress={signInAnonymously}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={styles.primaryButton}
          />

          <Button
            title="Sign in with Google"
            onPress={linkWithGoogle}
            loading={isLoading}
            variant="secondary"
            size="lg"
            style={styles.secondaryButton}
          />
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <View style={styles.userCard}>
            <Text style={styles.userCardLabel}>Current Profile</Text>
            <Text style={styles.userCardEmail}>
              {user.email || 'Anonymous User'}
            </Text>
            <Text style={styles.userCardUid}>UID: {user.uid}</Text>
          </View>

          {isAnonymous && (
            <GoogleUpgradeBanner
              onUpgrade={linkWithGoogle}
              loading={isLoading}
              error={error}
            />
          )}

          {onSuccess && (
            <Button
              title="Continue to Groups"
              onPress={onSuccess}
              variant="primary"
              size="lg"
              style={styles.continueButton}
            />
          )}

          <Button
            title="Sign Out"
            onPress={signOut}
            loading={isLoading}
            variant="ghost"
            size="md"
            style={styles.signOutButton}
          />
        </View>
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoBadgeText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryText,
  },
  brandTitle: {
    ...typography.titleLarge,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    ...typography.bodyRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionsContainer: {
    marginTop: spacing.xl,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    marginBottom: spacing.md,
  },
  profileContainer: {
    marginTop: spacing.md,
  },
  userCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  userCardLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  userCardEmail: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userCardUid: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  continueButton: {
    marginTop: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.sm,
  },
});

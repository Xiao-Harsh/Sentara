import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch, Linking, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import Header from '../../components/Header';
import ChatButton from '../../components/ChatButton';

const ProfileItem = ({ label, value, icon, isEditable, editValue, onChangeText, renderInput }) => (
  <View style={styles.profileItem}>
    <View style={styles.profileItemIconContainer}>
      <Text style={styles.profileItemIcon}>{icon}</Text>
    </View>
    <View style={styles.profileItemContent}>
      <Text style={styles.profileItemLabel}>{label}</Text>
      {isEditable ? (
        renderInput ? (
          renderInput()
        ) : (
          <TextInput
            style={styles.profileItemInput}
            value={editValue}
            onChangeText={onChangeText}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={colors.textLight}
            autoCapitalize="words"
            autoCorrect={false}
          />
        )
      ) : (
        <Text style={styles.profileItemValue}>{value || 'Not set'}</Text>
      )}
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLangCode = i18n.language || 'en';

  const { user, logOut, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const toggleEditProfile = async () => {
    if (isEditing) {
      const nameChanged = editName.trim() !== user?.displayName && editName.trim() !== '';
      const genderChanged = editGender.trim() !== user?.gender;

      if (nameChanged || genderChanged) {
        setSavingProfile(true);
        const { error } = await updateProfile(
          nameChanged ? editName.trim() : user?.displayName,
          genderChanged ? editGender.trim() : user?.gender
        );
        setSavingProfile(false);
        if (error) {
          Alert.alert('Update Failed', error);
          return;
        }
      }
      setIsEditing(false);
    } else {
      setEditName(user?.displayName || '');
      setEditGender(user?.gender || '');
      setIsEditing(true);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out of Sentara?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const { error } = await logOut();
            setLoading(false);
            if (error) {
              Alert.alert("Logout Error", error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title={t('common.profile', 'Profile')} 
        subtitle={t('profile.subtitle', 'Manage your account')}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.[0] || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('profile.account_details', 'Account Details')}</Text>
            <TouchableOpacity onPress={toggleEditProfile} disabled={savingProfile}>
              {savingProfile ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.editButtonText}>{isEditing ? t('common.save', 'Save') : t('common.edit', 'Edit')}</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.sectionCard}>
            <ProfileItem 
              label={t('profile.full_name', 'Full Name')} 
              value={user?.displayName} 
              icon="👤" 
              isEditable={isEditing}
              editValue={editName}
              onChangeText={setEditName}
            />
            <ProfileItem label={t('profile.email_address', 'Email Address')} value={user?.email} icon="✉️" />
            <ProfileItem 
              label={t('profile.gender', 'Gender')} 
              value={user?.gender} 
              icon="⚧" 
              isEditable={isEditing}
              renderInput={() => (
                <View style={styles.genderChipContainer}>
                  {['Male', 'Female', 'Other'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderChip,
                        editGender === option && styles.genderChipSelected
                      ]}
                      onPress={() => setEditGender(option)}
                    >
                      <Text style={[
                        styles.genderChipText,
                        editGender === option && styles.genderChipTextSelected
                      ]}>
                        {t(`profile.${option.toLowerCase()}`, option)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('profile.preferences', 'Preferences')}</Text>
          </View>
          <View style={styles.sectionCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingItemLabel}>{t('common.language', 'Language')}</Text>
              <View style={[styles.genderChipContainer, { marginTop: 0 }]}>
                {['en', 'hi'].map((langCode) => {
                  const display = langCode === 'en' ? 'English' : 'हिन्दी';
                  return (
                    <TouchableOpacity
                      key={langCode}
                      style={[
                        styles.genderChip,
                        currentLangCode === langCode && styles.genderChipSelected
                      ]}
                      onPress={() => i18n.changeLanguage(langCode)}
                    >
                      <Text style={[
                        styles.genderChipText,
                        currentLangCode === langCode && styles.genderChipTextSelected
                      ]}>
                        {display}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
              <Text style={styles.settingItemLabel}>{t('profile.notifications', 'Notifications')}</Text>
              <Switch
                trackColor={{ false: colors.borderFocus, true: colors.primaryLight }}
                thumbColor={notificationsEnabled ? colors.primary : colors.surface}
                ios_backgroundColor={colors.borderFocus}
                onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
                value={notificationsEnabled}
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.5}
              onPress={() => Alert.alert('Privacy Policy', 'Your data is securely stored and never shared with third parties. Sentara respects your complete privacy.')}
            >
              <Text style={styles.settingItemLabel}>{t('profile.privacy_policy', 'Privacy Policy')}</Text>
              <Text style={styles.settingItemArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.5}
              onPress={() => Alert.alert('Terms of Service', 'Sentara is an AI-driven mental wellness companion designed to support, not to replace professional medical advice.')}
            >
              <Text style={styles.settingItemLabel}>{t('profile.terms', 'Terms of Service')}</Text>
              <Text style={styles.settingItemArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <ChatButton 
            title={t('profile.sign_out', 'Sign Out')} 
            onPress={handleLogout} 
            loading={loading}
            type="secondary"
          />
          <Text style={styles.versionText}>Sentara v1.0.0 • AI-Driven Mental Wellness</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 56,
  },
  userName: {
    ...typography.h1,
    fontSize: 28,
    color: colors.text,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 0,
    marginLeft: 0,
  },
  editButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileItemIcon: {
    fontSize: 22,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  profileItemValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  profileItemInput: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  settingItemLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  settingItemValue: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  settingItemArrow: {
    fontSize: 20,
    color: colors.textLight,
  },
  logoutContainer: {
    marginTop: 16,
    marginBottom: 120,
  },
  versionText: {
    textAlign: 'center',
    ...typography.caption,
    color: colors.textLight,
    marginTop: 24,
  },
  genderChipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  genderChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  genderChipTextSelected: {
    color: colors.surface,
  },
});

export default ProfileScreen;
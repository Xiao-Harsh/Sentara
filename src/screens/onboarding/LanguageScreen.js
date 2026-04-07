import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import OptionCard from '../../components/OptionCard';
import ChatButton from '../../components/ChatButton';

const LanguageScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { id: 'en', title: 'English', icon: '🇺🇸' },
    { id: 'hi', title: 'हिन्दी', icon: '🇮🇳' },
  ];

  const handleNext = () => {
    i18n.changeLanguage(selectedLanguage === 'English' ? 'en' : 'hi');
    navigation.navigate('Goals', { language: selectedLanguage });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.preferences', 'Preferred Language')}</Text>
          <Text style={styles.subtitle}>{selectedLanguage === 'English' ? 'Choose your primary communication language' : 'अपनी प्राथमिक संचार भाषा चुनें'}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {languages.map((lang) => (
            <OptionCard
              key={lang.id}
              title={lang.title}
              icon={lang.icon}
              isSelected={selectedLanguage === lang.title}
              onPress={() => setSelectedLanguage(lang.title)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <ChatButton title={t('common.continue', 'Continue')} onPress={handleNext} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 32,
    marginBottom: 40,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
  }
});

export default LanguageScreen;
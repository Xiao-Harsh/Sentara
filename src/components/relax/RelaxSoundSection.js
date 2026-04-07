import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { soundCategories } from '../../data/relaxSounds';
import CategoryCard from './CategoryCard';
import { colors } from '../../theme/colors';

const RelaxSoundSection = ({ onCategoryPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mind Relax Sounds</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {soundCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={onCategoryPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
});

export default RelaxSoundSection;

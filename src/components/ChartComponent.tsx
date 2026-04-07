import React from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { EmotionEntry } from '../services/emotionService';

interface ChartComponentProps {
  data: EmotionEntry[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={TYPOGRAPHY.caption}>Insufficient data for trends</Text>
      </View>
    );
  }

  // Transform data: Take last 6 entries and map intensity to numbers
  const recentData = [...data].reverse().slice(-6);
  const intensities = { 'Low': 1, 'Medium': 2, 'High': 3 };

  const chartData = {
    labels: recentData.map((_, i) => `#${i + 1}`),
    datasets: [
      {
        data: recentData.map(e => intensities[e.intensity] || 0),
        color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`, // COLORS.primary
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - SPACING.l * 2}
        height={180}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: COLORS.primary,
          },
        }}
        bezier
        style={styles.chart}
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.m,
  },
  chart: {
    borderRadius: 16,
  },
  placeholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginVertical: SPACING.m,
  },
});

export default ChartComponent;

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THOUGHTS = [
  { id: 1, text: "I completely messed up that presentation. I'm terrible at my job.", category: "All-or-nothing thinking" },
  { id: 2, text: "They haven't replied to my text, they must be mad at me.", category: "Mind reading" },
  { id: 3, text: "If I don't get this promotion, my career is over.", category: "Catastrophizing" },
  { id: 4, text: "I should have known this would happen.", category: "Should statements" },
  { id: 5, text: "Nothing ever goes right for me.", category: "Overgeneralization" },
];

const ThoughtShiftGame = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = useState(0);
  const swipeAnim = useRef(new Animated.ValueXY()).current;

  const currentThought = THOUGHTS[currentIndex];

  const handleExit = () => {
    Alert.alert(
      "End session?",
      "Your progress in this session won't be saved.",
      [
        { text: "Keep going", style: "cancel" },
        { text: "End", style: "destructive", onPress: () => navigation.goBack() }
      ]
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        swipeAnim.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 80) {
          // This is me -> Reframe
          swipeRight();
        } else if (gestureState.dx < -80) {
          // Not mine -> Next
          swipeLeft();
        } else {
          // Snap back
          Animated.spring(swipeAnim, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const swipeLeft = () => {
    Animated.timing(swipeAnim, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => nextThought());
  };

  const swipeRight = () => {
    Animated.timing(swipeAnim, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('ThoughtReframe', { thought: currentThought.text });
      // Reset for when they come back
      swipeAnim.setValue({ x: 0, y: 0 });
    });
  };

  const nextThought = () => {
    if (currentIndex < THOUGHTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      swipeAnim.setValue({ x: 0, y: 0 });
    } else {
      navigation.goBack();
    }
  };

  const rotation = swipeAnim.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  const bgGlow = swipeAnim.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['rgba(199,53,48,0.12)', 'rgba(239, 239, 237, 1)', 'rgba(45,184,122,0.12)'],
  });
 
  return (
    <Animated.View style={[styles.container, { backgroundColor: bgGlow }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleExit}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thought shift</Text>
        <View style={styles.headerBtn}>
          <Text style={styles.cardCount}>Card {currentIndex + 1} of 5</Text>
        </View>
      </View>

      <View style={styles.centeredGroup}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.floatingCard,
            {
              transform: [
                { translateX: swipeAnim.x },
                { translateY: swipeAnim.y },
                { rotate: rotation }
              ]
            }
          ]}
        >
          <Text style={styles.familiarLabel}>Does this sound familiar?</Text>
          <Text style={styles.thoughtText}>{currentThought.text}</Text>

          <View style={styles.badgeGroup}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentThought.category}</Text>
            </View>
            <Text style={styles.patternLabel}>A common thinking pattern</Text>
          </View>
        </Animated.View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.notMineBtn}
            activeOpacity={0.8}
            onPress={swipeLeft}
          >
            <Text style={styles.notMineText}>Not mine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.thisIsMeBtn}
            activeOpacity={0.8}
            onPress={swipeRight}
          >
            <Text style={styles.thisIsMeText}>This is me →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerBtn: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardCount: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  centeredGroup: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  floatingCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  familiarLabel: {
    fontSize: 12,
    color: '#A8A8A8',
    marginBottom: 8,
  },
  thoughtText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 25.5, // 1.5
    marginBottom: 24,
  },
  badgeGroup: {
    alignItems: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: '#FCE4E0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C73530',
  },
  patternLabel: {
    fontSize: 10,
    color: '#A8A8A8',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  notMineBtn: {
    width: '45%',
    height: 52,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notMineText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B6B6B',
  },
  thisIsMeBtn: {
    width: '52%',
    height: 52,
    borderRadius: 50,
    backgroundColor: '#2DB87A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thisIsMeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ThoughtShiftGame;

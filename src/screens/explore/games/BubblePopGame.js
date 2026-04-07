import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Easing,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WORDS_POOL = [
  'deadline', 'email', 'meeting', 'review', 'target', 'report', 'overtime', 'pressure', 'rejection', 'evaluation',
  'comparison', 'judgment', 'argument', 'silence', 'loneliness', 'awkward', 'ignored', 'excluded', 'misunderstood', 'conflict',
  'failure', 'doubt', 'shame', 'regret', 'overthinking', 'guilt', 'worthless', 'lazy', 'stupid', 'not enough',
  'uncertainty', 'change', 'waiting', 'late', 'tired', 'overwhelmed', 'stuck', 'lost', 'confused', 'broken'
];

const BubbleIcon = ({ color = '#B8760A', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r="5" stroke={color} strokeWidth="2" />
    <Circle cx="16" cy="14" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="10" cy="18" r="2" stroke={color} strokeWidth="2" />
  </Svg>
);

const BurstDot = ({ x, y, angle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(angle) * 20],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(angle) * 20],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.burstDot,
        {
          left: x - 2.5,
          top: y - 2.5,
          opacity,
          transform: [{ translateX }, { translateY }]
        }
      ]}
    />
  );
};

const Bubble = ({ id, word, size, startX, speed, onPop, onReachTop }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT + size)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    // FLOAT ANIMATION
    const duration = ((SCREEN_HEIGHT + size + 150) / speed) * 16.67;
    Animated.timing(translateY, {
      toValue: -150,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onReachTop(id);
    });

    // WOBBLE ANIMATION (Side to side)
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 1500 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: -1,
          duration: 1500 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handlePress = (evt) => {
    if (popping) return;
    setPopping(true);
    const { locationX, locationY } = evt.nativeEvent;

    // Step 1 & 2: Scale and Fade
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.35,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      onPop(id, word, startX + size / 2, 0); // Y is handled by TranslateY
    });
  };

  // We need to pass the actual Y to onPop for the burst
  // but since we use useNativeDriver for Y, we can't easily read it.
  // We'll estimate it or just use the tap location.
  const handlePressWrapper = (evt) => {
    // locationX/Y in TouchableOpacity is relative to the element.
    // Screen X = startX + locationX
    // Screen Y = current translation + locationY
    const pressX = startX + evt.nativeEvent.locationX;
    // We'll pass the relative press to onPop to handle the burst at the bubble center
    onPop(id, word, startX + size / 2, 0); // actually we'll use a better approach in parent
  };

  return (
    <Animated.View
      style={[
        styles.bubbleContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: startX,
          transform: [
            { translateY },
            { translateX: wobbleAnim.interpolate({ inputRange: [-1, 1], outputRange: [-20, 20] }) },
            { scale }
          ],
          opacity,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.bubbleTouchable}
        activeOpacity={1}
        onPress={handlePress}
      >
        <View style={styles.bubbleInnerGlow} />
        <View style={styles.bubbleHighlight} />
        <Text style={styles.bubbleText}>{word}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BubblePopGame = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [bubbles, setBubbles] = useState([]);
  const [poppedWords, setPoppedWords] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [bursts, setBursts] = useState([]);
  const [availableWords, setAvailableWords] = useState([...WORDS_POOL].sort(() => Math.random() - 0.5));

  const spawnBubble = useCallback(() => {
    setBubbles(prev => {
      if (prev.length >= 7) return prev;

      const size = Math.random() * (88 - 52) + 52;
      const radius = size / 2;
      let startX = Math.random() * (SCREEN_WIDTH - size - 96) + 48;

      // Overlap prevention
      let attempts = 0;
      let conflict = true;
      while (conflict && attempts < 8) {
        conflict = prev.some(b => {
          const dx = b.startX + b.size / 2 - (startX + radius);
          // Only check X for initial spawn to ensure lanes
          return Math.abs(dx) < (b.size / 2 + radius + 16);
        });
        if (conflict) {
          startX = Math.random() * (SCREEN_WIDTH - size - 96) + 48;
          attempts++;
        }
      }

      if (conflict) return prev; // Skip if no space found

      const nextWord = availableWords[0];
      setAvailableWords(w => w.slice(1));

      return [...prev, {
        id: `bubble-${Date.now()}-${Math.random()}`,
        word: nextWord,
        size,
        startX,
        speed: Math.random() * (2.8 - 1.8) + 1.8, // Significantly faster
      }];
    });
  }, [availableWords]);

  useEffect(() => {
    if (isDone) return;
    const interval = setInterval(() => {
      if (bubbles.length < 5) spawnBubble();
    }, 1000);
    return () => clearInterval(interval);
  }, [bubbles.length, isDone, spawnBubble]);

  const handlePop = (id, word, centerX, centerY_placeholder) => {
    // Add burst
    // Note: since the bubble is moving, centerY is tricky. We'll skip centerY for now and just show burst at a fixed height centerish
    const burstId = Date.now().toString();
    setBursts(prev => [...prev, { id: burstId, x: centerX, y: SCREEN_HEIGHT / 2 }]); // Rough estimate
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== burstId));
    }, 300);

    setPoppedWords(prev => [...prev, word]);
    setBubbles(prev => prev.filter(b => b.id !== id));
    setTimeout(spawnBubble, 500);
  };

  const handleReachTop = (id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    spawnBubble();
  };

  const handleExit = () => {
    Alert.alert(
      "End session?",
      "Your progress in this session won't be saved.",
      [
        { text: "Keep going", style: "cancel" },
        { text: "End session", style: "default", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {!isDone ? (
        <>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleExit}>
              <Text style={styles.closeX}>×</Text>
            </TouchableOpacity>

            <View style={styles.counterPill}>
              <BubbleIcon />
              <Text style={styles.counterText}>{poppedWords.length} released</Text>
            </View>

            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsDone(true)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gameArea}>
            {bubbles.map(b => (
              <Bubble
                key={b.id}
                {...b}
                onPop={handlePop}
                onReachTop={handleReachTop}
              />
            ))}
            {bursts.map(b => (
              <View key={b.id} style={StyleSheet.absoluteFill} pointerEvents="none">
                <BurstDot x={b.x} y={b.y} angle={0} />
                <BurstDot x={b.x} y={b.y} angle={Math.PI / 4} />
                <BurstDot x={b.x} y={b.y} angle={Math.PI / 2} />
                <BurstDot x={b.x} y={b.y} angle={(3 * Math.PI) / 4} />
                <BurstDot x={b.x} y={b.y} angle={Math.PI} />
                <BurstDot x={b.x} y={b.y} angle={(5 * Math.PI) / 4} />
                <BurstDot x={b.x} y={b.y} angle={(6 * Math.PI) / 4} />
                <BurstDot x={b.x} y={b.y} angle={(7 * Math.PI) / 4} />
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.endScreen}>
          <View style={styles.endContent}>
            <Text style={styles.endTitle}>You released {poppedWords.length} thoughts.</Text>
            <Text style={styles.endSubtitle}>That takes courage.</Text>

            <View style={styles.pillContainer}>
              {poppedWords.map((w, idx) => (
                <View key={idx} style={styles.wordPill}>
                  <Text style={styles.wordPillText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.finalDoneBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.finalDoneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeX: {
    fontSize: 22,
    color: '#6B6B6B',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2DB87A',
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3DC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8760A',
    marginLeft: 6,
  },
  gameArea: {
    flex: 1,
    overflow: 'hidden',
  },
  bubbleContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)', // More transparent for glass feel
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2,
  },
  bubbleHighlight: {
    position: 'absolute',
    width: '35%',
    height: '25%',
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    borderRadius: 20,
    top: '12%',
    left: '12%',
    transform: [{ rotate: '-15deg' }],
  },
  bubbleInnerGlow: { // Added inner glow simulation
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bubbleTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  burstDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(45, 184, 122, 0.6)',
  },
  endScreen: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#E8F4FB',
  },
  endContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  endSubtitle: {
    fontSize: 15,
    color: '#6B6B6B',
    marginBottom: 32,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordPill: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  wordPillText: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  finalDoneBtn: {
    backgroundColor: '#2DB87A',
    height: 52,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  finalDoneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BubblePopGame;

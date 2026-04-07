import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MindfulBreathingGame = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState('Breathe in');
  const [countdown, setCountdown] = useState(4);
  const [round, setRound] = useState(1);
  const [isDone, setIsDone] = useState(false);

  const circleAnim = useRef(new Animated.Value(160)).current;
  const ring1Anim = useRef(new Animated.Value(160)).current;
  const ring2Anim = useRef(new Animated.Value(160)).current;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const showCheckmarkAnim = useRef(new Animated.Value(0)).current;
  const bgPulseAnim = useRef(new Animated.Value(1)).current;
  const particleAnims = useRef([...Array(6)].map(() => new Animated.ValueXY({ x: Math.random() * SCREEN_WIDTH, y: Math.random() * SCREEN_HEIGHT }))).current;

  // Particle Loop
  useEffect(() => {
    particleAnims.forEach((anim) => {
      const move = () => {
        Animated.timing(anim, {
          toValue: { x: Math.random() * SCREEN_WIDTH, y: Math.random() * SCREEN_HEIGHT },
          duration: Math.random() * 5000 + 5000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(move);
      };
      move();
    });
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulseAnim, { toValue: 1.2, duration: 3000, useNativeDriver: true }),
        Animated.timing(bgPulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    let timer;
    if (isDone) return;

    const runRound = () => {
      // INHALE: 4s
      setPhase('Breathe in');
      setCountdown(4);

      const animateTo = (val, duration, delay = 0) => {
        return Animated.timing(val, {
          toValue: duration === 4000 ? 240 : 160,
          duration: duration,
          delay: delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Circle sizes need JS driver
        });
      };

      // Start animations
      const startBreathing = (targetVal, duration) => {
        Animated.parallel([
          animateTo(circleAnim, duration, 0),
          animateTo(ring1Anim, duration, 200),
          animateTo(ring2Anim, duration, 400),
        ]).start();
      };

      startBreathing(240, 4000);

      let inCount = 3;
      timer = setInterval(() => {
        if (inCount > 0) {
          setCountdown(inCount);
          inCount--;
        } else {
          clearInterval(timer);

          // HOLD: 4s (No circle change, rings might catch up)
          setPhase('Hold');
          setCountdown(4);
          let holdCount = 3;
          timer = setInterval(() => {
            if (holdCount > 0) {
              setCountdown(holdCount);
              holdCount--;
            } else {
              clearInterval(timer);

              // EXHALE: 6s
              setPhase('Breathe out');
              setCountdown(6);
              startBreathing(160, 6000);

              let outCount = 5;
              timer = setInterval(() => {
                if (outCount > 0) {
                  setCountdown(outCount);
                  outCount--;
                } else {
                  clearInterval(timer);
                  finishRound();
                }
              }, 1000);
            }
          }, 1000);
        }
      }, 1000);
    };

    const finishRound = () => {
      if (round < 5) {
        setRound(r => r + 1);
        runRound();
      } else {
        setIsDone(true);
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(showCheckmarkAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ]).start();
      }
    };

    runRound();
    return () => clearInterval(timer);
  }, [round, isDone]);

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
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <TouchableOpacity 
        style={[styles.exitBtn, { top: Math.max(insets.top, 20) }]} 
        onPress={handleExit}
      >
        <Text style={styles.exitText}>×</Text>
      </TouchableOpacity>

      <View style={styles.mainContent}>
        {!isDone ? (
          <Animated.View style={[styles.gameArea, { opacity: fadeAnim }]}>
            <View style={styles.breathingContainer}>
              {/* Floating Particles */}
              {particleAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.particle,
                    { transform: anim.getTranslateTransform(), opacity: 0.15 }
                  ]}
                />
              ))}

              {/* Perpetual Background Pulse */}
              <Animated.View style={[styles.bgPulseRing, {
                transform: [{ scale: bgPulseAnim }],
                opacity: 0.1,
              }]} />
              {/* Ring 2 */}
              <Animated.View style={[styles.pulseRing, {
                width: Animated.add(ring2Anim, 60),
                height: Animated.add(ring2Anim, 60),
                borderRadius: Animated.divide(Animated.add(ring2Anim, 60), 2),
                backgroundColor: 'rgba(45,184,122,0.07)',
                borderColor: 'rgba(45,184,122,0.1)',
                borderWidth: 1,
              }]} />
              {/* Ring 1 */}
              <Animated.View style={[styles.pulseRing, {
                width: Animated.add(ring1Anim, 30),
                height: Animated.add(ring1Anim, 30),
                borderRadius: Animated.divide(Animated.add(ring1Anim, 30), 2),
                backgroundColor: 'rgba(45,184,122,0.15)',
                borderColor: 'rgba(45,184,122,0.2)',
                borderWidth: 1.5,
              }]} />
              {/* Main Circle */}
              <Animated.View style={[styles.mainCircle, {
                width: circleAnim,
                height: circleAnim,
                borderRadius: Animated.divide(circleAnim, 2)
              }]} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.phaseLabel}>{phase}</Text>
              <Text style={styles.countdown}>{countdown}</Text>
              <Text style={styles.roundLabel}>Round {round} of 5</Text>
            </View>

            {/* PROGRESS DOTS */}
            <View style={styles.dotsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < round && styles.dotComplete,
                    i === round && styles.dotActive
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.endScreen, { opacity: showCheckmarkAnim }]}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.wellDone}>Well done.</Text>
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>Calm streak +1</Text>
            </View>
            <TouchableOpacity style={styles.doneButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071A12', // Darker, premium base
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  exitBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  exitText: {
    fontSize: 22,
    color: '#FFFFFF',
    opacity: 0.55,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80, // Space for text below
  },
  mainCircle: {
    backgroundColor: 'rgba(45, 184, 122, 0.9)',
    position: 'absolute',
    shadowColor: '#2DB87A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  pulseRing: {
    position: 'absolute',
  },
  bgPulseRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: '55%', // adjust to be below the circle's max expansion
    marginTop: 120, // 240/2 + 32
  },
  phaseLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  countdown: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 12,
  },
  roundLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.5,
    marginTop: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
  },
  dotComplete: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(45, 184, 122, 0.9)',
  },
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  checkmark: {
    fontSize: 40,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  wellDone: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  streakPill: {
    backgroundColor: '#FFF3DC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 40,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8760A',
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 52,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
  },
  doneButtonText: {
    color: '#2DB87A',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MindfulBreathingGame;

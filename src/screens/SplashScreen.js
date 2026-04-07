import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('screen');

/**
 * SplashScreen — Premium animated splash for Sentara.
 *
 * Design: Inspired by modern app splash screens with organic blob shapes
 * in corners (emerald green, matching brand), centered logo + app name.
 *
 * Animation timeline (~2 000 ms total):
 *   0–600 ms     Blob shapes slide/fade in from corners
 *   200–800 ms   Logo fades in + scales up (0.7 → 1)
 *   600–1 200 ms App name fades in + slides up
 *   1 200–3 200  Hold — user sees full splash
 *   3 200–3 600  Entire screen fades out smoothly, then dismiss
 */
const SplashScreen = ({ onFinish }) => {
  // ─── Animated values ───────────────────────────────────────────
  // Overall container opacity (for smooth fade-out exit)
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Top-right decorative blob
  const blobTopOpacity = useRef(new Animated.Value(0)).current;
  const blobTopTranslate = useRef(new Animated.Value(-60)).current;

  // Bottom-left decorative blob
  const blobBottomOpacity = useRef(new Animated.Value(0)).current;
  const blobBottomTranslate = useRef(new Animated.Value(60)).current;

  // Center logo
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  // App name text
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(20)).current;

  // Subtitle text
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Animate blob shapes in from corners
    const blobsIn = Animated.parallel([
      Animated.timing(blobTopOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(blobTopTranslate, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(blobBottomOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(blobBottomTranslate, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    // Step 2: Logo fades in and gently scales up (no aggressive pulse)
    const logoIn = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    // Step 3: App name slides up and fades in
    const nameIn = Animated.parallel([
      Animated.timing(nameOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(nameTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    // Step 4: Subtitle fades in
    const subtitleIn = Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });

    // Step 5: Smooth fade-out of entire splash before unmounting
    const fadeOut = Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    });

    // Orchestrate the full sequence
    Animated.sequence([
      // Blobs + logo animate in together, logo slightly delayed
      Animated.parallel([
        blobsIn,
        Animated.sequence([
          Animated.delay(200),
          logoIn,
        ]),
      ]),
      // App name + subtitle slide in after logo is visible
      Animated.parallel([nameIn, subtitleIn]),
      // Hold — let user see the complete splash design
      Animated.delay(2000),
      // Smooth fade-out — no abrupt cut
      fadeOut,
    ]).start(() => {
      // Animation fully complete — safe to unmount
      onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* ─── Top-right decorative blob ─────────────────────────── */}
      <Animated.View
        style={[
          styles.blobTopRight,
          {
            opacity: blobTopOpacity,
            transform: [
              { translateX: blobTopTranslate }, // slides in from right
            ],
          },
        ]}
      >
        <Svg width={width * 0.6} height={height * 0.22} viewBox="0 0 300 200">
          <Defs>
            <SvgGradient id="gradTop" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#34D399" stopOpacity="1" />
              <Stop offset="1" stopColor="#059669" stopOpacity="1" />
            </SvgGradient>
          </Defs>
          <Path
            d="M300,0 L300,160 Q260,200 200,180 Q120,150 80,100 Q40,50 100,20 Q160,-10 220,0 Z"
            fill="url(#gradTop)"
          />
        </Svg>
      </Animated.View>

      {/* ─── Bottom-left decorative blob ───────────────────────── */}
      <Animated.View
        style={[
          styles.blobBottomLeft,
          {
            opacity: blobBottomOpacity,
            transform: [
              { translateX: blobBottomTranslate }, // slides in from left (positive → 0)
            ],
          },
        ]}
      >
        <Svg width={width * 0.55} height={height * 0.22} viewBox="0 0 280 200">
          <Defs>
            <SvgGradient id="gradBottom" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#059669" stopOpacity="1" />
              <Stop offset="1" stopColor="#047857" stopOpacity="1" />
            </SvgGradient>
          </Defs>
          <Path
            d="M0,200 L0,40 Q40,0 100,20 Q180,50 220,100 Q260,150 200,180 Q140,210 80,200 Z"
            fill="url(#gradBottom)"
          />
        </Svg>
      </Animated.View>

      {/* ─── Small decorative accent blob (top-left, subtle) ──── */}
      <Animated.View
        style={[
          styles.accentBlobTopLeft,
          { opacity: blobTopOpacity },
        ]}
      >
        <View style={styles.accentCircle} />
      </Animated.View>

      {/* ─── Center content: Logo + App Name ───────────────────── */}
      <View style={styles.centerContent}>
        {/* Logo with fade-in + scale animation */}
        <Animated.Image
          source={require('../../assets/sentara-logo.png')}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />

        {/* App name with slide-up + fade-in animation */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: nameOpacity,
              transform: [{ translateY: nameTranslateY }],
            },
          ]}
        >
          Sentara
        </Animated.Text>

        {/* Subtitle with fade-in */}
        <Animated.Text
          style={[
            styles.subtitle,
            { opacity: subtitleOpacity },
          ]}
        >
          YOUR WELLNESS COMPANION
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  // ─── Blob positions (mirroring the reference layout) ──────
  blobTopRight: {
    position: 'absolute',
    top: -10,
    right: -20,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -10,
    left: -20,
  },
  accentBlobTopLeft: {
    position: 'absolute',
    top: height * 0.06,
    left: width * 0.08,
  },
  accentCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#34D399',
    opacity: 0.5,
  },

  // ─── Center content ───────────────────────────────────────
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.38,
    height: width * 0.38,
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#059669', // Brand emerald green
    letterSpacing: 1.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8', // Slate 400 — soft muted text
    letterSpacing: 4,
    marginTop: 8,
  },
});

export default SplashScreen;

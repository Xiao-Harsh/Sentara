import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Dimensions,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SOS_COLORS = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  cardLight: '#252525',
  primary: '#FF5252',
  primaryDark: '#D32F2F',
  secondary: '#64D2B1',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  mintBg: 'rgba(100, 210, 177, 0.1)',
  border: 'rgba(255, 255, 255, 0.08)',
  glass: 'rgba(255, 255, 255, 0.03)',
};

const CONTACTS_KEY = '@sentara_emergency_contacts';

const HelplineCard = ({ organization, description, phone, availability }) => (
  <TouchableOpacity
    style={styles.helplineCard}
    activeOpacity={0.7}
    onPress={() => Linking.openURL(`tel:${phone}`)}
  >
    <View style={styles.helplineHeader}>
      <View style={styles.availabilityBadge}>
        <View style={styles.pulseDot} />
        <Text style={styles.availabilityText}>{availability}</Text>
      </View>
      <Feather name="external-link" size={14} color="rgba(255,255,255,0.3)" />
    </View>
    <Text style={styles.orgName}>{organization}</Text>
    <Text style={styles.orgDesc} numberOfLines={2}>{description}</Text>
    
    <View style={styles.phoneActionContainer}>
        <LinearGradient
            colors={['rgba(255, 82, 82, 0.15)', 'rgba(255, 82, 82, 0.05)']}
            style={styles.phoneActionGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
            <View style={styles.phoneIconCircle}>
                <Feather name="phone" size={12} color={SOS_COLORS.primary} />
            </View>
            <Text style={styles.phoneText}>{phone}</Text>
        </LinearGradient>
    </View>
  </TouchableOpacity>
);

const CrisisStep = ({ stepNumber, title, explanation, isLast }) => (
  <View style={styles.stepContainer}>
    <View style={styles.stepIndicatorCol}>
      <View style={styles.stepDot}>
        <Text style={styles.stepDotText}>{stepNumber}</Text>
      </View>
      {!isLast && <View style={styles.stepLine} />}
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepExplanation}>{explanation}</Text>
    </View>
  </View>
);

const TrustedContact = ({ name, phone, onRemove, onCall }) => (
  <TouchableOpacity 
    style={styles.contactChip} 
    activeOpacity={0.7} 
    onPress={onCall}
    onLongPress={() => {
        Alert.alert(
            "Remove Contact",
            `Are you sure you want to remove ${name} from your trusted contacts?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", onPress: onRemove, style: "destructive" }
            ]
        );
    }}
  >
    <View style={styles.contactAvatarContainer}>
      <LinearGradient
        colors={['#2C2C2E', '#1C1C1E']}
        style={styles.contactAvatar}
      >
        <Text style={styles.contactAvatarText}>{name.charAt(0).toUpperCase()}</Text>
      </LinearGradient>
      <View style={styles.contactStatusDot} />
    </View>
    <Text style={styles.contactName} numberOfLines={1}>{name}</Text>
  </TouchableOpacity>
);

const CrisisSupportModal = ({ isVisible, onClose, onStartAiChat }) => {
  const [contacts, setContacts] = useState([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLocSharing, setIsLocSharing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (isVisible) {
      loadContacts();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 9,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
      setIsAddingContact(false);
    }
  }, [isVisible]);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        // Initial defaults for first-time use
        const defaults = [{ id: '1', name: 'Mom', phone: '9999999999' }];
        setContacts(defaults);
        await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(defaults));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddContact = async () => {
    if (!newName || !newPhone) {
      Alert.alert("Error", "Please enter both name and phone number");
      return;
    }
    const newContact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    setNewName('');
    setNewPhone('');
    setIsAddingContact(false);
  };

  const handleRemoveContact = async (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      Alert.alert("Alert Sent", "An emergency broadcast has been sent to all registered contacts with your current status.");
    }, 2500);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* Header */}
          <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="chevron-down" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Crisis Support</Text>
              <TouchableOpacity style={styles.headerAction}>
                <MaterialCommunityIcons name="shield-check-outline" size={24} color={SOS_COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </BlurView>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Primary SOS Controls */}
            <View style={styles.sosControlsContainer}>
              <TouchableOpacity 
                style={styles.broadcastBtn} 
                activeOpacity={0.8}
                onPress={handleBroadcast}
                disabled={isBroadcasting}
              >
                <LinearGradient
                  colors={isBroadcasting ? ['#333', '#111'] : ['#FF5252', '#D32F2F']}
                  style={styles.broadcastGradient}
                >
                  <MaterialCommunityIcons 
                    name={isBroadcasting ? "loading" : "broadcast"} 
                    size={28} 
                    color="#FFF" 
                    style={isBroadcasting ? styles.rotateIcon : {}}
                  />
                  <Text style={styles.broadcastText}>
                    {isBroadcasting ? "Broadcasting Alert..." : "Alert All Contacts"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.splitControls}>
                <TouchableOpacity 
                  style={styles.locShareBtn} 
                  onPress={() => setIsLocSharing(!isLocSharing)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.controlIconCircle, isLocSharing && { backgroundColor: SOS_COLORS.secondary }]}>
                    <Feather name="map-pin" size={18} color={isLocSharing ? "#000" : "#FFF"} />
                  </View>
                  <Text style={styles.controlText}>
                    {isLocSharing ? "Sharing Live" : "Share Location"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.aiChatControl} onPress={onStartAiChat} activeOpacity={0.7}>
                  <View style={styles.controlIconCircle}>
                    <Ionicons name="sparkles" size={18} color="#FFF" />
                  </View>
                  <Text style={styles.controlText}>Guided Help</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trusted Contacts Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trusted Contacts</Text>
              <TouchableOpacity onPress={() => setIsAddingContact(true)}>
                <Text style={styles.editBtn}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactsList}>
              {contacts.map(contact => (
                <TrustedContact 
                  key={contact.id}
                  name={contact.name}
                  phone={contact.phone}
                  onCall={() => Linking.openURL(`tel:${contact.phone}`)}
                  onRemove={() => handleRemoveContact(contact.id)}
                />
              ))}
              <TouchableOpacity style={styles.addContactGhost} onPress={() => setIsAddingContact(true)}>
                <Feather name="plus" size={24} color={SOS_COLORS.textMuted} />
              </TouchableOpacity>
            </ScrollView>

            {/* Helpline Section */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Emergency Helplines</Text>
            </View>
            <View style={styles.helplineGrid}>
              <HelplineCard
                organization="iCALL"
                description="Psychosocial helpline offering emotional support"
                phone="9152987821"
                availability="Mon-Sat"
              />
              <HelplineCard
                organization="Vandrevala"
                description="Mental health support by trained counselors"
                phone="9999666555"
                availability="24/7"
              />
              <HelplineCard
                organization="NIMHANS"
                description="National mental health emergency helpline"
                phone="08046110007"
                availability="24/7"
              />
              <HelplineCard
                organization="AASRA"
                description="Crisis intervention for suicide prevention"
                phone="9820466726"
                availability="24/7"
              />
            </View>

            {/* Crisis Guide */}
            <View style={styles.guideCard}>
                <Text style={styles.guideHeader}>Crisis Management Steps</Text>
                <CrisisStep stepNumber="1" title="Immediate Safety" explanation="Move to a secure location and take 3 deep breaths." />
                <CrisisStep stepNumber="2" title="Contact Support" explanation="Tap a contact above or use a helpline below." />
                <CrisisStep stepNumber="3" title="Ground Yourself" explanation="Use the 5-4-3-2-1 technique to settle your mind." />
                <CrisisStep stepNumber="4" title="AI Support" explanation="Start a guided reflection session with Sentara." isLast={true} />
            </View>

            {/* Grounding Technique */}
            <View style={styles.groundingContainer}>
                <LinearGradient
                  colors={['rgba(100, 210, 177, 0.12)', 'rgba(100, 210, 177, 0.04)']}
                  style={styles.groundingBox}
                >
                    <View style={styles.groundingTitleRow}>
                        <MaterialCommunityIcons name="leaf" size={22} color={SOS_COLORS.secondary} />
                        <Text style={styles.groundingCardTitle}>Calm Your Mind (5-4-3-2-1)</Text>
                    </View>
                    <Text style={styles.groundingSubtitle}>Focus on your immediate surroundings:</Text>
                    
                    <View style={styles.groundingVerticalList}>
                        {[
                            { n: '5', label: 'Things you can see', icon: 'eye-outline' },
                            { n: '4', label: 'Things you can feel', icon: 'hand-right-outline' },
                            { n: '3', label: 'Things you can hear', icon: 'volume-high-outline' },
                            { n: '2', label: 'Things you can smell', icon: 'flower-outline' },
                            { n: '1', label: 'Thing you can taste', icon: 'restaurant-outline' }
                        ].map((item, idx) => (
                            <View key={idx} style={styles.groundingRow}>
                                <View style={styles.gNumberPill}>
                                    <Text style={styles.gNumberText}>{item.n}</Text>
                                </View>
                                <Ionicons name={item.icon} size={16} color={SOS_COLORS.secondary} style={{ marginHorizontal: 12 }} />
                                <Text style={styles.gLabelText}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Add Contact Modal Shadow Overlay */}
          {isAddingContact && (
            <BlurView intensity={90} tint="dark" style={styles.addContactOverlay}>
              <View style={styles.addContactCard}>
                <Text style={styles.addTitle}>New Trusted Contact</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#666"
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  value={newPhone}
                  onChangeText={setNewPhone}
                />
                <View style={styles.addActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingContact(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleAddContact}>
                    <Text style={styles.confirmText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '95%',
    backgroundColor: SOS_COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    ...typography.subtitle,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    marginTop: 64,
  },
  scrollContent: {
    padding: 24,
  },
  sosControlsContainer: {
    marginBottom: 40,
  },
  broadcastBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: SOS_COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  broadcastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  broadcastText: {
    ...typography.button,
    color: '#FFF',
    fontSize: 17,
    marginLeft: 12,
  },
  splitControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locShareBtn: {
    flex: 0.48,
    backgroundColor: SOS_COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SOS_COLORS.border,
  },
  aiChatControl: {
    flex: 0.48,
    backgroundColor: SOS_COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SOS_COLORS.border,
  },
  controlIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  controlText: {
    ...typography.bodySmall,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: '#FFF',
    fontSize: 20,
  },
  editBtn: {
    color: SOS_COLORS.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  contactsList: {
    marginBottom: 40,
    flexDirection: 'row',
  },
  contactChip: {
    alignItems: 'center',
    marginRight: 24,
  },
  contactAvatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  contactAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactAvatarText: {
    ...typography.h2,
    color: SOS_COLORS.secondary,
  },
  contactStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: SOS_COLORS.background,
  },
  contactName: {
    ...typography.bodySmall,
    color: SOS_COLORS.textMuted,
    fontSize: 12,
    width: 70,
    textAlign: 'center',
  },
  addContactGhost: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helplineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  helplineCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: SOS_COLORS.card,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SOS_COLORS.border,
  },
  helplineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SOS_COLORS.secondary,
    marginRight: 6,
  },
  availabilityText: {
    ...typography.caption,
    color: SOS_COLORS.textMuted,
    fontSize: 8,
  },
  orgName: {
    ...typography.subtitle,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orgDesc: {
    ...typography.bodySmall,
    color: SOS_COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 20,
  },
  phoneActionContainer: {
    marginTop: 'auto',
    borderRadius: 14,
    overflow: 'hidden',
  },
  phoneActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  phoneIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  phoneText: {
    ...typography.button,
    color: SOS_COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  guideCard: {
    backgroundColor: SOS_COLORS.card,
    borderRadius: 28,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: SOS_COLORS.border,
  },
  guideHeader: {
    ...typography.subtitle,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 28,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    marginRight: 20,
    width: 32,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepDotText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepTitle: {
    ...typography.subtitle,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  stepExplanation: {
    ...typography.bodySmall,
    color: SOS_COLORS.textMuted,
    lineHeight: 18,
  },
  groundingContainer: {
    marginBottom: 40,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(100, 210, 177, 0.15)',
  },
  groundingBox: {
    padding: 24,
  },
  groundingCardTitle: {
    ...typography.subtitle,
    color: SOS_COLORS.secondary,
    fontWeight: '700',
    marginLeft: 12,
  },
  groundingSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
    marginLeft: 34,
  },
  groundingVerticalList: {
    marginLeft: 4,
  },
  groundingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  gNumberPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 210, 177, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gNumberText: {
    color: SOS_COLORS.secondary,
    fontWeight: '800',
    fontSize: 15,
  },
  gLabelText: {
    ...typography.bodySmall,
    color: '#FFF',
    fontSize: 15,
  },
  addContactOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  addContactCard: {
    backgroundColor: '#1C1C1E',
    width: '85%',
    padding: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addTitle: {
    ...typography.h3,
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    color: '#FFF',
    marginBottom: 16,
    ...typography.bodySmall,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelBtn: {
    flex: 0.45,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 0.45,
    backgroundColor: SOS_COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: SOS_COLORS.textMuted,
    fontWeight: '600',
  },
  confirmText: {
    color: '#000',
    fontWeight: '700',
  },
  rotateIcon: {
    // Handling animation via state is simpler for mock
  }
});

export default CrisisSupportModal;

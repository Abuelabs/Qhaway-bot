import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import { ShieldAlert, PhoneCall, VolumeX, CheckCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface SosAlertScreenProps {
  route: {
    params: {
      id_paciente: string;
      tipo: string;
      emergenciaId: string;
      timestamp?: string;
    };
  };
  navigation: any;
}

export default function SosAlertScreen({ route, navigation }: SosAlertScreenProps) {
  const { id_paciente, tipo, emergenciaId, timestamp } = route.params || {
    id_paciente: 'PACIENTE_TEST_123',
    tipo: 'caida',
    emergenciaId: 'EMG_TEST_99',
  };

  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Animated values for pulsing background
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  // 1. Sirena Pulsing Animation loop
  useEffect(() => {
    const startSirenAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.25,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.95,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    startSirenAnimation();
  }, [pulseAnim, opacityAnim]);

  // 2. Play Emergency Alarm Sound and Trigger Vibration
  useEffect(() => {
    let active = true;

    async function setupAlert() {
      // Periodic intense vibration pattern (vibrate 1s, pause 0.5s, vibrate 1s...)
      const vibrationPattern = Platform.OS === 'android' ? [0, 1000, 500, 1000] : [0, 1000];
      Vibration.vibrate(vibrationPattern, true);

      // Expo AV Alarm Sound setup
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/emergency-alarm.mp3'),
          { isLooping: true, volume: 1.0 }
        );
        soundRef.current = sound;
        if (active && !isMuted) {
          await sound.playAsync();
        }
      } catch (error) {
        console.warn('No se pudo cargar el archivo de sonido de alarma local:', error);
      }
    }

    setupAlert();

    return () => {
      active = false;
      Vibration.cancel();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // 3. Handle Mute Siren
  const handleToggleMute = async () => {
    if (soundRef.current) {
      if (isMuted) {
        await soundRef.current.setVolumeAsync(1.0);
        setIsMuted(false);
      } else {
        await soundRef.current.setVolumeAsync(0.0);
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  // 4. Handle emergency resolution (mock api update to backend)
  const handleDeactivate = () => {
    Vibration.cancel();
    if (soundRef.current) {
      soundRef.current.stopAsync();
    }
    // Return or navigate back to safety
    navigation.goBack();
  };

  const emergencyTime = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();

  return (
    <View style={styles.container}>
      {/* Animated pulsing red background */}
      <Animated.View
        style={[
          styles.sirenBackground,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Main UI layout */}
      <View style={styles.content}>
        {/* Animated Central SOS Icon Badge */}
        <Animated.View style={[styles.sirenIconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <ShieldAlert size={80} color="#fff" />
        </Animated.View>

        {/* SOS Alert Headers */}
        <Text style={styles.alertTitle}>¡ALERTA CRÍTICA SOS!</Text>
        <Text style={styles.alertSubtitle}>ElderBot ha detectado una emergencia</Text>

        {/* Emergency Metadata Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>TIPO DE INCIDENTE:</Text>
            <Text style={styles.detailValue}>{tipo.toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PACIENTE ID:</Text>
            <Text style={styles.detailValue}>{id_paciente}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>HORA ALERTA:</Text>
            <Text style={styles.detailValue}>{emergencyTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>CÓDIGO SOS:</Text>
            <Text style={styles.detailValueUuid}>{emergenciaId}</Text>
          </View>
        </View>

        {/* Quick Action Button Panel */}
        <View style={styles.buttonContainer}>
          {/* Quick Call Emergency Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            activeOpacity={0.8}
            onPress={() => console.log('Llamando a servicios de emergencia...')}
          >
            <PhoneCall size={24} color="#fff" />
            <Text style={styles.callButtonText}>Llamar Emergencias (116 / 911)</Text>
          </TouchableOpacity>

          <View style={styles.rowButtons}>
            {/* Toggle Siren Audio Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.muteButton, isMuted && styles.mutedButtonActive]}
              activeOpacity={0.8}
              onPress={handleToggleMute}
            >
              <VolumeX size={20} color={isMuted ? '#ef4444' : '#fff'} />
              <Text style={[styles.buttonText, isMuted && styles.mutedTextActive]}>
                {isMuted ? 'Activar Sonido' : 'Silenciar Alarma'}
              </Text>
            </TouchableOpacity>

            {/* Resolve/Mark Handled Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              activeOpacity={0.8}
              onPress={handleDeactivate}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.buttonText}>Marcar Atendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0303',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sirenBackground: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: '#ff1a1a',
    zIndex: 1,
  },
  content: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  sirenIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ff1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#ff6666',
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  alertSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffcccc',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 26, 26, 0.4)',
    marginBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ff8080',
    letterSpacing: 1.2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailValueUuid: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#ffcccc',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 20,
    gap: 10,
  },
  callButton: {
    backgroundColor: '#ff1a1a',
    borderWidth: 2,
    borderColor: '#ff6666',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  muteButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 52,
  },
  mutedButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  resolveButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderWidth: 1,
    borderColor: '#22c55e',
    height: 52,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  mutedTextActive: {
    color: '#ef4444',
  },
});

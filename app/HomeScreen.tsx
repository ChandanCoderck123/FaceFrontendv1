import { Platform } from 'react-native';
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [skinType, setSkinType] = useState('');

  // Webcam state
  const [cameraOpen, setCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Backend result
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleStartAnalysis = () => {
    setModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access gallery is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleModalNext = () => {
    if (!selectedImage) {
      alert('Please upload or take a photo first.');
      return;
    }
    setModalVisible(false);
    setStep(2);
  };

  // Main API call
  const handleAnalyzeSkin = async () => {
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!age.trim()) {
      alert('Please enter your age.');
      return;
    }
    if (!gender) {
      alert('Please select your gender.');
      return;
    }
    if (!skinType) {
      alert('Please select your skin type.');
      return;
    }
    if (!selectedImage) {
      alert('Please select or capture an image.');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    try {
      const formData = new FormData();

      if (selectedImage.startsWith('data:')) {
        // Web: base64 image from Webcam
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        formData.append('center', blob, 'center.jpg');
      } else {
        // Mobile: file URI
        const fileName = selectedImage.split('/').pop() || 'center.jpg';
        formData.append('center', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: fileName,
        } as any);
      }

      // Optionally send form fields (not needed for backend, used in summary)
      formData.append('name', name);
      formData.append('age', age);
      formData.append('gender', gender || '');
      formData.append('skinType', skinType);

      // Call backend API (change URL if running elsewhere)
      const response = await axios.post(
        'http://13.203.35.161/analyze-face',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setAnalysisResult(response.data);
      setStep(3);
    } catch (err) {
      let message = 'Analysis failed. Please try again.';
      if (axios.isAxiosError(err)) {
        if (err.response) {
           // Server responded with status code outside 2xx
          message += `\nServer error: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
        } else if (err.request) {
          // No response received (maybe network error)
          message += `\nNo response from backend. Check backend URL, port, or CORS.`;
        } else {
          message += `\nAxios error: ${err.message}`;
        }
      } else {
        message += `\nError: ${err}`;
      }
      alert(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(isLargeScreen);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>The Face Shop</Text>
          <Text style={styles.tagline}>Clean Beauty</Text>
        </View>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <MaterialIcons
              name="tag-faces"
              size={64}
              color="#007AFF"
              style={styles.icon}
            />
            <Text style={styles.title}>Analyze Your Skin Health</Text>
            <Text style={styles.subtitle}>
              Upload/take a photo to begin analysis
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleStartAnalysis}
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
              <Text style={styles.buttonText}> Start Analysis</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <Text style={styles.stepLabel}>
              Step 2 <Text style={{ fontWeight: '400' }}>/ 3 Steps</Text>
            </Text>
            <View style={[styles.formContainer, isLargeScreen ? styles.formContainerLarge : styles.formContainerSmall]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Face Shop"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. 25"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholderTextColor="#999"
              />
              <View style={styles.genderContainer}>
                <Text style={styles.genderLabel}>Gender</Text>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.genderOption}
                    onPress={() => setGender(g as 'Male' | 'Female' | 'Other')}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        gender === g && styles.radioSelected,
                      ]}
                    />
                    <Text>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={skinType}
                  onValueChange={(itemValue) => setSkinType(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#007AFF"
                >
                  <Picker.Item label="Select Skin Type" value="" />
                  <Picker.Item label="Combination (both oily and dry skin)" value="combination" />
                  <Picker.Item label="Dry" value="dry" />
                  <Picker.Item label="Normal" value="normal" />
                  <Picker.Item label="Oily" value="oily" />
                  <Picker.Item label="Sensitive" value="sensitive" />
                </Picker>
              </View>
            </View>

            <View style={[styles.step2Footer, isLargeScreen ? { width: '40%', alignSelf: 'center' } : { width: '90%' }]}>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={handleAnalyzeSkin}
                disabled={loading}
              >
                <Text style={styles.analyzeButtonText}>Analyze Skin</Text>
                {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <>
            <Text style={styles.summaryTitleTop}>Summary Report</Text>
            <View style={[
              styles.splitSummaryContainer,
              { flexDirection: isLargeScreen ? 'row' : 'column' }
            ]}>
              {/* Left: Personal Info */}
              <View style={[
                styles.personalInfoBox,
                {
                  marginRight: isLargeScreen ? 20 : 0,
                  marginBottom: isLargeScreen ? 0 : 20
                }
              ]}>
                <Text style={styles.personalInfoTitle}>Your Personal Information</Text>
                <Text style={styles.infoItem}>Name: {name}</Text>
                <Text style={styles.infoItem}>Skin Type: {skinType}</Text>
                <Text style={styles.infoItem}>Age: {age}</Text>
                <Text style={styles.infoItem}>Gender: {gender}</Text>
              </View>
              {/* Right: Backend Analysis */}
              <View style={[
                styles.analysisBox,
                { marginLeft: isLargeScreen ? 20 : 0 }
              ]}>
                <Text style={styles.analysisTitle}>Backend Analysis Report</Text>
                <ScrollView style={styles.analysisScroll}>
                  <Text style={styles.analysisText}>
                    {analysisResult ? JSON.stringify(analysisResult, null, 2) : 'No report.'}
                  </Text>
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.recommendButton, isLargeScreen && { width: '40%', alignSelf: 'center' }]}
              onPress={() => alert('Recommendation clicked')}
            >
              <Text style={styles.recommendButtonText}>Recommendation</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Modal for Step 1 (Image upload/capture) */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, isLargeScreen && styles.modalContainerLarge]}>
              <Text style={styles.modalStep}>Step 1 / 3 Steps</Text>

              {selectedImage ? (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Preview</Text>
                  <View style={styles.previewImageWrapper}>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.previewCloseButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Text style={styles.previewCloseButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : cameraOpen && Platform.OS === 'web' ? (
                <View style={styles.webcamOverlay}>
                  <View style={styles.webcamContainer}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: 'user' }}
                      style={styles.webcam}
                    />
                    <View style={styles.cameraControls}>
                      <TouchableOpacity
                        style={styles.captureButton}
                        onPress={() => {
                          const screenshot = webcamRef.current?.getScreenshot();
                          if (screenshot) {
                            setSelectedImage(screenshot);
                            setCameraOpen(false);
                          }
                        }}
                      >
                        <Text style={styles.captureText}>Capture</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setCameraOpen(false)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadContainer}>
                  <TouchableOpacity
                    style={styles.uploadBox}
                    onPress={pickImage}
                  >
                    <MaterialIcons
                      name="cloud-upload"
                      size={36}
                      color="#007AFF"
                    />
                    <Text style={styles.uploadText}>
                      Click to upload or{'\n'}drag & drop
                    </Text>
                    <Text style={styles.supportedText}>
                      Supported: .jpg, .png
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.orBox}>
                    <Text style={styles.orText}>or</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cameraBox}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        setCameraOpen(true);
                      } else {
                        takePhoto();
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="photo-camera" size={36} color="#007AFF" />
                    <Text style={styles.cameraButtonText}>Use Camera</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleModalNext}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
const createStyles = (isLargeScreen: boolean) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      minHeight: '100%',
    },
    header: {
      marginBottom: 40,
      alignItems: 'center',
    },
    brandTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#222',
    },
    tagline: {
      fontSize: 16,
      color: '#666',
      marginTop: 4,
    },
    icon: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 6,
      color: '#222',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 40,
    },
    button: {
      flexDirection: 'row',
      backgroundColor: '#007AFF',
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 30,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    stepLabel: {
      color: '#007AFF',
      fontWeight: '600',
      fontSize: 14,
      marginBottom: 20,
    },
    formContainer: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    formContainerLarge: {
      width: '40%',
      alignSelf: 'center',
    },
    formContainerSmall: {
      width: '100%',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      fontSize: 16,
    },
    genderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    genderLabel: {
      marginRight: 10,
      fontWeight: '600',
    },
    genderOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    radioCircle: {
      height: 16,
      width: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#007AFF',
      marginRight: 6,
    },
    radioSelected: {
      backgroundColor: '#007AFF',
    },
    step2Footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 20,
      marginBottom: 30,
    },
    backText: {
      color: '#007AFF',
      fontSize: 14,
      paddingVertical: 10,
    },
    analyzeButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    analyzeButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      marginBottom: 16,
      overflow: 'hidden',
    },
    picker: {
      height: 44,
      width: '100%',
      color: '#333',
    },

    // --- NEW & UPDATED STYLES FOR SUMMARY SPLIT LAYOUT ---
    summaryTitleTop: {
      fontWeight: 'bold',
      fontSize: 26,
      alignSelf: 'center',
      marginBottom: 26,
      color: '#222',
    },
    splitSummaryContainer: {
      width: '100%',
      backgroundColor: '#d9e8dc',
      borderRadius: 18,
      padding: 26,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 38,
      minHeight: 320,
    },
    personalInfoBox: {
      flex: 1,
    },
    personalInfoTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 16,
      color: '#1a4a36',
    },
    infoItem: {
      fontSize: 15,
      marginBottom: 10,
      color: '#222',
    },
    analysisBox: {
      flex: 2,
      backgroundColor: '#eaf4f0',
      borderRadius: 12,
      padding: 18,
      minWidth: 0, // fix for flexbox scroll
      maxHeight: 300,
    },
    analysisTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 10,
      color: '#1a4a36',
    },
    analysisScroll: {
      maxHeight: 220,
    },
    analysisText: {
      fontSize: 13,
      color: '#2a2a2a',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    },
    // --- END NEW & UPDATED STYLES ---

    recommendButton: {
      backgroundColor: '#4b5fff',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      width: '90%',
      maxWidth: 400,
    },
    recommendButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
    },
    modalContainerLarge: {
      width: '50%',
      marginHorizontal: '25%',
    },
    modalStep: {
      marginBottom: 20,
      color: '#007AFF',
      fontWeight: '600',
      fontSize: 14,
    },
    uploadContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
    },
    uploadBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#007AFF',
      borderStyle: 'dashed',
      borderRadius: 6,
      padding: 12,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 120,
    },
    uploadText: {
      color: '#007AFF',
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    supportedText: {
      color: '#999',
      fontSize: 12,
      marginTop: 6,
      textAlign: 'center',
    },
    orBox: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    orText: {
      color: '#007AFF',
      fontWeight: '600',
    },
    cameraBox: {
      flex: 1,
      backgroundColor: '#f2f2f2',
      borderRadius: 6,
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 120,
      borderWidth: 1,
      borderColor: '#007AFF',
      borderStyle: 'dashed',
    },
    webcamOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      zIndex: 10,
    },
    webcamContainer: {
      width: isLargeScreen ? '50%' : '90%',
      aspectRatio: 3 / 4,
      backgroundColor: '#000',
      borderRadius: 12,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    webcam: {
      width: '100%',
      height: '100%',
    },
    captureButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 30,
    },
    captureText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cameraControls: {
      position: 'absolute',
      bottom: 24,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    cancelText: {
      color: '#fff',
      fontSize: 16,
    },
    cameraButtonText: {
      color: '#007AFF',
      marginTop: 6,
      fontWeight: '600',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    nextButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
    },
    nextButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    previewContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
    },
    previewLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#007AFF',
      marginBottom: 12,
    },
    previewImageWrapper: {
      position: 'relative',
      width: 200,
      height: 200,
    },
    previewImage: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      resizeMode: 'cover',
    },
    previewCloseButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#ff4444',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    previewCloseButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
      lineHeight: 18,
    },
  });

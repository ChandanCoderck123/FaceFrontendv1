# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


V1 code:

import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  useWindowDimensions,
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

  // Open modal on start analysis button press
  const handleStartAnalysis = () => {
    setModalVisible(true);
  };

  // Pick image from gallery
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

  // Take photo with camera
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

  // Modal Next button handler
  const handleModalNext = () => {
    if (!selectedImage) {
      alert('Please upload or take a photo first.');
      return;
    }
    setModalVisible(false);
    setStep(2);
  };

  // Updated Step 2 analyze button handler
  const handleAnalyzeSkin = () => {
    setStep(3);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>The Face Shop</Text>
          <Text style={styles.tagline}>Clean Beauty</Text>
        </View>

        {/* Step 1 content */}
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

        {/* Step 2 form */}
        {step === 2 && (
          <>
            <Text style={styles.stepLabel}>
              Step 2 <Text style={{ fontWeight: '400' }}>/ 3 Steps</Text>
            </Text>

            <View
              style={[
                styles.formContainer,
                isLargeScreen
                  ? styles.formContainerLarge
                  : styles.formContainerSmall,
              ]}
            >
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
                  <Picker.Item
                    label="Combination (both oily and dry skin)"
                    value="combination"
                  />
                  <Picker.Item label="Dry" value="dry" />
                  <Picker.Item label="Normal" value="normal" />
                  <Picker.Item label="Oily" value="oily" />
                  <Picker.Item label="Sensitive" value="sensitive" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.step2Footer,
                isLargeScreen 
                    ? { width: '40%', alignSelf: 'center' }
                    : { width: '90%' }, // wider on mobile
              ]}
              onPress={() => alert('Recommendation clicked')}
            >
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={handleAnalyzeSkin}
              >
                <Text style={styles.analyzeButtonText}>Analyze Skin</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3 summary and recommendation */}
        {step === 3 && (
          <>
            <Text style={styles.stepLabel}>
              Step 3 <Text style={{ fontWeight: '400' }}>/ 3 Steps</Text>
            </Text>

            <View
              style={[
                styles.summaryContainer,
                isLargeScreen
                  ? styles.formContainerLarge
                  : styles.formContainerSmall,
              ]}
            >
              <Text style={styles.summaryTitle}>Summary Report</Text>
              {/* Placeholder for actual summary content */}
            </View>

            <TouchableOpacity
              style={[
                styles.recommendButton,
                isLargeScreen && { width: '40%', alignSelf: 'center' },
              ]}
              onPress={() => alert('Recommendation clicked')}
            >
              <Text style={styles.recommendButtonText}>Recommendation</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Modal for upload/camera in Step 1 */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                isLargeScreen && styles.modalContainerLarge,
              ]}
            >
              <Text style={styles.modalStep}>Step 1 / 3 Steps</Text>

              <View style={styles.uploadContainer}>
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                  <MaterialIcons
                    name="cloud-upload"
                    size={36}
                    color="#007AFF"
                  />
                  <Text style={styles.uploadText}>
                    Click to upload or{'\n'}drag & drop
                  </Text>
                  <Text style={styles.supportedText}>Supported: .jpg, .png</Text>
                </TouchableOpacity>

                <View style={styles.orBox}>
                  <Text style={styles.orText}>or</Text>
                </View>

                <View style={styles.cameraBox}>
                  <MaterialIcons name="photo-camera" size={36} color="#ccc" />
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={takePhoto}
                  >
                    <Text style={styles.cameraButtonText}>Use Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

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

const styles = StyleSheet.create({
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

  // Step 2 styles
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
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Picker styles
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden', // clips dropdown if needed
  },
  picker: {
    height: 44,
    width: '100%',
    color: '#333',
  },

  // Step 3 styles
  summaryContainer: {
    backgroundColor: '#d9e8dc', // pale greenish color
    borderRadius: 12,
    padding: 20,
    height: 300, // fixed height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  summaryTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  recommendButton: {
    backgroundColor: '#4b5fff', // blue color
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    // Adding responsive width:
    width: '90%', 
    maxWidth: 400, 
  },
  recommendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Modal styles
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
  },
  cameraButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cameraButtonText: {
    color: '#fff',
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
});

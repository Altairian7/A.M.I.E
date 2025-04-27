
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { TextInput } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');


const memoryCategories = [
  { id: 'family', icon: 'people', label: 'Family' },
  { id: 'event', icon: 'calendar', label: 'Event' },
  { id: 'place', icon: 'location', label: 'Place' },
  { id: 'routine', icon: 'time', label: 'Routine' },
  { id: 'hobby', icon: 'musical-notes', label: 'Hobby' }
];

export default function MemoryVaultScreen({ navigation, route }) {
  const { userType, caregiverName, relation, patientInfo } = route.params || {};
  
  const [memories, setMemories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [memoryName, setMemoryName] = useState('');
  const [memoryRelation, setMemoryRelation] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('');
  const [memoryImage, setMemoryImage] = useState(null);
  const [memoryDescription, setMemoryDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isModalVisible]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setMemoryImage(result.assets[0].uri);
    }
  };

  const openAddMemoryModal = () => {
    setCurrentMemory(null);
    setMemoryName('');
    setMemoryRelation('');
    setMemoryCategory('');
    setMemoryImage(null);
    setMemoryDescription('');
    setIsModalVisible(true);
  };

  const saveMemory = () => {
    if (!memoryName || !memoryImage) {
      Alert.alert('Missing Information', 'Please provide at least a name and image');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      const newMemory = {
        id: Date.now().toString(),
        name: memoryName,
        relation: memoryRelation,
        category: memoryCategory,
        image: memoryImage,
        description: memoryDescription
      };
      
      setMemories([...memories, newMemory]);
      setIsLoading(false);
      setIsModalVisible(false);
      
      // Play success animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Summary', {
      userType,
      caregiverName,
      relation,
      patientInfo,
      memories
    });
  };

  const handleFinish = () => {
    if (memories.length === 0) {
      Alert.alert(
        'No Memories Added',
        'Are you sure you want to continue without adding any memories?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => handleSkip() }
        ]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Summary', {
      userType,
      caregiverName,
      relation,
      patientInfo,
      memories
    });
  };

  return (
    <LinearGradient
      colors={['#4C44B9', '#263077']}
      style={styles.container}
    >
      <View style={styles.backgroundElements}>
        <Animated.View style={[styles.blob, { top: '10%', right: '5%', opacity: 0.2 }]}>

        </Animated.View>
        <Animated.View style={[styles.blob, { bottom: '5%', left: '10%', opacity: 0.3 }]}>
        </Animated.View>
      </View>

      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Memory Vault</Text>
          <Text style={styles.headerSubtitle}>Add important people & memories</Text>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.introContainer,
            {
              opacity: contentAnim,
              transform: [{ translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}]
            }
          ]}
        >
          <BlurView intensity={15} tint="light" style={styles.introBlur}>
            <View style={styles.introHeader}>
              <View style={styles.introIconContainer}>

              </View>
              <View style={styles.introTextContainer}>
                <Text style={styles.introTitle}>
                  Let's help A.M.I.E recognize people and memories
                </Text>
                <Text style={styles.introSubtitle}>
                  Add faces and moments that matter most to create a familiar space
                </Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {memories.length > 0 && (
          <Animated.View 
            style={[
              styles.memoriesContainer,
              {
                opacity: contentAnim,
                transform: [{ translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0]
                })}]
              }
            ]}
          >
            <BlurView intensity={15} tint="light" style={styles.memoriesBlur}>
              <Text style={styles.memoriesTitle}>Added Memories</Text>
              
              <View style={styles.memoriesGrid}>
                {memories.map((memory, index) => (
                  <View key={memory.id} style={styles.memoryCard}>
                    <Image source={{ uri: memory.image }} style={styles.memoryImage} />
                    <View style={styles.memoryOverlay}>
                      <BlurView intensity={70} tint="dark" style={styles.memoryTextContainer}>
                        <Text numberOfLines={1} style={styles.memoryName}>{memory.name}</Text>
                        {memory.relation ? (
                          <Text numberOfLines={1} style={styles.memoryRelation}>{memory.relation}</Text>
                        ) : null}
                      </BlurView>
                      {memory.category && (
                        <View style={styles.categoryBadge}>
                          <Ionicons 
                            name={memoryCategories.find(c => c.id === memory.category)?.icon || 'heart'} 
                            size={12} 
                            color="#FFFFFF" 
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        )}

        <Animated.View 
          style={[
            styles.addButtonContainer,
            {
              opacity: contentAnim,
              transform: [{ translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0]
              })}]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddMemoryModal}
            activeOpacity={0.8}
          >
            <BlurView intensity={15} tint="light" style={styles.addButtonBlur}>
              <LinearGradient
                colors={['rgba(123, 108, 255, 0.5)', 'rgba(94, 84, 204, 0.5)']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={32} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add New Memory</Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={[
            styles.importContainer,
            {
              opacity: contentAnim,
              transform: [{ translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0]
              })}]
            }
          ]}
        >
          <BlurView intensity={10} tint="light" style={styles.importBlur}>
            <TouchableOpacity style={styles.importButton} activeOpacity={0.8}>
              <MaterialIcons name="cloud-upload" size={24} color="#A9A9FC" />
              <Text style={styles.importText}>Import from Google Drive</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View 
        style={[
          styles.footer, 
          { 
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.6}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7B6CFF', '#5E54CC']}
            style={styles.finishButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.finishButtonText}>Finish Setup</Text>
            <Ionicons name="checkmark" size={22} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Add Memory Modal */}
      <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              backgroundColor: 'rgba(0.4, 0.7, 0.9, 0.4)', 
              opacity: modalAnim
            }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1} 
            onPress={() => !isLoading && setIsModalVisible(false)}
          >
            <BlurView intensity={100} tint="dark" style={{ flex: 1 }}>
              <Animated.View 
                style={[
                  styles.modalContainer,
                  {
                    transform: [
                      { 
                        translateY: modalAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [300, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                  <BlurView intensity={0} tint="" style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Add to Memory Vault</Text>
                      {!isLoading && (
                        <TouchableOpacity 
                          style={styles.closeButton}
                          onPress={() => setIsModalVisible(false)}
                        >
                          <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <ScrollView 
                      style={styles.modalScroll}
                      showsVerticalScrollIndicator={false}
                    >
                      <TouchableOpacity 
                        style={styles.imagePickerContainer}
                        onPress={pickImage}
                        activeOpacity={0.9}
                      >
                        {memoryImage ? (
                          <Image source={{ uri: memoryImage }} style={styles.memoryPickedImage} />
                        ) : (
                          <LinearGradient
                            colors={['rgba(123, 108, 255, 0.3)', 'rgba(94, 84, 204, 0.3)']}
                            style={styles.imagePlaceholder}
                          >

                            <Text style={styles.uploadText}>Tap to upload photo</Text>
                          </LinearGradient>
                        )}
                        
                        <View style={styles.imagePickerOverlay}>
                          <Ionicons name="camera" size={18} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>

                      <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Name*</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Person's name"
                            placeholderTextColor="#A9A9FC"
                            value={memoryName}
                            onChangeText={setMemoryName}
                          />
                        </View>
                      </View>

                      <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Relationship</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="E.g., Son, Friend, Caregiver"
                            placeholderTextColor="#A9A9FC"
                            value={memoryRelation}
                            onChangeText={setMemoryRelation}
                          />
                        </View>
                      </View>

                      <Text style={[styles.inputLabel, { marginBottom: 10 }]}>Memory Category</Text>
                      <View style={styles.categoriesContainer}>
                        {memoryCategories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryOption,
                              memoryCategory === category.id && styles.categorySelected
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setMemoryCategory(category.id);
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons 
                              name={category.icon} 
                              size={20} 
                              color={memoryCategory === category.id ? '#7B6CFF' : '#CCCCFF'} 
                            />
                            <Text 
                              style={[
                                styles.categoryText,
                                memoryCategory === category.id && styles.categoryTextSelected
                              ]}
                            >
                              {category.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Description (Optional)</Text>
                          <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Add a short description or memory"
                            placeholderTextColor="#A9A9FC"
                            value={memoryDescription}
                            onChangeText={setMemoryDescription}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                          />
                        </View>
                      </View>
                    </ScrollView>

                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        (!memoryName || !memoryImage) && styles.saveButtonDisabled,
                        isLoading && styles.saveButtonLoading
                      ]}
                      onPress={saveMemory}
                      disabled={!memoryName || !memoryImage || isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save to Memory Vault</Text>
                      )}
                    </TouchableOpacity>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blob: {
    position: 'absolute',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#CCCCFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  introContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  introBlur: {
    borderRadius: 16,
  },
  introHeader: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  introIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  introTextContainer: {
    flex: 1,
  },
  introTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  introSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#CCCCFF',
    lineHeight: 20,
  },
  memoriesContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  memoriesBlur: {
    padding: 15,
    borderRadius: 16,
  },
  memoriesTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  memoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memoryCard: {
    width: (width - 70) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  memoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  memoryTextContainer: {
    padding: 10,
  },
  memoryName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  memoryRelation: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#CCCCFF',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(123, 108, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContainer: {
    marginBottom: 15,
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 15,
  },
  importContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  importBlur: {
    borderRadius: 16,
  },
  importButton: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#A9A9FC',
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(38, 48, 119, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  skipButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#CCCCFF',
  },
  finishButton: {
    flex: 1,
    height: 56,
    marginLeft: 15,
    borderRadius: 28,
    shadowColor: "#7B6CFF",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  finishButtonGradient: {
    height: '100%',
    width: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  finishButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    minHeight: height * 0.6,
    maxHeight: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: height * 0.65,
  },
  imagePickerContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  memoryPickedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 108, 255, 0.1)',
  },
  uploadText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#CCCCFF',
    marginTop: 10,
  },
  imagePickerOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7B6CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#CCCCFF',
    marginBottom: 5,
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  categorySelected: {
    backgroundColor: 'rgba(123, 108, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#7B6CFF',
  },
  categoryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#CCCCFF',
    marginLeft: 5,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7B6CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonLoading: {
    opacity: 0.8,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
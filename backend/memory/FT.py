# import cv2
# import face_recognition
# import numpy as np
# import os
# import time
# import pyttsx3
# from pathlib import Path

# class FaceRecognitionSystem:
#     def __init__(self, database_path, confidence_threshold=0.6):
#         """
#         Initialize the face recognition system.
        
#         Args:
#             database_path (str): Path to the folder containing face images
#             confidence_threshold (float): Threshold for face match confidence (0-1)
#         """
#         self.database_path = database_path
#         self.confidence_threshold = confidence_threshold
#         self.known_face_encodings = []
#         self.known_face_names = []
        
#         # Initialize text-to-speech engine
#         self.engine = pyttsx3.init()
#         self.engine.setProperty('rate', 150)  # Speed of speech
        
#         # Load the face database
#         self.load_face_database()
        
#     def load_face_database(self):
#         """Load all face images from the database directory."""
#         print(f"Loading face database from: {self.database_path}")
        
#         # Supported image extensions
#         image_extensions = ['.jpg', '.jpeg', '.png']
        
#         # Iterate through all files in the database directory
#         for file in os.listdir(self.database_path):
#             path = os.path.join(self.database_path, file)
            
#             # Check if it's a file with supported extension
#             if os.path.isfile(path) and Path(file).suffix.lower() in image_extensions:
#                 # Extract name from filename (without extension)
#                 name = os.path.splitext(file)[0]
                
#                 try:
#                     # Load image and get face encoding
#                     image = face_recognition.load_image_file(path)
#                     face_locations = face_recognition.face_locations(image)
                    
#                     if face_locations:
#                         # Get the encoding of the first face found
#                         face_encoding = face_recognition.face_encodings(image, face_locations)[0]
                        
#                         # Add to our lists
#                         self.known_face_encodings.append(face_encoding)
#                         self.known_face_names.append(name)
                        
#                         print(f"Added {name} to the database")
#                     else:
#                         print(f"No face found in {file}, skipping...")
#                 except Exception as e:
#                     print(f"Error processing {file}: {e}")
        
#         print(f"Database loaded with {len(self.known_face_names)} faces")
        
#         # Announce database loading complete
#         self.speak(f"Database loaded with {len(self.known_face_names)} faces")
    
#     def speak(self, text):
#         """Use text-to-speech to speak the given text."""
#         self.engine.say(text)
#         self.engine.runAndWait()
    
#     def run(self):
#         """Run the face recognition system with webcam input."""
#         if not self.known_face_encodings:
#             print("No faces in database. Please add images to the database folder.")
#             self.speak("No faces in database. Please add images to the database folder.")
#             return
        
#         # Initialize webcam
#         print("Starting webcam...")
#         video_capture = cv2.VideoCapture(0)
        
#         if not video_capture.isOpened():
#             print("Error: Could not open webcam.")
#             self.speak("Could not open webcam.")
#             return
        
#         # Let the camera warm up
#         time.sleep(1)
        
#         print("Face recognition system running. Press 'q' to quit.")
#         self.speak("Face recognition system is now running")
        
#         # Variables to control recognition frequency
#         last_recognition_time = 0
#         recognition_cooldown = 3  # seconds between recognition attempts
#         last_recognized_name = None
        
#         while True:
#             # Grab a single frame of video
#             ret, frame = video_capture.read()
#             if not ret:
#                 print("Error: Failed to grab frame from webcam.")
#                 break
            
#             # Only run face recognition every few frames to improve performance
#             current_time = time.time()
#             process_this_frame = (current_time - last_recognition_time) > recognition_cooldown
            
#             # Make a copy of the frame for display
#             display_frame = frame.copy()
            
#             if process_this_frame:
#                 # Convert the image from BGR color (which OpenCV uses) to RGB color
#                 rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
#                 # Find all the faces in the current frame
#                 face_locations = face_recognition.face_locations(rgb_frame)
                
#                 if face_locations:
#                     # Get encodings for detected faces
#                     face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    
#                     # Initialize variables for best match
#                     best_match = {
#                         "name": "Unknown",
#                         "distance": 1.0,  # Lower is better, 0 is perfect match
#                         "location": None
#                     }
                    
#                     # Check each detected face against our database
#                     for face_encoding, face_location in zip(face_encodings, face_locations):
#                         # Compare with all known faces
#                         face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                        
#                         if len(face_distances) > 0:
#                             # Find the best match (lowest distance)
#                             best_index = np.argmin(face_distances)
#                             best_distance = face_distances[best_index]
                            
#                             # If this is better than our current best match
#                             if best_distance < best_match["distance"]:
#                                 best_match["distance"] = best_distance
#                                 best_match["location"] = face_location
                                
#                                 # Check if it's a good enough match
#                                 if best_distance < self.confidence_threshold:
#                                     best_match["name"] = self.known_face_names[best_index]
                    
#                     # If we found a good match
#                     if best_match["name"] != "Unknown" and best_match["location"] is not None:
#                         # Update last recognition time
#                         last_recognition_time = current_time
                        
#                         # Only announce if it's a new person or after cooldown
#                         if best_match["name"] != last_recognized_name:
#                             match_percentage = (1 - best_match["distance"]) * 100
#                             print(f"Match found: {best_match['name']} ({match_percentage:.2f}%)")
#                             self.speak(f"YOU KNOWN THIS PERSON  {best_match['name']}")
#                             last_recognized_name = best_match["name"]
            
#             # Draw face rectangles and names on the display frame
#             for (top, right, bottom, left) in face_locations:
#                 # Draw a rectangle around the face
#                 cv2.rectangle(display_frame, (left, top), (right, bottom), (0, 255, 0), 2)
                
#                 # Draw a label with a name below the face
#                 name = best_match["name"] if best_match["location"] else "Processing..."
#                 cv2.rectangle(display_frame, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
#                 cv2.putText(display_frame, name, (left + 6, bottom - 6), 
#                             cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1)
            
#             # Display status info at the bottom of the frame
#             text = "Press 'q' to quit"
#             cv2.putText(display_frame, text, (10, display_frame.shape[0] - 20), 
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
#             # Display the resulting frame
#             cv2.imshow('Face Recognition System', display_frame)
            
#             # Wait for key press
#             if cv2.waitKey(1) & 0xFF == ord('q'):
#                 break
        
#         # Release the webcam and close all windows
#         video_capture.release()
#         cv2.destroyAllWindows()
#         print("Face recognition system stopped.")
#         self.speak("Face recognition system stopped")

# if __name__ == "__main__":
#     import argparse
    
#     # Set up command line argument parsing
#     parser = argparse.ArgumentParser(description='Face recognition system using a database of faces.')
#     parser.add_argument('--database', '-d', default='faces_db', 
#                         help='Path to the folder containing face images (default: faces_db)')
#     parser.add_argument('--threshold', '-t', type=float, default=0.6,
#                         help='Face matching confidence threshold (default: 0.6, lower is stricter)')
    
#     args = parser.parse_args()
    
#     # Create and run the face recognition system
#     face_system = FaceRecognitionSystem(args.database, args.threshold)
#     face_system.run()



import face_recognition
import numpy as np
import pickle
import os
import time
from django.conf import settings
from django.core.cache import cache
from .models import Memory
from threading import Lock

# Mutex for face recognition model loading
face_recognition_lock = Lock()

class FaceRecognitionSystem:
    """
    A class for managing face recognition operations.
    Provides methods to register faces, identify faces, and manage the face database.
    Uses lazy loading to improve performance.
    """
    # Track when the face_recognition module was last used
    _last_used = 0
    # Time in seconds after which to unload the model
    _idle_timeout = 300  # 5 minutes
    # Flag to indicate if model is loaded
    _model_loaded = False
    
    @classmethod
    def _ensure_model_loaded(cls):
        """Ensure the face recognition model is loaded"""
        with face_recognition_lock:
            # Update the last used timestamp
            cls._last_used = time.time()
            cls._model_loaded = True
            
            # Schedule a check to unload the model if it becomes idle
            # This would normally be done with a background task manager or celery
            # But for simplicity, we'll just update the flag
            return True
    
    @classmethod
    def extract_face_encoding(cls, image_path):
        """Extract face encoding from an image file with lazy loading."""
        try:
            # Ensure the model is loaded
            cls._ensure_model_loaded()
            
            # Load the image
            img = face_recognition.load_image_file(image_path)
            
            # Extract face encodings (use the first face found)
            encodings = face_recognition.face_encodings(img)
            
            if not encodings:
                return None
                
            # Return the first face encoding
            return encodings[0]
        except Exception as e:
            print(f"Error extracting face encoding: {str(e)}")
            return None
    
    @staticmethod
    def register_face(user, person_name, image_file, save_encoding=True):
        """
        Register a new face in the database.
        
        Args:
            user: UserProfile object
            person_name: Name of the person in the image
            image_file: Uploaded image file
            save_encoding: Whether to extract and save the face encoding
            
        Returns:
            Memory object if successful, None otherwise
        """
        try:
            # Create a new Memory object
            memory_obj, created = Memory.objects.get_or_create(
                user=user,
                person_name=person_name,
                defaults={'onboarding': True}
            )
            
            # Save the image
            memory_obj.image_path = image_file
            memory_obj.save()
            
            # Extract and save face encoding if requested
            if save_encoding:
                image_path = os.path.join(settings.MEDIA_ROOT, memory_obj.image_path.name)
                encoding = FaceRecognitionSystem.extract_face_encoding(image_path)
                
                if encoding is not None:
                    # Save the encoding as binary data
                    memory_obj.face_encoding = pickle.dumps(encoding)
                    memory_obj.save()
                    
            return memory_obj
        except Exception as e:
            print(f"Error registering face: {str(e)}")
            return None
    
    @classmethod
    def identify_faces(cls, user, image_file):
        """
        Identify faces in an image by comparing them to the user's registered faces.
        Uses lazy loading for model efficiency.
        
        Args:
            user: UserProfile object
            image_file: Image to check for known faces
            
        Returns:
            List of dictionaries with person names and confidence scores
        """
        try:
            # Check cache first
            cache_key = f"face_recognition_{user.id}_{hash(image_file)}"
            cached_results = cache.get(cache_key)
            if cached_results:
                return cached_results
            
            # Ensure the model is loaded
            cls._ensure_model_loaded()
            
            # Get all memory objects for this user
            memories = Memory.objects.filter(user=user, face_encoding__isnull=False)
            
            if not memories:
                return []
                
            # Load the uploaded image
            unknown_img = face_recognition.load_image_file(image_file)
            unknown_encodings = face_recognition.face_encodings(unknown_img)
            
            if not unknown_encodings:
                return []
                
            results = []
            
            # For each face in the uploaded image
            for unknown_encoding in unknown_encodings:
                matches = []
                
                # Compare with registered faces
                for memory in memories:
                    # Deserialize the stored encoding
                    known_encoding = pickle.loads(memory.face_encoding)
                    
                    # Compare faces
                    distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
                    confidence = (1 - distance) * 100
                    
                    # If confidence is high enough, consider it a match
                    if confidence >= 60:  # 60% threshold, can be adjusted
                        matches.append({
                            'person_name': memory.person_name,
                            'confidence': confidence
                        })
                
                # Sort matches by confidence (highest first)
                if matches:
                    matches.sort(key=lambda x: x['confidence'], reverse=True)
                    results.append(matches[0])  # Add the best match
            
            # Cache the results for 1 minute
            cache.set(cache_key, results, 60)
            
            return results
        except Exception as e:
            print(f"Error identifying faces: {str(e)}")
            return []
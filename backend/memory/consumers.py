import json
import base64
import pickle
import face_recognition
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from PIL import Image
import io
import numpy as np

class FaceRecognitionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from .models import Memory

        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return
        
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to face recognition service'
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            if data.get('type') == 'image':
                # Handle base64 encoded image
                image_data = data.get('image').split(',')[1]  # Remove data:image/jpeg;base64,
                image_bytes = base64.b64decode(image_data)
                await self.process_image(image_bytes)
        elif bytes_data:
            # Handle binary image data
            await self.process_image(bytes_data)

    async def process_image(self, image_bytes):
        try:
            # Convert bytes to numpy array for face_recognition
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Find faces in the image
            face_locations = face_recognition.face_locations(image_np)
            
            if not face_locations:
                await self.send(text_data=json.dumps({
                    'type': 'face_detection_result',
                    'message': 'No face detected',
                    'identified_people': []
                }))
                return
            
            # Get face encodings
            unknown_encodings = face_recognition.face_encodings(image_np, face_locations)
            
            # Get stored face encodings for this user
            memories = await self.get_user_memories()
            
            if not memories:
                await self.send(text_data=json.dumps({
                    'type': 'face_detection_result',
                    'message': 'No registered faces to compare',
                    'identified_people': []
                }))
                return
            
            results = []
            
            for i, unknown_encoding in enumerate(unknown_encodings):
                best_match = None
                highest_confidence = 0
                
                for memory in memories:
                    known_encoding = pickle.loads(memory.face_encoding)
                    distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
                    confidence = (1 - distance) * 100
                    
                    if confidence >= 60 and confidence > highest_confidence:
                        best_match = memory
                        highest_confidence = confidence
                
                if best_match:
                    results.append({
                        "person_name": best_match.person_name,
                        "confidence": f"{highest_confidence:.2f}%",
                        "face_location": face_locations[i],  # Return face location for highlighting
                    })
            
            await self.send(text_data=json.dumps({
                'type': 'face_detection_result',
                'message': 'Face identification completed',
                'identified_people': results
            }))
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error processing image: {str(e)}'
            }))
    
    @sync_to_async
    def get_user_memories(self):
        return list(Memory.objects.filter(user=self.user, face_encoding__isnull=False))
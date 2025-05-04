import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.apps import apps
from asgiref.sync import sync_to_async

class FaceRecognitionConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def get_user(self, firebase_uid):
        try:
            UserProfile = apps.get_model('users', 'UserProfile')
            user = UserProfile.objects.filter(firebase_uid=firebase_uid).first()
            
            if user:
                return user
            return None
        except Exception as e:
            print(f"Error in get_user: {str(e)}")
            return None

    async def connect(self):
        # Extract token from the query string in URL
        query_params = self.scope['query_string'].decode()
        firebase_uid = None
        
        # Look for token in the query parameters
        for param in query_params.split('&'):
            if param.startswith('token='):
                firebase_uid = param.split('=')[1]
                break

        if not firebase_uid:
            print("No valid Bearer token found in URL query string")
            await self.close(code=4001)
            return
        
        # Retrieve user from the database
        user = await self.get_user(firebase_uid)
        if not user:
            print(f"User not found for UID: {firebase_uid}")
            await self.close(code=4002)
            return

        # Save user for future reference
        self.user = user
        
        # Accept the WebSocket connection
        await self.accept()
        print(f"WebSocket connected successfully. UID: {firebase_uid}")
        
        # Send a response confirming the connection
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected as {self.user.name}'
        }))

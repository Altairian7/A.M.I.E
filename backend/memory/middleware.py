from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from firebase_admin import auth
from django.contrib.auth.models import AnonymousUser
from users.models import UserProfile

class FirebaseAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Extract token from query parameters
        query_string = scope.get('query_string', b'').decode()
        token = None
        
        # Parse the query string to find the token
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        if token:
            scope['user'] = await self.get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Verify the Firebase token
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Get or create user profile
            try:
                user_profile = UserProfile.objects.get(firebase_uid=uid)
                return user_profile
            except UserProfile.DoesNotExist:
                # Handle case where user exists in Firebase but not in your database
                return AnonymousUser()
        except Exception:
            return AnonymousUser()
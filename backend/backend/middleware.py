from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from firebase_admin import auth

class FirebaseAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        uid = None
        
        # Extract UID from query string (like ?uid=XYZ)
        for param in query_string.split('&'):
            if param.startswith('uid='):
                uid = param.split('=')[1]
                break
        
        if uid:
            scope['user'] = await self.get_user_from_uid(uid)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_uid(self, uid):
        # 👇 Lazy import to prevent "AppRegistryNotReady" error
        from users.models import UserProfile

        try:
            return UserProfile.objects.get(firebase_uid=uid)
        except UserProfile.DoesNotExist:
            return AnonymousUser()

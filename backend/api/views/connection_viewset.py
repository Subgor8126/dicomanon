from rest_framework import viewsets
from rest_framework import serializers
from api.models import Connection, User
from api.serializers import ConnectionSerializer
from api.permission import TokenRequired

class ConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectionSerializer
    permission_classes = [TokenRequired]

    def get_queryset(self):
        """
        Only return connections owned by the authenticated user.
        """
        return Connection.objects.filter(user__user_id=self.request.token_user_id)

    def perform_create(self, serializer):
        """
        Auto-assign the authenticated user to the new connection.
        """
        try:
            user = User.objects.get(user_id=self.request.token_user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        serializer.save(user=user)
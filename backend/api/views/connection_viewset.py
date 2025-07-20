from rest_framework import viewsets
from api.models import Connection
from api.serializers import ConnectionSerializer
from api.permission import TokenRequired

class ConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectionSerializer
    permission_classes = [TokenRequired]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Connection.objects.all()
        return Connection.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
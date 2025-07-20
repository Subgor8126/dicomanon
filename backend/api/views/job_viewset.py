from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from api.models import Job, CreditTransaction, User
from api.serializers import JobSerializer
from api.permission import TokenRequired

class JobViewSet(viewsets.ModelViewSet):
    """
    Secure viewset for user jobs.
    - User can list their jobs
    - User can retrieve individual jobs
    - User can create new jobs (credits deducted)
    """
    serializer_class = JobSerializer
    permission_classes = [TokenRequired]

    def get_queryset(self):
        """
        GET (list): Limit jobs to the authenticated user.
        """
        return Job.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        POST (create): Handle job creation with credit deduction and initial setup.
        """
        user = self.request.user
        data = self.request.data

        # Basic validation
        connection = data.get('connection')
        if not connection:
            raise serializers.ValidationError("Connection is required.")

        # Parse options
        ocr = bool(data.get('ocr_requested', False))
        tag_removal = bool(data.get('tag_removal_requested', False))

        # Determine credits needed (example logic)
        cost = 0
        if ocr and tag_removal:
            cost = 3
        elif ocr or tag_removal:
            cost = 2
        else:
            cost = 1

        if user.credits < cost:
            raise serializers.ValidationError("Not enough credits.")

        # Deduct credits
        user.credits -= cost
        user.save()

        # Create job instance
        job = serializer.save(
            user=user,
            credits_charged=cost,
            status="PENDING",
            ocr_requested=ocr,
            tag_removal_requested=tag_removal,
            started_at=None,
            completed_at=None
        )

        # Create credit transaction log
        CreditTransaction.objects.create(
            user=user,
            job=job,
            type="USAGE",
            amount=-cost,
            description="De-identification Job"
        )

        # (Optional) Enqueue job to processing system here
        # e.g., SQS, Celery, etc.

    def retrieve(self, request, *args, **kwargs):
        """
        GET (retrieve): Restrict retrieval to user-owned jobs.
        """
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        PUT (update): Disable updates from the client.
        """
        return Response({"error": "Updates are not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        """
        PATCH (partial_update): Disable partial updates.
        """
        return Response({"error": "Updates are not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        """
        DELETE (destroy): Disable deletes.
        """
        return Response({"error": "Deletes are not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
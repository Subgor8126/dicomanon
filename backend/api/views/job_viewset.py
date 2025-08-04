from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.decorators import action

from django.conf import settings

from api.models import Job, Connection, User
from api.serializers import JobSerializer
from api.permission import TokenRequired

import boto3
import json
import logging

class JobViewSet(viewsets.ModelViewSet):
    """
    Secure viewset for user jobs.
    - Authenticated users can list, view, and create jobs.
    """
    serializer_class = JobSerializer
    permission_classes = [TokenRequired]

    def get_queryset(self):
        """
        GET /jobs/ — List only the authenticated user's jobs.
        """
        return Job.objects.filter(user__user_id=self.request.token_user_id).order_by('-created_at')


    def perform_create(self, serializer):
        """
        POST /jobs/ — Create a new job and enqueue it for processing.
        """
        user_id = self.request.token_user_id
        data = self.request.data

        print(f"Creating a new job for user ID: {user_id}")
        print(f"Data: {data}")

        # Validate connection belongs to user
        try:
            print(f"Connection: {data.get('connection')}")
            connection = Connection.objects.get(id=data.get("connection"), user__user_id=user_id)
            print(f"Connection validated for user ID: {user_id}, connection ID: {connection.id}")
        except Connection.DoesNotExist:
            print(f"Invalid connection ID or unauthorized access for user ID: {user_id}")
            raise serializers.ValidationError("Invalid connection ID or unauthorized access.")
        
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid user.")

        # Create Job
        job = serializer.save(
            user=user,
            connection=connection,
            status="PENDING"
        )
        print(f"Job created with ID: {job.id}")

        # Build payload for SQS (new schema)
        payload = {
            "jobId": str(job.id),
            "userBucket": data.get('user_bucket'),
            "uploadPrefix": data.get('upload_prefix'),
            "resultPrefix": data.get('result_prefix'),
            "userRoleArn": data.get('user_role_arn'),
            "ocrRequested": bool(data.get("ocr_requested", False)),
            "ocrRenderBoxes": bool(data.get("ocr_render_boxes", False)),  # Always true for now
            "tagRemovalRequested": bool(data.get("tag_removal_requested", False)),
            "aiInferenceRequested": bool(data.get("ai_inference_requested", False)),
            "sagemakerEndpoint": data.get('model_endpoint', 'yolov5-inference-endpoint-v4'),
        }

        print(f"Payload for SQS: {payload}")

        # ENQUEUE TO SQS HERE (stubbed)
        try:
            sqs = boto3.client("sqs", region_name="us-east-1")
            sqs.send_message(
                QueueUrl=f"https://sqs.us-east-1.amazonaws.com/{settings.AWS_ACCOUNT_ID}/{settings.SQS_QUEUE_NAME}",
                MessageBody=json.dumps(payload)
            )
            print(f"Job with ID: {job.id} enqueued successfully")
        except Exception as e:
            print(f"Failed to enqueue job with ID: {job.id}. Error: {str(e)}")
            job.status = "FAILED_PERMANENT"
            job.error_message = str(e)
            job.save()
            raise serializers.ValidationError("Failed to enqueue job: " + str(e))

    def retrieve(self, request, *args, **kwargs):
        """
        GET /jobs/{id}/ — View individual job (only if owned).
        """
        instance = self.get_object()
        if instance.user.user_id != request.token_user_id:
            return Response({"error": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return Response({"error": "Updates are not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response({"error": "Updates are not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({"error": "Deletes are not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.decorators import action

from django.conf import settings

from api.models import Job, Connection
from api.serializers import JobSerializer
from api.permission import TokenRequired

import boto3
import json

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

        # Validate connection belongs to user
        try:
            connection = Connection.objects.get(id=data.get("connection"), user__user_id=user_id)
        except Connection.DoesNotExist:
            raise serializers.ValidationError("Invalid connection ID or unauthorized access.")

        # Create Job
        job = serializer.save(
            user=connection.user,
            connection=connection,
            status="PENDING"
        )

        # Build payload for SQS (new schema)
        payload = {
            "jobId": str(job.id),
            "userBucket": connection.bucket_name,
            "uploadPrefix": job.source_prefix,
            "resultPrefix": job.destination_prefix,
            "userRoleArn": connection.aws_role_arn,
            "ocrRequested": bool(data.get("ocr_requested", False)),
            "ocrRenderBoxes": True,  # Always true for now
            "tagRemovalRequested": bool(data.get("tag_removal_requested", False)),
            "aiInferenceRequested": bool(data.get("ai_inference_requested", False)),
            "sagemakerEndpoint": "https://runtime.sagemaker.us-east-1.amazonaws.com/endpoints/yolov5-inference-endpoint-v4/invocations",
        }

        # payload = {
        #     "jobId": str(job.id),
        #     "userBucket": "dicom-source-bucket",
        #     "uploadPrefix": "dicom-data/948t7-39g78/1001.000000-NA-46518/",
        #     "resultPrefix": "dicomanon-processed/",
        #     "userRoleArn": "arn:aws:iam::440209552724:role/CrossAccountS3AccessRole",
        #     "ocrRequested": true,
        #     "ocrRenderBoxes": true,
        #     "tagRemovalRequested": true,
        #     "aiInferenceRequested": false,
        #     "sagemakerEndpoint": null
        # }

        # ENQUEUE TO SQS HERE (stubbed)
        try:
            sqs = boto3.client("sqs", region_name="us-east-1")
            sqs.send_message(
                QueueUrl=f"https://sqs.us-east-1.amazonaws.com/{settings.AWS_ACCOUNT_ID}/{settings.SQS_QUEUE_NAME}",
                MessageBody=json.dumps(payload)
            )
        except Exception as e:
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
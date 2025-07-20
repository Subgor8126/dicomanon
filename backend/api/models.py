from django.db import models
import uuid

class User(models.Model):
    USER_TYPE_CHOICES = [
        ("RADIOLOGIST", "Radiologist"),
        ("RESEARCHER", "Researcher"),
        ("STUDENT", "Student"),
        ("TECHNICIAN", "Technician"),
        ("OTHER", "Other")
    ]
        
    user_id = models.CharField(primary_key=True, max_length=128, unique=True)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default="OTHER")

    credits = models.IntegerField(default=30)  # Free tier starting credits
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)

    onboarding_complete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.email}"

import uuid
from django.db import models


class Job(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED_RETRYABLE", "Failed (Retryable)"),
        ("FAILED_PERMANENT", "Failed (Permanent)"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='jobs')
    
    # Connection reference (which AWS account/role to use)
    connection = models.ForeignKey('Connection', on_delete=models.CASCADE, related_name='jobs', null=True, blank=True)
    
    # HIPAA-compliant artifact references (NO PHI)
    source_artifact_id = models.UUIDField(default=uuid.uuid4, editable=False, blank=True, null=True)
    destination_artifact_id = models.UUIDField(default=uuid.uuid4, editable=False, blank=True, null=True)
    
    # Job configuration
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    ocr_requested = models.BooleanField(default=False)
    tag_removal_requested = models.BooleanField(default=False)
    ai_inference_requested = models.BooleanField(default=False)
    
    # Billing
    credits_charged = models.IntegerField(default=0)
    
    # Clean S3 keys for de-identified output (NO PHI in these paths)
    s3_cleaned_result_key = models.CharField(max_length=512, blank=True, null=True)
    s3_audit_log_key = models.CharField(max_length=512, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # Error handling
    error_message = models.TextField(blank=True, null=True)
    retry_count = models.IntegerField(default=0)
    
    # Processing metrics
    files_processed = models.IntegerField(default=0)
    total_files = models.IntegerField(default=0)

    class Meta:
        # db_table = 'jobs' If you want to define your own table name instead of api_jobs
        ordering = ['-created_at'] # Default ordering for QuerySets - jobs will be returned newest first (descending order by creation date).
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['connection']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Job {self.id} ({self.status}) for {self.user.email}"
    
    @property
    # Returns True if the job status is either "FAILED_RETRYABLE" or "FAILED_PERMANENT"
    # Useful for checking failure state without hardcoding status values.
    def is_failed(self):
        return self.status in ["FAILED_RETRYABLE", "FAILED_PERMANENT"]
    
    @property
    # Returns True only if status is "FAILED_RETRYABLE" - indicates the job can be automatically retried.
    def can_retry(self):
        return self.status == "FAILED_RETRYABLE"
    
    @property
    # Returns True if status is "FAILED_PERMANENT" - indicates manual intervention or resubmission is needed.
    def requires_resubmission(self):
        return self.status == "FAILED_PERMANENT"
    
    @property
    # Calculates job processing time by subtracting started_at from completed_at.
    # Returns None if either timestamp is missing, which handles cases where jobs haven't started or 
    # completed yet.
    def duration(self):
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None
    
class Connection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='connections')
    
    name = models.CharField(max_length=255)  # User-defined friendly name
    bucket_name = models.CharField(max_length=255)
    aws_role_arn = models.CharField(max_length=512)
    region = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.bucket_name})"

class CreditTransaction(models.Model):

    TRANSACTION_TYPES = [
        ("PURCHASE", "Purchase"),
        ("USAGE", "Usage"),
    ]

    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='credit_transactions')
    job = models.ForeignKey('Job', on_delete=models.SET_NULL, null=True, blank=True, related_name='credit_transactions')

    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default="USAGE")

    amount = models.IntegerField()  # + for purchases, - for usage
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True) # Can be empty

    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.email}: {self.amount} credits on {self.created_at}"

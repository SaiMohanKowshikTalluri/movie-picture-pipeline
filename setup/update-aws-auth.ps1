# Update Kubeconfig
Write-Host "Updating kubeconfig for cluster..." -ForegroundColor Cyan
aws eks update-kubeconfig --name cluster --region us-east-1

# Apply aws-auth configuration
Write-Host "Applying aws-auth ConfigMap with Node Group role and github-action-user..." -ForegroundColor Cyan
kubectl apply -f "$PSScriptRoot/aws-auth.yaml"

# Wait and check nodes
Write-Host "Checking worker nodes status in cluster..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
kubectl get nodes
kubectl get pods -A

# Movie Picture Pipeline - CI/CD with GitHub Actions

* **GitHub Repository:** [https://github.com/SaiMohanKowshikTalluri/movie-picture-pipeline.git](https://github.com/SaiMohanKowshikTalluri/movie-picture-pipeline.git)
* **Frontend Live URL:** [http://a563811d9c3194cd7a96ff8bad188852-728776292.us-east-1.elb.amazonaws.com](http://a563811d9c3194cd7a96ff8bad188852-728776292.us-east-1.elb.amazonaws.com)
* **Backend Live API Endpoint:** [http://afa9734f344c94017a3f906b6bd9d756-737657875.us-east-1.elb.amazonaws.com/movies](http://afa9734f344c94017a3f906b6bd9d756-737657875.us-east-1.elb.amazonaws.com/movies)

---

## Project Overview

The **Movie Picture Pipeline** project implements an enterprise-grade, fully automated CI/CD pipeline using **GitHub Actions** for a microservices movie catalog web application comprising:
1. **Frontend**: A React / TypeScript UI displaying movies and movie details.
2. **Backend**: A Flask / Python RESTful API serving movie endpoints.
3. **Container Registry**: Amazon Elastic Container Registry (ECR).
4. **Container Orchestration**: Amazon Elastic Kubernetes Service (EKS).

---

## Architecture & Pipeline Structure

```
+-----------------------------------------------------------------------------------+
|                              GITHUB ACTIONS CI/CD                                 |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Pull Request to main]                                                           |
|         |                                                                         |
|         +---> Frontend CI (.github/workflows/frontend-ci.yaml)                    |
|         |        ├── Parallel: [Lint (ESLint)]  &  [Test (Jest)]                  |
|         |        └── Sequential: [Build (Docker Build)]                           |
|         |                                                                         |
|         +---> Backend CI (.github/workflows/backend-ci.yaml)                      |
|                  ├── Parallel: [Lint (flake8)]  &  [Test (pytest)]                |
|                  └── Sequential: [Build (Docker Build)]                           |
|                                                                                   |
|  [Push / Merge to main]                                                           |
|         |                                                                         |
|         +---> Frontend CD (.github/workflows/frontend-cd.yaml)                    |
|         |        ├── Parallel: [Lint]  &  [Test]                                  |
|         |        ├── Build: Tag with Git SHA + Push to Amazon ECR                 |
|         |        └── Deploy: Update Kustomize Manifest & Deploy to Amazon EKS     |
|         |                                                                         |
|         +---> Backend CD (.github/workflows/backend-cd.yaml)                     |
|                  ├── Parallel: [Lint]  &  [Test]                                  |
|                  ├── Build: Tag with Git SHA + Push to Amazon ECR                 |
|                  └── Deploy: Update Kustomize Manifest & Deploy to Amazon EKS     |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## Workflow Deliverables & Specifications

### 1. Frontend Continuous Integration (`frontend-ci.yaml`)
- **Path**: `.github/workflows/frontend-ci.yaml`
- **Trigger**: `pull_request` on branch `main` targeting `starter/frontend/**` and `.github/workflows/frontend-ci.yaml`, plus manual `workflow_dispatch`.
- **Jobs**:
  - `lint`: Restores npm cache, installs dependencies via `npm ci`, and executes `npm run lint`.
  - `test`: Restores npm cache, installs dependencies via `npm ci`, and executes `npm test -- --watchAll=false`.
  - *(Runs `lint` and `test` in parallel)*
  - `build`: Runs only after `lint` and `test` succeed (`needs: [lint, test]`), executes test verification, and builds Docker container (`docker build -t movie-frontend:ci .`).

### 2. Backend Continuous Integration (`backend-ci.yaml`)
- **Path**: `.github/workflows/backend-ci.yaml`
- **Trigger**: `pull_request` on branch `main` targeting `starter/backend/**` and `.github/workflows/backend-ci.yaml`, plus manual `workflow_dispatch`.
- **Jobs**:
  - `lint`: Sets up Python 3.10 with pip cache, installs `pipenv` & dependencies, and executes `pipenv run flake8`.
  - `test`: Sets up Python 3.10 with pip cache, installs `pipenv` & dependencies, and executes `pipenv run pytest`.
  - *(Runs `lint` and `test` in parallel)*
  - `build`: Runs only after `lint` and `test` succeed (`needs: [lint, test]`) and builds Docker container (`docker build -t movie-backend:ci ./starter/backend`).

### 3. Frontend Continuous Deployment (`frontend-cd.yaml`)
- **Path**: `.github/workflows/frontend-cd.yaml`
- **Trigger**: `push` on branch `main` targeting `starter/frontend/**` and `.github/workflows/frontend-cd.yaml`, plus manual `workflow_dispatch`.
- **Jobs**:
  - `lint` & `test`: Run in parallel, ensuring clean code and passing Jest test suites.
  - `build` (`needs: [lint, test]`):
    - Authenticates to AWS using GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`).
    - Logs into Amazon ECR via `aws-actions/amazon-ecr-login@v2`.
    - Builds image passing `--build-arg REACT_APP_MOVIE_API_URL=${{ secrets.REACT_APP_MOVIE_API_URL }}`.
    - Tags image with `${{ github.sha }}` and `latest`.
    - Pushes images to Amazon ECR repository `movie-frontend`.
  - `deploy` (`needs: [build]`):
    - Configures AWS credentials and updates kubeconfig (`aws eks update-kubeconfig --region us-east-1 --name cluster`).
    - Updates image tag using `kustomize edit set image frontend=$REGISTRY/$REPOSITORY:$IMAGE_TAG`.
    - Deploys manifests to EKS with `kubectl apply -k .`.
    - Verifies rollout status with `kubectl rollout status deployment/frontend`.

### 4. Backend Continuous Deployment (`backend-cd.yaml`)
- **Path**: `.github/workflows/backend-cd.yaml`
- **Trigger**: `push` on branch `main` targeting `starter/backend/**` and `.github/workflows/backend-cd.yaml`, plus manual `workflow_dispatch`.
- **Jobs**:
  - `lint` & `test`: Run in parallel, verifying flake8 linting and pytest test suites.
  - `build` (`needs: [lint, test]`):
    - Authenticates to AWS via GitHub Secrets.
    - Logs into Amazon ECR via `aws-actions/amazon-ecr-login@v2`.
    - Builds image tagged with `${{ github.sha }}` and `latest`.
    - Pushes images to Amazon ECR repository `movie-backend`.
  - `deploy` (`needs: [build]`):
    - Updates kubeconfig for EKS cluster `cluster`.
    - Updates image tag using `kustomize edit set image backend=$REGISTRY/$REPOSITORY:$IMAGE_TAG`.
    - Applies Kubernetes manifests with `kubectl apply -k .`.
    - Verifies rollout status with `kubectl rollout status deployment/backend`.

---

## Security & GitHub Secrets Configuration

No AWS credentials or secret tokens are hardcoded in any pipeline file. Workflows retrieve credentials securely from GitHub Repository Secrets:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID for IAM user `github-action-user` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key for IAM user `github-action-user` |
| `AWS_SESSION_TOKEN` | AWS Session Token (for temporary lab credentials) |
| `REACT_APP_MOVIE_API_URL` | Backend REST API endpoint URL (e.g. Backend ELB address) |

---

## Local Development & Testing

### Frontend Local Setup
```bash
cd starter/frontend

# Install dependencies
npm ci

# Run linting
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Run tests
npm test -- --watchAll=false

# Run development server
REACT_APP_MOVIE_API_URL=http://localhost:5000 npm start
```

### Backend Local Setup
```bash
cd starter/backend

# Install dependencies
pipenv install --dev

# Run linting
pipenv run flake8 --exclude=venv,.venv,.git,__pycache__

# Run unit tests
pipenv run pytest

# Run API locally
pipenv run serve
```

---

## Infrastructure Provisioning & Teardown

### Provision Infrastructure with Terraform
```bash
cd setup/terraform
terraform init
terraform apply -auto-approve
```

### Configure Kubernetes Access for GitHub Actions
```bash
aws eks update-kubeconfig --name cluster --region us-east-1
cd setup
chmod +x init.sh
./init.sh
```

### Teardown AWS Resources
To avoid ongoing AWS charges or credit depletion, destroy all provisioned infrastructure upon completion:
```bash
cd setup/terraform
terraform destroy -auto-approve
```

---

## Deployment Verification

1. **Backend Endpoint Verification**:
   - `GET /movies` -> returns status `200 OK` with JSON array of movie objects.
2. **Frontend UI Verification**:
   - Loads movie catalog from Backend API URL.
   - Clicking a movie item renders detailed movie description.
3. **Pipeline Screenshots**:
   - Stored in the `screenshots/` directory verifying GitHub Actions workflow runs, ECR image pushes, and Kubernetes cluster deployments.
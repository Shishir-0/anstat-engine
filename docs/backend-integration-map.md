# ANSTAT AI ENGINE — Backend Integration Contract Map

This document establishes the precise REST/GraphQL API contract mapping between the frontend service interfaces (`lib/services/interfaces/*`) and future backend services.

---

## 1. Proposal Service Interface (`ProposalService`)

### `list(params?: ProposalFilters)`
- **Frontend Method**: `proposalService.list(params)`
- **Future API Endpoint**: `GET /api/v1/proposals`
- **Query Parameters**: `page`, `limit`, `status`, `clientId`, `query`
- **Headers**: `Authorization: Bearer <jwt>`, `X-Organization-Id: <org_id>`
- **Expected Request Schema**:
  ```json
  { "page": 1, "limit": 10, "status": "draft" }
  ```
- **Expected Response Schema**:
  ```json
  {
    "data": [
      {
        "id": "prop_123",
        "organizationId": "org_456",
        "title": "B2B E-commerce Portal",
        "clientId": "cli_789",
        "clientName": "Vertex Commerce",
        "status": "won",
        "totalValueUsd": 145000,
        "currency": "USD",
        "executiveSummary": "...",
        "sections": [],
        "milestones": [],
        "version": 1
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```
- **Error Format**: Standard RFC 7807 Problem Details (`{ type, title, status, detail, instance }`)
- **Retry Policy**: Exponential backoff (max 3 retries) for 5xx errors.

### `generateFromBrief(brief: BriefInput)`
- **Frontend Method**: `proposalService.generateFromBrief(brief)`
- **Future API Endpoint**: `POST /api/v1/proposals/generate`
- **Request Body**:
  ```json
  {
    "clientId": "cli_789",
    "projectTitle": "Omnichannel Platform",
    "rawContent": "Client needs high throughput B2B portal...",
    "inputMethod": "text"
  }
  ```
- **Expected Response Schema**:
  ```json
  {
    "proposal": { "id": "prop_999", "status": "generated" },
    "job": { "id": "job_888", "status": "running", "progress": 10 }
  }
  ```

---

## 2. Code Generation Service Interface (`CodeService`)

### `createCodeJob(input: CodeJobInput)`
- **Frontend Method**: `codeService.createCodeJob(input)`
- **Future API Endpoint**: `POST /api/v1/code/jobs`
- **Request Body**:
  ```json
  {
    "repositoryId": "repo_123",
    "repositoryName": "northstar-web-platform",
    "targetBranch": "main",
    "issueTitle": "Add RBAC guard to admin routes",
    "issueDescription": "...",
    "modelId": "claude-3-5-sonnet",
    "safetyMode": "strict"
  }
  ```
- **Expected Response Schema**:
  ```json
  {
    "id": "job_code_777",
    "type": "code_generation",
    "status": "queued",
    "progress": 0,
    "steps": [],
    "events": []
  }
  ```

---

## 3. Security Service Interface (`SecurityService`)

### `startScan(repositoryId, branch, scanType)`
- **Frontend Method**: `securityService.startScan(repoId, branch, scanType)`
- **Future API Endpoint**: `POST /api/v1/security/scans`
- **Request Body**:
  ```json
  {
    "repositoryId": "repo_123",
    "branch": "main",
    "scanType": "standard"
  }
  ```

---

## 4. Debugging Service Interface (`DebuggingService`)

### `analyzeError(input: DebugSessionInput)`
- **Frontend Method**: `debuggingService.analyzeError(input)`
- **Future API Endpoint**: `POST /api/v1/debugging/analyze`
- **Request Body**:
  ```json
  {
    "environment": "production",
    "errorMessage": "NullPointer exception in checkout line 42",
    "stackTrace": "Error: NullPointer at route.ts:42:10"
  }
  ```

---

## 5. Deployment Service Interface (`DeploymentService`)

### `triggerDeployment(repositoryId, branch, environment)`
- **Frontend Method**: `deploymentService.triggerDeployment(repoId, branch, env)`
- **Future API Endpoint**: `POST /api/v1/deployments`
- **Request Body**:
  ```json
  {
    "repositoryId": "repo_123",
    "branch": "main",
    "environment": "production"
  }
  ```

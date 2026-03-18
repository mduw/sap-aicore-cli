# SAP AI Core CLI (saic-cli)

A developer-friendly CLI for managing SAP AI Core resources — deployments, executions, configurations, secrets, and more.

Interact with [SAP AI Core APIs](https://api.sap.com/package/SAPAICore/rest) directly from your terminal.

## Motivation

Managing AI Core resources through SAP AI Launchpad presents several challenges:

- No entry to create custom scenarios
- No straightforward way to create, update, or delete prompt templates in bulk
- Repetitive tasks like listing scenarios or managing configurations require multiple UI clicks
- No quick way to manage deployments, executions, or secrets from the command line

This CLI bridges these gaps by providing a command-line interface for all SAP AI Core APIs.

## Quick Start

### 1. Install

```bash
git clone <repo-url>
cd sap-ai-core-cli
npm run install-global
```

### 2. Setup

Connect to your AI Core instance:

```bash
# Interactive setup with SSO
saic-cli setup --sso -a <your_api_endpoint>

# Example
saic-cli setup --sso -a https://api.cf.eu10.hana.ondemand.com
```

<details>
<summary>Advanced setup options</summary>

```bash
# Setup manually
saic-cli setup

# Pass any cf login arguments
saic-cli setup --sso -o my-org -s my-space

# Reset configuration
saic-cli setup --reset
```

All arguments except `--force` and `--reset` are passed directly to `cf login`.
</details>

### 3. Use

```bash
# List all deployments
saic-cli list-deployments

# Get deployment details as JSON
saic-cli get-deployment <id> --json

# Create a deployment
saic-cli create-deployment --config-id <configuration-id>

# Preview what a command would do
saic-cli create-deployment --config-id <id> --dry-run
```

## Commands

### Setup

| Command | Description |
|---------|-------------|
| `setup` | Interactive setup wizard for AI Core configuration |
| `install` | Build and install CLI globally (for local development) |
| `uninstall` | Remove CLI from global installation |

### Prompt Templates

| Command | Description |
|---------|-------------|
| `list-scenarios` | List all available scenarios in the registry |
| `list-templates` | List prompt templates (all or by scenario) |
| `create-prompt` | Create a new prompt template from YAML config |
| `delete` | Delete prompt templates (by scenario or specific template) |
| `generate-template` | Generate a prompt template from OpenAPI spec |

### Deployments

| Command | Description |
|---------|-------------|
| `list-deployments` | List deployments |
| `get-deployment <id>` | Get deployment details |
| `create-deployment` | Create a new deployment |
| `update-deployment <id>` | Update a deployment (e.g. stop/start) |
| `delete-deployment <id>` | Delete a deployment |

### Executions

| Command | Description |
|---------|-------------|
| `list-executions` | List executions |
| `get-execution <id>` | Get execution details |
| `create-execution` | Create a new execution |
| `update-execution <id>` | Update an execution |
| `delete-execution <id>` | Delete an execution |

### Configurations

| Command | Description |
|---------|-------------|
| `list-configurations` | List configurations |
| `get-configuration <id>` | Get configuration details |
| `create-configuration` | Create a new configuration |

### Scenarios & Models

| Command | Description |
|---------|-------------|
| `get-scenario <id>` | Get scenario details |
| `list-scenario-versions` | List versions of a scenario |
| `list-executables` | List executables for a scenario |
| `get-executable <id>` | Get executable details |
| `list-models` | List models for a scenario |

### Artifacts

| Command | Description |
|---------|-------------|
| `list-artifacts` | List artifacts |
| `get-artifact <id>` | Get artifact details |
| `create-artifact` | Create a new artifact |

### Execution Schedules

| Command | Description |
|---------|-------------|
| `list-execution-schedules` | List execution schedules |
| `get-execution-schedule <id>` | Get execution schedule details |
| `create-execution-schedule` | Create a new execution schedule |
| `update-execution-schedule <id>` | Update an execution schedule |
| `delete-execution-schedule <id>` | Delete an execution schedule |

### Metrics & Meta

| Command | Description |
|---------|-------------|
| `list-metrics` | List metrics |
| `delete-metrics` | Delete metrics for an execution |
| `get-meta` | Get AI Core service metadata and capabilities |

### Dataset Files

| Command | Description |
|---------|-------------|
| `upload-dataset-file` | Upload a file to dataset storage |
| `get-dataset-file` | Download a file from dataset storage |
| `delete-dataset-file` | Delete a file from dataset storage |

### Repositories

| Command | Description |
|---------|-------------|
| `list-repositories` | List git repositories |
| `get-repository <name>` | Get repository details |
| `create-repository` | Onboard a git repository |
| `update-repository <name>` | Update repository credentials |
| `delete-repository <name>` | Delete a repository |

### Applications

| Command | Description |
|---------|-------------|
| `list-applications` | List ArgoCD applications |
| `get-application <name>` | Get application details |
| `create-application` | Create an ArgoCD application |
| `update-application <name>` | Update an application |
| `delete-application <name>` | Delete an application |

### Secrets

| Command | Description |
|---------|-------------|
| `list-docker-secrets` | List Docker registry secrets |
| `create-docker-secret` | Create a Docker registry secret |
| `update-docker-secret <name>` | Update a Docker registry secret |
| `delete-docker-secret <name>` | Delete a Docker registry secret |
| `list-object-store-secrets` | List object store secrets |
| `create-object-store-secret` | Create an object store secret |
| `update-object-store-secret <name>` | Update an object store secret |
| `delete-object-store-secret <name>` | Delete an object store secret |
| `list-secrets` | List generic secrets |
| `get-secret <name>` | Get generic secret details |
| `create-secret` | Create a generic secret |
| `update-secret <name>` | Update a generic secret |
| `delete-secret <name>` | Delete a generic secret |

### Resource Groups & Services

| Command | Description |
|---------|-------------|
| `list-resource-groups` | List resource groups |
| `get-resource-group <id>` | Get resource group details |
| `create-resource-group` | Create a resource group |
| `update-resource-group <id>` | Update a resource group |
| `delete-resource-group <id>` | Delete a resource group |
| `list-services` | List AI Core services |
| `get-service <name>` | Get service details |

## Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--json` | Output as JSON (available on all commands) | `false` |
| `--dry-run` | Preview action without executing | `false` |
| `--resource-group` | AI resource group (lifecycle commands) | `"default"` |
| `--force` | Skip confirmation on delete commands | `false` |
| `--top` | Max results to return (list commands) | - |
| `--skip` | Results to skip for pagination (list commands) | - |
| `--debug` | Enable debug logging | `false` |
| `--verbose` | Show detailed output | `false` |

## Examples

### Manage Deployments

```bash
# List running deployments
saic-cli list-deployments --status RUNNING

# List deployments as JSON
saic-cli list-deployments --json

# Create a deployment from a configuration
saic-cli create-deployment --config-id <config-id> --resource-group default

# Stop a deployment
saic-cli update-deployment <id> --target-status STOPPED

# Delete a stopped deployment
saic-cli delete-deployment <id> --force
```

### Manage Configurations

```bash
# Create a configuration for GPT-4o
saic-cli create-configuration \
  --name "gpt-4o" \
  --executable-id "azure-openai" \
  --scenario-id "foundation-models" \
  --params '[{"key":"modelName","value":"gpt-4o"}]'

# List configurations for a scenario
saic-cli list-configurations --scenario-id foundation-models
```

### Manage Secrets

```bash
# Create a generic secret
saic-cli create-secret --name my-api-key --data '{"key":"sk-xxx"}'

# List secrets in a resource group
saic-cli list-secrets --resource-group my-group

# Delete a secret
saic-cli delete-secret my-api-key --force
```

### List Foundation Models

```bash
saic-cli list-models --scenario-id foundation-models --json
```

## Uninstall

```bash
saic-cli uninstall
```

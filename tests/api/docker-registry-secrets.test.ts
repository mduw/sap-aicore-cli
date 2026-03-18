import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    DockerRegistrySecretApi: {
      kubesubmitV4DockerRegistrySecretsQuery: vi.fn(() => mockBuilder),
      kubesubmitV4DockerRegistrySecretsCreate: vi.fn(() => mockBuilder),
      kubesubmitV4DockerRegistrySecretsPatch: vi.fn(() => mockBuilder),
      kubesubmitV4DockerRegistrySecretsDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { DockerRegistrySecretApi } from '@sap-ai-sdk/ai-api';
import {
  listDockerRegistrySecrets,
  createDockerRegistrySecret,
  updateDockerRegistrySecret,
  deleteDockerRegistrySecret,
} from '../../src/api/docker-registry-secrets.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('docker-registry-secrets API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDockerRegistrySecrets', () => {
    it('calls DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsQuery', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'docker-secret-1' }] });

      const result = await listDockerRegistrySecrets({ $top: 10 });

      expect(result.success).toBe(true);
      expect(DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsQuery).toHaveBeenCalledWith({ $top: 10 });
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listDockerRegistrySecrets({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('createDockerRegistrySecret', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Created' });

      const result = await createDockerRegistrySecret({
        name: 'my-secret',
        data: { '.dockerconfigjson': '{}' },
      } as any);

      expect(result.success).toBe(true);
      expect(DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsCreate).toHaveBeenCalledWith({
        name: 'my-secret',
        data: { '.dockerconfigjson': '{}' },
      });
    });
  });

  describe('updateDockerRegistrySecret', () => {
    it('passes name and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Updated' });

      const result = await updateDockerRegistrySecret(
        'my-secret',
        { data: { '.dockerconfigjson': '{}' } },
      );

      expect(result.success).toBe(true);
      expect(DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsPatch).toHaveBeenCalledWith(
        'my-secret',
        { data: { '.dockerconfigjson': '{}' } },
      );
    });
  });

  describe('deleteDockerRegistrySecret', () => {
    it('passes secret name', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteDockerRegistrySecret('my-secret');

      expect(result.success).toBe(true);
      expect(DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsDelete).toHaveBeenCalledWith('my-secret');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ObjectStoreSecretApi: {
      kubesubmitV4ObjectStoreSecretsQuery: vi.fn(() => mockBuilder),
      kubesubmitV4ObjectStoreSecretsCreate: vi.fn(() => mockBuilder),
      kubesubmitV4ObjectStoreSecretsPatch: vi.fn(() => mockBuilder),
      kubesubmitV4ObjectStoreSecretsDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ObjectStoreSecretApi } from '@sap-ai-sdk/ai-api';
import {
  listObjectStoreSecrets,
  createObjectStoreSecret,
  updateObjectStoreSecret,
  deleteObjectStoreSecret,
} from '../../src/api/object-store-secrets.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('object-store-secrets API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listObjectStoreSecrets', () => {
    it('calls ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsQuery', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'os-secret-1' }] });

      const result = await listObjectStoreSecrets({ $top: 10 });

      expect(result.success).toBe(true);
      expect(ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsQuery).toHaveBeenCalledWith({ $top: 10 });
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listObjectStoreSecrets({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('createObjectStoreSecret', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Created' });

      const result = await createObjectStoreSecret({
        name: 'my-secret',
        type: 'S3',
        data: { bucket: 'my-bucket' },
      } as any);

      expect(result.success).toBe(true);
      expect(ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsCreate).toHaveBeenCalledWith({
        name: 'my-secret',
        type: 'S3',
        data: { bucket: 'my-bucket' },
      });
    });
  });

  describe('updateObjectStoreSecret', () => {
    it('passes name and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Updated' });

      const result = await updateObjectStoreSecret(
        'my-secret',
        { name: 'my-secret', type: 'S3', data: { bucket: 'new-bucket' } } as any,
      );

      expect(result.success).toBe(true);
      expect(ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsPatch).toHaveBeenCalledWith(
        'my-secret',
        { name: 'my-secret', type: 'S3', data: { bucket: 'new-bucket' } },
      );
    });
  });

  describe('deleteObjectStoreSecret', () => {
    it('passes secret name', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteObjectStoreSecret('my-secret');

      expect(result.success).toBe(true);
      expect(ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsDelete).toHaveBeenCalledWith('my-secret');
    });
  });
});

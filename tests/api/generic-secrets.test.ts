import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    SecretApi: {
      kubesubmitV4GenericSecretsGetAll: vi.fn(() => mockBuilder),
      kubesubmitV4GenericSecretsGet: vi.fn(() => mockBuilder),
      kubesubmitV4GenericSecretsCreate: vi.fn(() => mockBuilder),
      kubesubmitV4GenericSecretsUpdate: vi.fn(() => mockBuilder),
      kubesubmitV4GenericSecretsDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { SecretApi } from '@sap-ai-sdk/ai-api';
import {
  listGenericSecrets,
  getGenericSecret,
  createGenericSecret,
  updateGenericSecret,
  deleteGenericSecret,
} from '../../src/api/generic-secrets.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('generic-secrets API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listGenericSecrets', () => {
    it('calls SecretApi.kubesubmitV4GenericSecretsGetAll', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'secret-1' }] });

      const result = await listGenericSecrets({ $top: 10 });

      expect(result.success).toBe(true);
      expect(SecretApi.kubesubmitV4GenericSecretsGetAll).toHaveBeenCalledWith({ $top: 10 });
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listGenericSecrets({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getGenericSecret', () => {
    it('passes secret name correctly', async () => {
      mockExecute.mockResolvedValueOnce({ name: 'secret-1' });

      const result = await getGenericSecret('secret-1');

      expect(result.success).toBe(true);
      expect(SecretApi.kubesubmitV4GenericSecretsGet).toHaveBeenCalledWith('secret-1');
    });
  });

  describe('createGenericSecret', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Created' });

      const result = await createGenericSecret({
        name: 'my-secret',
        data: { key: 'value' },
      } as any);

      expect(result.success).toBe(true);
      expect(SecretApi.kubesubmitV4GenericSecretsCreate).toHaveBeenCalledWith({
        name: 'my-secret',
        data: { key: 'value' },
      });
    });
  });

  describe('updateGenericSecret', () => {
    it('passes name and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Updated' });

      const result = await updateGenericSecret(
        'my-secret',
        { data: { key: 'new-value' } } as any,
      );

      expect(result.success).toBe(true);
      expect(SecretApi.kubesubmitV4GenericSecretsUpdate).toHaveBeenCalledWith(
        'my-secret',
        { data: { key: 'new-value' } },
      );
    });
  });

  describe('deleteGenericSecret', () => {
    it('passes secret name', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteGenericSecret('my-secret');

      expect(result.success).toBe(true);
      expect(SecretApi.kubesubmitV4GenericSecretsDelete).toHaveBeenCalledWith('my-secret');
    });
  });
});

/**
 * Integration Tests for MockRestService
 *
 * Tests REST API mock implementation (GET, POST, PATCH, DELETE, BATCH)
 */

import MockRestService from '../../../mock/services/MockRestService';

// Mock fetch
global.fetch = jest.fn();

describe('MockRestService - Integration Tests', () => {
  let service: MockRestService;

  beforeEach(() => {
    service = new MockRestService({ baseUrl: '/b1s/v2' });
    (fetch as jest.Mock).mockClear();

    // Setup mock fetch responses for data loader
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('warehouses.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            '@odata.context': '/b1s/v2/$metadata#Warehouses',
            value: [
              { WarehouseCode: 'WH01', WarehouseName: 'Main', EnableBinLocations: 'tYES' },
              { WarehouseCode: 'WH02', WarehouseName: 'Secondary', EnableBinLocations: 'tYES' },
              { WarehouseCode: 'WH03', WarehouseName: 'Seasonal', EnableBinLocations: 'tNO' }
            ]
          })
        });
      }
      if (url.includes('items.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { ItemCode: 'ITEM001', ItemName: 'Laptop', Quantity: 50 },
              { ItemCode: 'ITEM002', ItemName: 'Monitor', Quantity: 100 },
              { ItemCode: 'ITEM003', ItemName: 'Keyboard', Quantity: 200 }
            ]
          })
        });
      }
      if (url.includes('stocktransfers.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            idCounter: 10,
            value: [
              { DocEntry: 1, DocNum: 1, FromWarehouse: 'WH01', ToWarehouse: 'WH02' }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ value: [] })
      });
    });
  });

  describe('GET - Collection Requests', () => {
    test('should GET collection with OData response format', async () => {
      const result = await service.requestGET('/Warehouses');

      expect(result).toHaveProperty('@odata.context');
      expect(result['@odata.context']).toContain('Warehouses');
      expect(result).toHaveProperty('value');
      expect(Array.isArray(result.value)).toBe(true);
      expect(result.value.length).toBe(3);
    });

    test('should return all warehouses', async () => {
      const result = await service.requestGET('/Warehouses');

      expect(result.value).toHaveLength(3);
      expect(result.value[0].WarehouseCode).toBe('WH01');
      expect(result.value[1].WarehouseCode).toBe('WH02');
      expect(result.value[2].WarehouseCode).toBe('WH03');
    });

    test('should handle empty collections', async () => {
      const result = await service.requestGET('/EmptyEntity');

      expect(result.value).toEqual([]);
    });
  });

  describe('GET - Single Entity Requests', () => {
    test('should GET single entity by ID (with parentheses)', async () => {
      const result = await service.requestGET('/Warehouses(\'WH01\')');

      expect(result.WarehouseCode).toBe('WH01');
      expect(result.WarehouseName).toBe('Main');
      expect(result['@odata.context']).toContain('Warehouses/$entity');
    });

    test('should GET single entity by ID (with slash)', async () => {
      const result = await service.requestGET('/Warehouses/WH01');

      expect(result.WarehouseCode).toBe('WH01');
    });

    test('should throw error for non-existent entity', async () => {
      await expect(
        service.requestGET('/Warehouses(\'NONEXISTENT\')')
      ).rejects.toThrow();
    });
  });

  describe('GET - OData Query Options', () => {
    test('should apply $filter query', async () => {
      const result = await service.requestGET('/Warehouses?$filter=EnableBinLocations eq \'tYES\'');

      expect(result.value).toHaveLength(2);
      result.value.forEach((wh: any) => {
        expect(wh.EnableBinLocations).toBe('tYES');
      });
    });

    test('should apply $orderby query', async () => {
      const result = await service.requestGET('/Items?$orderby=ItemCode desc');

      expect(result.value[0].ItemCode).toBe('ITEM003');
      expect(result.value[2].ItemCode).toBe('ITEM001');
    });

    test('should apply $top query', async () => {
      const result = await service.requestGET('/Items?$top=2');

      expect(result.value).toHaveLength(2);
    });

    test('should apply $skip query', async () => {
      const result = await service.requestGET('/Items?$skip=1');

      expect(result.value).toHaveLength(2);
      expect(result.value[0].ItemCode).toBe('ITEM002');
    });

    test('should apply $select query', async () => {
      const result = await service.requestGET('/Items?$select=ItemCode,ItemName');

      expect(result.value[0]).toHaveProperty('ItemCode');
      expect(result.value[0]).toHaveProperty('ItemName');
      expect(result.value[0]).not.toHaveProperty('Quantity');
    });

    test('should apply $count query', async () => {
      const result = await service.requestGET('/Items?$count=true&$top=2');

      expect(result.value).toHaveLength(2);
      expect(result['@odata.count']).toBe(3);
    });

    test('should apply complex query combination', async () => {
      const result = await service.requestGET(
        '/Items?$filter=Quantity gt 50&$orderby=Quantity desc&$top=2&$select=ItemCode,Quantity&$count=true'
      );

      expect(result.value).toHaveLength(2);
      expect(result['@odata.count']).toBe(2); // 2 items with Quantity > 50
      expect(result.value[0]).toHaveProperty('ItemCode');
      expect(result.value[0]).not.toHaveProperty('ItemName');
      expect(result.value[0].Quantity).toBeGreaterThan(result.value[1].Quantity);
    });
  });

  describe('POST - Create Entity', () => {
    test('should POST new entity', async () => {
      const newWarehouse = {
        WarehouseCode: 'WH99',
        WarehouseName: 'New Warehouse',
        EnableBinLocations: 'tYES'
      };

      const result = await service.requestPOST('/Warehouses', newWarehouse);

      expect(result.WarehouseCode).toBe('WH99');
      expect(result.WarehouseName).toBe('New Warehouse');
      expect(result['@odata.context']).toContain('Warehouses/$entity');
    });

    test('should generate DocEntry for documents', async () => {
      const newTransfer = {
        FromWarehouse: 'WH01',
        ToWarehouse: 'WH02'
      };

      const result = await service.requestPOST('/StockTransfers', newTransfer);

      expect(result.DocEntry).toBe(10); // From idCounter
      expect(result.DocNum).toBe(10);
      expect(result.FromWarehouse).toBe('WH01');
    });

    test('should persist created entity', async () => {
      const newWarehouse = {
        WarehouseCode: 'WH99',
        WarehouseName: 'Test'
      };

      await service.requestPOST('/Warehouses', newWarehouse);

      const allWarehouses = await service.requestGET('/Warehouses');
      expect(allWarehouses.value).toHaveLength(4); // 3 original + 1 new
    });
  });

  describe('PATCH - Update Entity', () => {
    test('should PATCH update entity', async () => {
      const updates = {
        WarehouseName: 'Updated Main Warehouse'
      };

      const result = await service.requestPATCH('/Warehouses(\'WH01\')', updates);

      // PATCH returns null (204 No Content) in SAP B1
      expect(result).toBeNull();
    });

    test('should persist PATCH updates', async () => {
      const updates = {
        WarehouseName: 'Updated Name'
      };

      await service.requestPATCH('/Warehouses(\'WH01\')', updates);

      const updated = await service.requestGET('/Warehouses(\'WH01\')');
      expect(updated.WarehouseName).toBe('Updated Name');
      expect(updated.WarehouseCode).toBe('WH01'); // Unchanged
    });

    test('should merge PATCH updates with existing data', async () => {
      await service.requestPATCH('/Warehouses(\'WH01\')', {
        WarehouseName: 'New Name'
      });

      const updated = await service.requestGET('/Warehouses(\'WH01\')');
      expect(updated.WarehouseName).toBe('New Name');
      expect(updated.EnableBinLocations).toBe('tYES'); // Unchanged
    });

    test('should throw error when PATCH without ID', async () => {
      await expect(
        service.requestPATCH('/Warehouses', {})
      ).rejects.toThrow('requires an entity ID');
    });

    test('should throw error when PATCH non-existent entity', async () => {
      await expect(
        service.requestPATCH('/Warehouses(\'NONEXISTENT\')', {})
      ).rejects.toThrow();
    });
  });

  describe('PUT - Replace Entity', () => {
    test('should PUT (uses PATCH logic)', async () => {
      const result = await service.requestPUT('/Warehouses(\'WH01\')', {
        WarehouseName: 'Replaced'
      });

      expect(result).toBeNull(); // 204 No Content
    });
  });

  describe('DELETE - Remove Entity', () => {
    test('should DELETE entity', async () => {
      const result = await service.requestDELETE('/Warehouses(\'WH03\')');

      expect(result).toBeNull(); // 204 No Content
    });

    test('should remove entity from collection', async () => {
      await service.requestDELETE('/Warehouses(\'WH03\')');

      const allWarehouses = await service.requestGET('/Warehouses');
      expect(allWarehouses.value).toHaveLength(2); // Was 3, now 2
    });

    test('should not find deleted entity', async () => {
      await service.requestDELETE('/Warehouses(\'WH03\')');

      await expect(
        service.requestGET('/Warehouses(\'WH03\')')
      ).rejects.toThrow();
    });

    test('should throw error when DELETE without ID', async () => {
      await expect(
        service.requestDELETE('/Warehouses')
      ).rejects.toThrow('requires an entity ID');
    });

    test('should throw error when DELETE non-existent entity', async () => {
      await expect(
        service.requestDELETE('/Warehouses(\'NONEXISTENT\')')
      ).rejects.toThrow();
    });
  });

  describe('BATCH - Batch Requests', () => {
    test('should handle BATCH with multiple GET requests', async () => {
      const batchParams = [
        { method: 'GET', url: '/Warehouses' },
        { method: 'GET', url: '/Items' }
      ];

      const results = await service.BATCHRequest(batchParams as any);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe(200);
      expect(results[1].status).toBe(200);
      expect(results[0].response.value).toHaveLength(3); // Warehouses
      expect(results[1].response.value).toHaveLength(3); // Items
    });

    test('should handle BATCH with mixed operations', async () => {
      const batchParams = [
        { method: 'GET', url: '/Warehouses(\'WH01\')' },
        {
          method: 'POST',
          url: '/Warehouses',
          payload: { WarehouseCode: 'BATCH1', WarehouseName: 'Batch Test' }
        },
        {
          method: 'PATCH',
          url: '/Warehouses(\'WH01\')',
          payload: { WarehouseName: 'Updated in Batch' }
        },
        { method: 'DELETE', url: '/Warehouses(\'WH03\')' }
      ];

      const results = await service.BATCHRequest(batchParams as any);

      expect(results).toHaveLength(4);
      expect(results[0].status).toBe(200); // GET success
      expect(results[1].status).toBe(200); // POST success
      expect(results[2].status).toBe(204); // PATCH success (No Content)
      expect(results[3].status).toBe(204); // DELETE success (No Content)
    });

    test('should handle BATCH with errors', async () => {
      const batchParams = [
        { method: 'GET', url: '/Warehouses(\'NONEXISTENT\')' },
        { method: 'GET', url: '/Items' }
      ];

      const results = await service.BATCHRequest(batchParams as any);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe(500); // Error
      expect(results[0]).toHaveProperty('error');
      expect(results[1].status).toBe(200); // Success
    });

    test('should process BATCH sequentially', async () => {
      const batchParams = [
        {
          method: 'POST',
          url: '/Warehouses',
          payload: { WarehouseCode: 'SEQ1', WarehouseName: 'Sequential 1' }
        },
        {
          method: 'PATCH',
          url: '/Warehouses(\'SEQ1\')',
          payload: { WarehouseName: 'Updated Sequential' }
        },
        { method: 'GET', url: '/Warehouses(\'SEQ1\')' }
      ];

      const results = await service.BATCHRequest(batchParams as any);

      expect(results).toHaveLength(3);
      expect(results[2].response.WarehouseName).toBe('Updated Sequential');
    });
  });

  describe('requestGETALL - Pagination', () => {
    test('should get all items without pagination', async () => {
      const result = await service.requestGETALL('/Items');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });
  });

  describe('requestVIEWSALL - Views', () => {
    test('should get all from views', async () => {
      const result = await service.requestVIEWSALL('/ItemsView');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('CSRF Token', () => {
    test('should set and get CSRF token', () => {
      service.setCsrfToken('test-token-12345');

      expect(service.getCsrfToken()).toBe('test-token-12345');
    });

    test('should have default mock CSRF token', () => {
      const token = service.getCsrfToken();

      expect(token).toBe('mock-csrf-token');
    });
  });

  describe('Complex Integration Scenarios', () => {
    test('should support full CRUD lifecycle', async () => {
      // CREATE
      const newWarehouse = {
        WarehouseCode: 'CRUD1',
        WarehouseName: 'CRUD Test',
        EnableBinLocations: 'tYES'
      };
      const created = await service.requestPOST('/Warehouses', newWarehouse);
      expect(created.WarehouseCode).toBe('CRUD1');

      // READ
      const read = await service.requestGET('/Warehouses(\'CRUD1\')');
      expect(read.WarehouseName).toBe('CRUD Test');

      // UPDATE
      await service.requestPATCH('/Warehouses(\'CRUD1\')', {
        WarehouseName: 'Updated CRUD'
      });
      const updated = await service.requestGET('/Warehouses(\'CRUD1\')');
      expect(updated.WarehouseName).toBe('Updated CRUD');

      // DELETE
      await service.requestDELETE('/Warehouses(\'CRUD1\')');
      await expect(
        service.requestGET('/Warehouses(\'CRUD1\')')
      ).rejects.toThrow();
    });

    test('should handle concurrent operations', async () => {
      const operations = [
        service.requestGET('/Warehouses'),
        service.requestGET('/Items'),
        service.requestPOST('/Warehouses', {
          WarehouseCode: 'CONC1',
          WarehouseName: 'Concurrent 1'
        })
      ];

      const results = await Promise.all(operations);

      expect(results[0].value).toHaveLength(3);
      expect(results[1].value).toHaveLength(3);
      expect(results[2].WarehouseCode).toBe('CONC1');
    });
  });
});

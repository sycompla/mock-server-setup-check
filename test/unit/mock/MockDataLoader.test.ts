/**
 * Unit Tests for MockDataLoader
 *
 * Tests JSON data loading and in-memory CRUD operations
 */

import MockDataLoader from '../../../mock/services/MockDataLoader';

// Mock fetch for testing
global.fetch = jest.fn();

describe('MockDataLoader', () => {
  let loader: MockDataLoader;

  beforeEach(() => {
    loader = new MockDataLoader();
    (fetch as jest.Mock).mockClear();
  });

  describe('Initialization', () => {
    test('should initialize and load entity sets', async () => {
      // Mock fetch responses
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('warehouses.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              '@odata.context': '/b1s/v2/$metadata#Warehouses',
              value: [
                { WarehouseCode: 'WH01', WarehouseName: 'Main' },
                { WarehouseCode: 'WH02', WarehouseName: 'Secondary' }
              ]
            })
          });
        }
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({})
        });
      });

      await loader.init();

      const entitySets = loader.getEntitySets();

      expect(entitySets.length).toBeGreaterThan(0);
      expect(fetch).toHaveBeenCalled();
    });

    test('should handle missing files gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({})
      });

      await loader.init();

      // Should not throw, should store empty data
      const data = loader.getData('NonExistentEntity');
      expect(data.value).toEqual([]);
    });

    test('should not reinitialize if already initialized', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [] })
      });

      await loader.init();
      const callCount1 = (fetch as jest.Mock).mock.calls.length;

      await loader.init();
      const callCount2 = (fetch as jest.Mock).mock.calls.length;

      expect(callCount2).toBe(callCount1); // No additional fetches
    });
  });

  describe('getData', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('warehouses.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { WarehouseCode: 'WH01', WarehouseName: 'Main' },
                { WarehouseCode: 'WH02', WarehouseName: 'Secondary' }
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ value: [] }) });
      });

      await loader.init();
    });

    test('should return data for entity set', () => {
      const data = loader.getData('Warehouses');

      expect(data).toHaveProperty('value');
      expect(Array.isArray(data.value)).toBe(true);
    });

    test('should return deep copy to prevent mutation', () => {
      const data1 = loader.getData('Warehouses');
      const data2 = loader.getData('Warehouses');

      data1.value[0].WarehouseName = 'Modified';

      expect(data2.value[0].WarehouseName).toBe('Main'); // Not modified
    });

    test('should return empty array for unknown entity set', () => {
      const data = loader.getData('UnknownEntitySet');

      expect(data.value).toEqual([]);
    });

    test('should throw error if not initialized', () => {
      const uninitializedLoader = new MockDataLoader();

      expect(() => {
        uninitializedLoader.getData('Warehouses');
      }).toThrow('Not initialized');
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('warehouses.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { WarehouseCode: 'WH01', WarehouseName: 'Main' },
                { WarehouseCode: 'WH02', WarehouseName: 'Secondary' }
              ]
            })
          });
        }
        if (url.includes('stocktransfers.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { DocEntry: 1, DocNum: 1, FromWarehouse: 'WH01' },
                { DocEntry: 2, DocNum: 2, FromWarehouse: 'WH02' }
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ value: [] }) });
      });

      await loader.init();
    });

    test('should find entity by WarehouseCode', () => {
      const warehouse = loader.findById('Warehouses', 'WH01');

      expect(warehouse).not.toBeNull();
      expect(warehouse.WarehouseCode).toBe('WH01');
      expect(warehouse.WarehouseName).toBe('Main');
    });

    test('should find entity by DocEntry', () => {
      const transfer = loader.findById('StockTransfers', 1);

      expect(transfer).not.toBeNull();
      expect(transfer.DocEntry).toBe(1);
      expect(transfer.DocNum).toBe(1);
    });

    test('should return null for non-existent ID', () => {
      const entity = loader.findById('Warehouses', 'NONEXISTENT');

      expect(entity).toBeNull();
    });

    test('should return null for empty collection', () => {
      const entity = loader.findById('EmptyEntity', 'ID');

      expect(entity).toBeNull();
    });
  });

  describe('addEntity', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('warehouses.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { WarehouseCode: 'WH01', WarehouseName: 'Main' }
              ]
            })
          });
        }
        if (url.includes('stocktransfers.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              idCounter: 10,
              value: []
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ value: [] }) });
      });

      await loader.init();
    });

    test('should add new entity to collection', () => {
      const newWarehouse = {
        WarehouseCode: 'WH99',
        WarehouseName: 'Test Warehouse'
      };

      const created = loader.addEntity('Warehouses', newWarehouse);

      expect(created.WarehouseCode).toBe('WH99');

      const data = loader.getData('Warehouses');
      expect(data.value.length).toBe(2); // Was 1, now 2
    });

    test('should generate DocEntry and DocNum if idCounter exists', () => {
      const newTransfer = {
        FromWarehouse: 'WH01',
        ToWarehouse: 'WH02'
      };

      const created = loader.addEntity('StockTransfers', newTransfer);

      expect(created.DocEntry).toBe(10);
      expect(created.DocNum).toBe(10);
      expect(created.FromWarehouse).toBe('WH01');
    });

    test('should increment idCounter after adding', () => {
      loader.addEntity('StockTransfers', {});
      const created2 = loader.addEntity('StockTransfers', {});

      expect(created2.DocEntry).toBe(11); // Incremented
    });
  });

  describe('updateEntity', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('warehouses.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { WarehouseCode: 'WH01', WarehouseName: 'Main', City: 'Budapest' },
                { WarehouseCode: 'WH02', WarehouseName: 'Secondary', City: 'Debrecen' }
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ value: [] }) });
      });

      await loader.init();
    });

    test('should update existing entity', () => {
      const updated = loader.updateEntity('Warehouses', 'WH01', {
        WarehouseName: 'Updated Main'
      });

      expect(updated).not.toBeNull();
      expect(updated.WarehouseName).toBe('Updated Main');
      expect(updated.WarehouseCode).toBe('WH01'); // Unchanged
      expect(updated.City).toBe('Budapest'); // Unchanged
    });

    test('should merge updates with existing data', () => {
      const updated = loader.updateEntity('Warehouses', 'WH01', {
        City: 'Szeged'
      });

      expect(updated.City).toBe('Szeged');
      expect(updated.WarehouseName).toBe('Main'); // Unchanged
    });

    test('should return null for non-existent entity', () => {
      const updated = loader.updateEntity('Warehouses', 'NONEXISTENT', {
        WarehouseName: 'Test'
      });

      expect(updated).toBeNull();
    });

    test('should persist update in cache', () => {
      loader.updateEntity('Warehouses', 'WH01', {
        WarehouseName: 'New Name'
      });

      const found = loader.findById('Warehouses', 'WH01');
      expect(found.WarehouseName).toBe('New Name');
    });
  });

  describe('deleteEntity', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('warehouses.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              value: [
                { WarehouseCode: 'WH01', WarehouseName: 'Main' },
                { WarehouseCode: 'WH02', WarehouseName: 'Secondary' },
                { WarehouseCode: 'WH03', WarehouseName: 'Seasonal' }
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ value: [] }) });
      });

      await loader.init();
    });

    test('should delete existing entity', () => {
      const deleted = loader.deleteEntity('Warehouses', 'WH02');

      expect(deleted).toBe(true);

      const data = loader.getData('Warehouses');
      expect(data.value.length).toBe(2); // Was 3, now 2
    });

    test('should remove entity from cache', () => {
      loader.deleteEntity('Warehouses', 'WH02');

      const found = loader.findById('Warehouses', 'WH02');
      expect(found).toBeNull();
    });

    test('should return false for non-existent entity', () => {
      const deleted = loader.deleteEntity('Warehouses', 'NONEXISTENT');

      expect(deleted).toBe(false);
    });

    test('should not affect other entities', () => {
      loader.deleteEntity('Warehouses', 'WH02');

      const wh01 = loader.findById('Warehouses', 'WH01');
      const wh03 = loader.findById('Warehouses', 'WH03');

      expect(wh01).not.toBeNull();
      expect(wh03).not.toBeNull();
    });
  });

  describe('setData', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [] })
      });

      await loader.init();
    });

    test('should set data for entity set', () => {
      const newData = {
        value: [
          { ItemCode: 'ITEM001', ItemName: 'Test Item' }
        ]
      };

      loader.setData('Items', newData);

      const data = loader.getData('Items');
      expect(data.value.length).toBe(1);
      expect(data.value[0].ItemCode).toBe('ITEM001');
    });
  });

  describe('clearCache', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [] })
      });

      await loader.init();
    });

    test('should clear cache and reset initialization flag', () => {
      loader.clearCache();

      expect(() => {
        loader.getData('Warehouses');
      }).toThrow('Not initialized');
    });
  });

  describe('getEntitySets', () => {
    beforeEach(async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [] })
      });

      await loader.init();
    });

    test('should return list of cached entity sets', () => {
      const entitySets = loader.getEntitySets();

      expect(Array.isArray(entitySets)).toBe(true);
      expect(entitySets.length).toBeGreaterThan(0);
    });
  });
});

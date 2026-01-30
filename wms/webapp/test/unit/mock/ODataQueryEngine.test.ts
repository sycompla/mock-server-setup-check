/**
 * Unit Tests for ODataQueryEngine
 *
 * Tests OData query parsing and execution:
 * - $filter operators
 * - $orderby
 * - $top, $skip (pagination)
 * - $select (field projection)
 * - $count
 */

import ODataQueryEngine from '../../../mock/services/ODataQueryEngine';

describe('ODataQueryEngine', () => {
  let engine: ODataQueryEngine;

  beforeEach(() => {
    engine = new ODataQueryEngine();
  });

  describe('$filter - Equality Operator (eq)', () => {
    test('should filter by string equality', () => {
      const data = [
        { WarehouseCode: 'WH01', Name: 'Main' },
        { WarehouseCode: 'WH02', Name: 'Secondary' },
        { WarehouseCode: 'WH03', Name: 'Seasonal' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "WarehouseCode eq 'WH01'"
      });

      expect(result.value).toHaveLength(1);
      expect(result.value[0].WarehouseCode).toBe('WH01');
      expect(result.value[0].Name).toBe('Main');
    });

    test('should return empty array when no match', () => {
      const data = [
        { WarehouseCode: 'WH01', Name: 'Main' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "WarehouseCode eq 'NONEXISTENT'"
      });

      expect(result.value).toHaveLength(0);
    });
  });

  describe('$filter - Comparison Operators (gt, lt, ge, le)', () => {
    test('should filter by greater than (gt)', () => {
      const data = [
        { ItemCode: 'A', Quantity: 10 },
        { ItemCode: 'B', Quantity: 25 },
        { ItemCode: 'C', Quantity: 5 }
      ];

      const result = engine.applyQuery(data, {
        $filter: 'Quantity gt 10'
      });

      expect(result.value).toHaveLength(1);
      expect(result.value[0].ItemCode).toBe('B');
      expect(result.value[0].Quantity).toBe(25);
    });

    test('should filter by less than (lt)', () => {
      const data = [
        { ItemCode: 'A', Quantity: 10 },
        { ItemCode: 'B', Quantity: 25 },
        { ItemCode: 'C', Quantity: 5 }
      ];

      const result = engine.applyQuery(data, {
        $filter: 'Quantity lt 10'
      });

      expect(result.value).toHaveLength(1);
      expect(result.value[0].ItemCode).toBe('C');
    });

    test('should filter by greater or equal (ge)', () => {
      const data = [
        { ItemCode: 'A', Quantity: 10 },
        { ItemCode: 'B', Quantity: 25 }
      ];

      const result = engine.applyQuery(data, {
        $filter: 'Quantity ge 10'
      });

      expect(result.value).toHaveLength(2);
    });

    test('should filter by less or equal (le)', () => {
      const data = [
        { ItemCode: 'A', Quantity: 10 },
        { ItemCode: 'B', Quantity: 25 }
      ];

      const result = engine.applyQuery(data, {
        $filter: 'Quantity le 10'
      });

      expect(result.value).toHaveLength(1);
      expect(result.value[0].Quantity).toBe(10);
    });
  });

  describe('$filter - Logical Operators (and, or)', () => {
    test('should filter with AND logic', () => {
      const data = [
        { ItemCode: 'A', Quantity: 15, Active: 'tYES' },
        { ItemCode: 'B', Quantity: 25, Active: 'tNO' },
        { ItemCode: 'C', Quantity: 20, Active: 'tYES' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "Quantity gt 10 and Active eq 'tYES'"
      });

      expect(result.value).toHaveLength(2);
      expect(result.value[0].ItemCode).toBe('A');
      expect(result.value[1].ItemCode).toBe('C');
    });

    test('should filter with OR logic', () => {
      const data = [
        { ItemCode: 'A', Quantity: 5 },
        { ItemCode: 'B', Quantity: 15 },
        { ItemCode: 'C', Quantity: 25 }
      ];

      const result = engine.applyQuery(data, {
        $filter: "Quantity lt 10 or Quantity gt 20"
      });

      expect(result.value).toHaveLength(2);
      expect(result.value[0].ItemCode).toBe('A');
      expect(result.value[1].ItemCode).toBe('C');
    });
  });

  describe('$filter - String Functions', () => {
    test('should filter with contains()', () => {
      const data = [
        { ItemName: 'Laptop HP EliteBook' },
        { ItemName: 'Monitor Dell' },
        { ItemName: 'Keyboard Logitech' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "contains(ItemName,'Laptop')"
      });

      expect(result.value).toHaveLength(1);
      expect(result.value[0].ItemName).toContain('Laptop');
    });

    test('should filter with startswith()', () => {
      const data = [
        { ItemCode: 'ITEM001' },
        { ItemCode: 'ITEM002' },
        { ItemCode: 'PROD001' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "startswith(ItemCode,'ITEM')"
      });

      expect(result.value).toHaveLength(2);
    });

    test('should filter with endswith()', () => {
      const data = [
        { FileName: 'document.pdf' },
        { FileName: 'image.jpg' },
        { FileName: 'report.pdf' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "endswith(FileName,'pdf')"
      });

      expect(result.value).toHaveLength(2);
    });
  });

  describe('$orderby - Sorting', () => {
    test('should sort ascending', () => {
      const data = [
        { ItemCode: 'C', Name: 'Charlie' },
        { ItemCode: 'A', Name: 'Alice' },
        { ItemCode: 'B', Name: 'Bob' }
      ];

      const result = engine.applyQuery(data, {
        $orderby: 'ItemCode asc'
      });

      expect(result.value[0].ItemCode).toBe('A');
      expect(result.value[1].ItemCode).toBe('B');
      expect(result.value[2].ItemCode).toBe('C');
    });

    test('should sort descending', () => {
      const data = [
        { ItemCode: 'C', Name: 'Charlie' },
        { ItemCode: 'A', Name: 'Alice' },
        { ItemCode: 'B', Name: 'Bob' }
      ];

      const result = engine.applyQuery(data, {
        $orderby: 'ItemCode desc'
      });

      expect(result.value[0].ItemCode).toBe('C');
      expect(result.value[1].ItemCode).toBe('B');
      expect(result.value[2].ItemCode).toBe('A');
    });

    test('should sort by multiple fields', () => {
      const data = [
        { Category: 'B', ItemCode: 'B2' },
        { Category: 'A', ItemCode: 'A1' },
        { Category: 'B', ItemCode: 'B1' }
      ];

      const result = engine.applyQuery(data, {
        $orderby: 'Category asc, ItemCode asc'
      });

      expect(result.value[0]).toEqual({ Category: 'A', ItemCode: 'A1' });
      expect(result.value[1]).toEqual({ Category: 'B', ItemCode: 'B1' });
      expect(result.value[2]).toEqual({ Category: 'B', ItemCode: 'B2' });
    });
  });

  describe('$top and $skip - Pagination', () => {
    test('should limit results with $top', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

      const result = engine.applyQuery(data, {
        $top: '10'
      });

      expect(result.value).toHaveLength(10);
      expect(result.value[0].id).toBe(0);
      expect(result.value[9].id).toBe(9);
    });

    test('should skip results with $skip', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

      const result = engine.applyQuery(data, {
        $skip: '20'
      });

      expect(result.value).toHaveLength(80);
      expect(result.value[0].id).toBe(20);
    });

    test('should combine $skip and $top for pagination', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

      const result = engine.applyQuery(data, {
        $skip: '20',
        $top: '10'
      });

      expect(result.value).toHaveLength(10);
      expect(result.value[0].id).toBe(20);
      expect(result.value[9].id).toBe(29);
    });
  });

  describe('$select - Field Projection', () => {
    test('should select specific fields', () => {
      const data = [
        {
          ItemCode: 'A',
          ItemName: 'Product A',
          Price: 100,
          Stock: 50,
          Category: 'Electronics'
        }
      ];

      const result = engine.applyQuery(data, {
        $select: 'ItemCode,ItemName'
      });

      expect(result.value[0]).toHaveProperty('ItemCode');
      expect(result.value[0]).toHaveProperty('ItemName');
      expect(result.value[0]).not.toHaveProperty('Price');
      expect(result.value[0]).not.toHaveProperty('Stock');
      expect(result.value[0]).not.toHaveProperty('Category');
    });

    test('should handle multiple selected fields', () => {
      const data = [
        { a: 1, b: 2, c: 3, d: 4, e: 5 }
      ];

      const result = engine.applyQuery(data, {
        $select: 'a,c,e'
      });

      expect(Object.keys(result.value[0])).toEqual(['a', 'c', 'e']);
    });
  });

  describe('$count - Total Count', () => {
    test('should return @odata.count when requested', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

      const result = engine.applyQuery(data, {
        $top: '10',
        $count: 'true'
      });

      expect(result.value).toHaveLength(10);
      expect(result['@odata.count']).toBe(100);
    });

    test('should return count after filtering', () => {
      const data = [
        { Active: 'tYES' },
        { Active: 'tYES' },
        { Active: 'tNO' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "Active eq 'tYES'",
        $count: 'true'
      });

      expect(result.value).toHaveLength(2);
      expect(result['@odata.count']).toBe(2);
    });

    test('should not include @odata.count when not requested', () => {
      const data = [{ id: 1 }];

      const result = engine.applyQuery(data, {});

      expect(result['@odata.count']).toBeUndefined();
    });
  });

  describe('parseQueryString', () => {
    test('should parse query string into QueryOptions', () => {
      const queryString = "$filter=Active eq 'tYES'&$orderby=ItemCode&$top=10&$skip=5&$count=true&$select=ItemCode,ItemName";

      const options = engine.parseQueryString(queryString);

      expect(options.$filter).toBe("Active eq 'tYES'");
      expect(options.$orderby).toBe('ItemCode');
      expect(options.$top).toBe('10');
      expect(options.$skip).toBe('5');
      expect(options.$count).toBe('true');
      expect(options.$select).toBe('ItemCode,ItemName');
    });

    test('should handle empty query string', () => {
      const options = engine.parseQueryString('');

      expect(options).toEqual({});
    });
  });

  describe('extractQueryString', () => {
    test('should extract query string from URL', () => {
      const url = '/Warehouses?$filter=Active eq \'tYES\'&$top=10';

      const queryString = engine.extractQueryString(url);

      expect(queryString).toBe("$filter=Active eq 'tYES'&$top=10");
    });

    test('should return empty string for URL without query', () => {
      const url = '/Warehouses';

      const queryString = engine.extractQueryString(url);

      expect(queryString).toBe('');
    });
  });

  describe('Complex Query Combinations', () => {
    test('should handle filter + orderby + pagination', () => {
      const data = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        value: i % 2 === 0 ? 'EVEN' : 'ODD',
        score: Math.floor(Math.random() * 100)
      }));

      const result = engine.applyQuery(data, {
        $filter: "value eq 'EVEN'",
        $orderby: 'id desc',
        $skip: '5',
        $top: '10'
      });

      expect(result.value).toHaveLength(10);
      result.value.forEach(item => {
        expect(item.value).toBe('EVEN');
      });
      // Check descending order
      for (let i = 0; i < result.value.length - 1; i++) {
        expect(result.value[i].id).toBeGreaterThan(result.value[i + 1].id);
      }
    });

    test('should handle all query options together', () => {
      const data = [
        { ItemCode: 'A', Name: 'Alpha', Price: 100, Active: 'tYES' },
        { ItemCode: 'B', Name: 'Beta', Price: 200, Active: 'tYES' },
        { ItemCode: 'C', Name: 'Gamma', Price: 150, Active: 'tNO' },
        { ItemCode: 'D', Name: 'Delta', Price: 250, Active: 'tYES' }
      ];

      const result = engine.applyQuery(data, {
        $filter: "Active eq 'tYES'",
        $orderby: 'Price desc',
        $top: '2',
        $select: 'ItemCode,Price',
        $count: 'true'
      });

      expect(result.value).toHaveLength(2);
      expect(result['@odata.count']).toBe(3); // 3 active items
      expect(result.value[0].ItemCode).toBe('D'); // Highest price
      expect(result.value[0]).not.toHaveProperty('Name');
      expect(result.value[0]).not.toHaveProperty('Active');
    });
  });
});

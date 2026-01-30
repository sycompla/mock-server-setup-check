/**
 * Mock ODBC Service
 *
 * Mocks stored procedure calls
 * Returns predefined responses for known procedures
 *
 * @namespace ntt.wms.mock.services
 */
export default class MockODBCService {

    /**
     * Execute a stored procedure
     */
    public async execute(storedProcedure: string, ...args: any[]): Promise<any> {
        console.log('[MockODBCService] Execute SP:', storedProcedure, args);

        // Map of stored procedures to mock handlers
        const handlers: { [key: string]: (...args: any[]) => any } = {
            'WMS_GetPickListDetails': this.mockGetPickListDetails,
            'WMS_UpdateInventoryCount': this.mockUpdateInventoryCount,
            'WMS_GetBinLocationStock': this.mockGetBinLocationStock,
            'WMS_ValidateSerialNumber': this.mockValidateSerialNumber,
            'WMS_GetItemBatches': this.mockGetItemBatches
        };

        const handler = handlers[storedProcedure];
        if (handler) {
            return handler.call(this, ...args);
        }

        // Default: return empty result
        console.warn(`[MockODBCService] No mock handler for SP: ${storedProcedure}`);
        return { value: [] };
    }

    /**
     * Mock: Get pick list details
     */
    private mockGetPickListDetails(pickListId: number): any {
        return {
            value: [
                {
                    PickListEntry: pickListId,
                    LineNum: 0,
                    ItemCode: 'ITEM001',
                    ItemName: 'Test Item',
                    Quantity: 10,
                    PickedQuantity: 0,
                    BinCode: 'A-01-01'
                }
            ]
        };
    }

    /**
     * Mock: Update inventory count
     */
    private mockUpdateInventoryCount(countId: number, data: any): any {
        console.log('[MockODBCService] Update inventory count:', countId, data);
        return { success: true };
    }

    /**
     * Mock: Get bin location stock
     */
    private mockGetBinLocationStock(warehouseCode: string, binCode: string): any {
        return {
            value: [
                {
                    ItemCode: 'ITEM001',
                    ItemName: 'Test Item',
                    OnHandQty: 100,
                    AvailableQty: 95
                }
            ]
        };
    }

    /**
     * Mock: Validate serial number
     */
    private mockValidateSerialNumber(itemCode: string, serialNumber: string): any {
        return {
            valid: true,
            status: 'Available',
            warehouse: 'WH01',
            binLocation: 'A-01-01'
        };
    }

    /**
     * Mock: Get item batches
     */
    private mockGetItemBatches(itemCode: string, warehouseCode: string): any {
        return {
            value: [
                {
                    BatchNumber: 'BATCH001',
                    Quantity: 50,
                    ExpiryDate: '2026-12-31',
                    ManufactureDate: '2026-01-01'
                }
            ]
        };
    }
}

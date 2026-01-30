/**
 * Mock Data Loader
 *
 * Responsible for:
 * - Loading JSON files from /mock/data/ directory
 * - In-memory cache management
 * - Entity set name to file path mapping
 * - Basic referential integrity validation
 *
 * @namespace ntt.wms.mock.services
 */

interface EntitySetMap {
    [key: string]: string;
}

export default class MockDataLoader {
    private cache: Map<string, any> = new Map();
    private initialized: boolean = false;

    /**
     * Entity set to file path mapping
     */
    private readonly entitySetToFile: EntitySetMap = {
        // Master data
        'Users': 'master/users',
        'Warehouses': 'master/warehouses',
        'BinLocations': 'master/binlocations',
        'Items': 'master/items',
        'EmployeesInfo': 'master/employees',
        'BusinessPartners': 'master/businesspartners',

        // Transactions
        'StockTransfers': 'transactions/stocktransfers',
        'StockTransferRequests': 'transactions/stocktransferrequests',
        'InventoryGenExits': 'transactions/materialissues',
        'InventoryGenEntries': 'transactions/materialreceipts',
        'Returns': 'transactions/returns',
        'PurchaseDeliveryNotes': 'transactions/purchasedeliveries',
        'DeliveryNotes': 'transactions/deliverynotes',
        'Invoices': 'transactions/invoices',
        'PickLists': 'transactions/picklists',
        'ProductionOrders': 'transactions/productionorders',
        'InventoryCountings': 'transactions/inventorycountings',

        // System
        'Login': 'system/session',
        'CompanyService_GetAdminInfo': 'system/admininfo',

        // Views
        'NTT_UI5WMS_ITEMS_B1SLQuery': 'views/items-view'
    };

    /**
     * Initialize the data loader and load all files
     */
    async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        console.log('[MockDataLoader] Initializing mock data loader...');

        try {
            // Load all entity sets
            const loadPromises = Object.keys(this.entitySetToFile).map(entitySet =>
                this.loadFile(entitySet)
            );

            await Promise.all(loadPromises);

            this.initialized = true;
            console.log(`[MockDataLoader] ✓ Loaded ${this.cache.size} entity sets`);

            // Validate references (optional, can be disabled for performance)
            // this.validateReferences();

        } catch (error) {
            console.error('[MockDataLoader] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Load a single JSON file
     */
    private async loadFile(entitySet: string): Promise<void> {
        const filePath = this.entitySetToFile[entitySet];
        if (!filePath) {
            console.warn(`[MockDataLoader] No file mapping for entity set: ${entitySet}`);
            return;
        }

        try {
            const url = `/mock/data/${filePath}.json`;
            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`[MockDataLoader] File not found: ${url}`);
                // Store empty data for missing files
                this.cache.set(entitySet, { value: [] });
                return;
            }

            const data = await response.json();
            this.cache.set(entitySet, data);
            console.log(`[MockDataLoader] ✓ Loaded ${entitySet} from ${filePath}.json`);

        } catch (error) {
            console.error(`[MockDataLoader] Error loading ${entitySet}:`, error);
            // Store empty data on error
            this.cache.set(entitySet, { value: [] });
        }
    }

    /**
     * Get data for an entity set
     */
    getData(entitySet: string): any {
        if (!this.initialized) {
            throw new Error('[MockDataLoader] Not initialized. Call init() first.');
        }

        const data = this.cache.get(entitySet);
        if (!data) {
            console.warn(`[MockDataLoader] No data for entity set: ${entitySet}`);
            return { value: [] };
        }

        // Return a deep copy to prevent mutation
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * Update data for an entity set (in-memory only)
     */
    setData(entitySet: string, data: any): void {
        this.cache.set(entitySet, data);
    }

    /**
     * Find a single entity by ID
     */
    findById(entitySet: string, id: any): any | null {
        const data = this.getData(entitySet);

        if (!data.value || !Array.isArray(data.value)) {
            return null;
        }

        // Try common ID field names
        const idFields = ['DocEntry', 'InternalKey', 'AbsEntry', 'Code', 'ItemCode', 'WarehouseCode', 'CardCode'];

        for (const field of idFields) {
            const found = data.value.find((item: any) => item[field] === id);
            if (found) {
                return found;
            }
        }

        return null;
    }

    /**
     * Add a new entity to a collection
     */
    addEntity(entitySet: string, entity: any): any {
        const data = this.getData(entitySet);

        if (!data.value) {
            data.value = [];
        }

        // Generate ID if needed
        if (data.idCounter !== undefined) {
            entity.DocEntry = data.idCounter;
            entity.DocNum = data.idCounter;
            data.idCounter++;
        }

        data.value.push(entity);
        this.setData(entitySet, data);

        return entity;
    }

    /**
     * Update an existing entity
     */
    updateEntity(entitySet: string, id: any, updates: any): any | null {
        const data = this.getData(entitySet);

        if (!data.value || !Array.isArray(data.value)) {
            return null;
        }

        const idFields = ['DocEntry', 'InternalKey', 'AbsEntry', 'Code', 'ItemCode', 'WarehouseCode', 'CardCode'];

        for (const field of idFields) {
            const index = data.value.findIndex((item: any) => item[field] === id);
            if (index !== -1) {
                // Merge updates
                data.value[index] = { ...data.value[index], ...updates };
                this.setData(entitySet, data);
                return data.value[index];
            }
        }

        return null;
    }

    /**
     * Delete an entity
     */
    deleteEntity(entitySet: string, id: any): boolean {
        const data = this.getData(entitySet);

        if (!data.value || !Array.isArray(data.value)) {
            return false;
        }

        const idFields = ['DocEntry', 'InternalKey', 'AbsEntry', 'Code', 'ItemCode', 'WarehouseCode', 'CardCode'];

        for (const field of idFields) {
            const index = data.value.findIndex((item: any) => item[field] === id);
            if (index !== -1) {
                data.value.splice(index, 1);
                this.setData(entitySet, data);
                return true;
            }
        }

        return false;
    }

    /**
     * Validate referential integrity (optional)
     */
    private validateReferences(): void {
        console.log('[MockDataLoader] Validating referential integrity...');

        // Example: Check if warehouse codes in items exist in warehouses
        // This is a simplified example - full implementation would check all relationships

        const warehouses = this.getData('Warehouses');
        const items = this.getData('Items');

        if (warehouses.value && items.value) {
            const warehouseCodes = new Set(warehouses.value.map((w: any) => w.WarehouseCode));

            items.value.forEach((item: any) => {
                if (item.ItemWarehouseInfoCollection) {
                    item.ItemWarehouseInfoCollection.forEach((wh: any) => {
                        if (!warehouseCodes.has(wh.WarehouseCode)) {
                            console.warn(`[MockDataLoader] Invalid warehouse reference in item ${item.ItemCode}: ${wh.WarehouseCode}`);
                        }
                    });
                }
            });
        }

        console.log('[MockDataLoader] ✓ Reference validation complete');
    }

    /**
     * Get all cached entity sets
     */
    getEntitySets(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Clear cache (for testing)
     */
    clearCache(): void {
        this.cache.clear();
        this.initialized = false;
    }
}

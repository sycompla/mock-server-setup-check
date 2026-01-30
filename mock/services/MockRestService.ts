import BaseObject from "sap/ui/base/Object";
import { BatchParameters } from "../../rest/BatchParameters";
import MockDataLoader from "./MockDataLoader";
import ODataQueryEngine from "./ODataQueryEngine";

/**
 * Mock REST Service
 *
 * Implements the same interface as RestService but uses local JSON data
 * All operations are in-memory only (no persistence)
 *
 * @namespace ntt.wms.mock.services
 */
export default class MockRestService extends BaseObject {

    private oConfig: any;
    private dataLoader: MockDataLoader;
    private queryEngine: ODataQueryEngine;
    private csrf_token: string = "mock-csrf-token";

    public constructor(oConfig: { baseUrl: string; urlParameters?: {} }) {
        super();
        BaseObject.call(this);

        this.oConfig = oConfig;
        this.dataLoader = new MockDataLoader();
        this.queryEngine = new ODataQueryEngine();

        // Initialize data loader
        this.dataLoader.init().then(() => {
            console.log('[MockRestService] Mock REST service initialized');
        }).catch(error => {
            console.error('[MockRestService] Initialization error:', error);
        });
    }

    public setCsrfToken(csrf_token: string) {
        this.csrf_token = csrf_token;
    }

    public getCsrfToken() {
        return this.csrf_token;
    }

    /**
     * Parse URL to extract entity set and ID
     */
    private parseUrl(path: string): { entitySet: string, id?: string, queryString: string } {
        // Remove leading slash and base URL
        let cleanPath = path.replace(/^\//, '').replace(/^b1s\/v2\//, '');

        // Extract query string
        const queryIndex = cleanPath.indexOf('?');
        const queryString = queryIndex >= 0 ? cleanPath.substring(queryIndex + 1) : '';
        cleanPath = queryIndex >= 0 ? cleanPath.substring(0, queryIndex) : cleanPath;

        // Extract entity set and ID
        // Format: EntitySet(ID) or EntitySet/ID or just EntitySet
        const match = cleanPath.match(/^([^/(]+)(?:\(([^)]+)\)|\/([^/]+))?/);

        if (match) {
            const entitySet = match[1];
            const id = match[2] || match[3];
            return { entitySet, id, queryString };
        }

        return { entitySet: cleanPath, queryString };
    }

    /**
     * Simulate network delay (optional)
     */
    private async simulateDelay(): Promise<void> {
        const delay = 0; // Set to 0 for no delay, or e.g. 100 for 100ms
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    /**
     * GET request handler
     */
    public async requestGET(path: string, init?: HeadersInit): Promise<any> {
        await this.simulateDelay();

        console.log('[MockRestService] GET', path);

        try {
            const { entitySet, id, queryString } = this.parseUrl(path);

            // Special handling for Login
            if (path.includes('Login')) {
                return this.dataLoader.getData('Login');
            }

            // Special handling for CompanyService
            if (path.includes('CompanyService_GetAdminInfo')) {
                return this.dataLoader.getData('CompanyService_GetAdminInfo');
            }

            // Get data from loader
            const data = this.dataLoader.getData(entitySet);

            if (!data) {
                throw new Error(`Entity set not found: ${entitySet}`);
            }

            // Single entity request (by ID)
            if (id) {
                const entity = this.dataLoader.findById(entitySet, id);
                if (!entity) {
                    throw new Error(`Entity not found: ${entitySet}(${id})`);
                }
                return {
                    "@odata.context": `${this.oConfig.baseUrl}/$metadata#${entitySet}/$entity`,
                    ...entity
                };
            }

            // Collection request - apply OData query
            const queryOptions = this.queryEngine.parseQueryString(queryString);
            const result = this.queryEngine.applyQuery(data.value || [], queryOptions);

            return {
                "@odata.context": `${this.oConfig.baseUrl}/$metadata#${entitySet}`,
                ...result
            };

        } catch (error) {
            console.error('[MockRestService] GET error:', error);
            throw error;
        }
    }

    /**
     * GET ALL - paginated requests (follows @odata.nextLink)
     */
    public async requestGETALL(path: string, init?: HeadersInit): Promise<any[]> {
        await this.simulateDelay();

        console.log('[MockRestService] GETALL', path);

        // For mock, just return all data at once
        const result = await this.requestGET(path, init);
        return result.value || [];
    }

    /**
     * GET ALL from views
     */
    public async requestVIEWSALL(path: string, init?: RequestInit): Promise<any[]> {
        // Same as GETALL for mock
        return this.requestGETALL(path, init as HeadersInit);
    }

    /**
     * POST request handler (create)
     */
    public async requestPOST(path: string, data?: any, init?: HeadersInit): Promise<any> {
        await this.simulateDelay();

        console.log('[MockRestService] POST', path, data);

        try {
            const { entitySet } = this.parseUrl(path);

            // Add entity to collection
            const newEntity = this.dataLoader.addEntity(entitySet, data);

            return {
                "@odata.context": `${this.oConfig.baseUrl}/$metadata#${entitySet}/$entity`,
                ...newEntity
            };

        } catch (error) {
            console.error('[MockRestService] POST error:', error);
            throw error;
        }
    }

    /**
     * PATCH request handler (update)
     */
    public async requestPATCH(path: string, data?: any, init?: HeadersInit): Promise<any> {
        await this.simulateDelay();

        console.log('[MockRestService] PATCH', path, data);

        try {
            const { entitySet, id } = this.parseUrl(path);

            if (!id) {
                throw new Error('PATCH requires an entity ID');
            }

            const updated = this.dataLoader.updateEntity(entitySet, id, data);

            if (!updated) {
                throw new Error(`Entity not found for update: ${entitySet}(${id})`);
            }

            // Return 204 No Content (SAP B1 standard)
            return null;

        } catch (error) {
            console.error('[MockRestService] PATCH error:', error);
            throw error;
        }
    }

    /**
     * PUT request handler (replace)
     */
    public async requestPUT(path: string, data?: any, init?: HeadersInit): Promise<any> {
        // Use PATCH logic for mock
        return this.requestPATCH(path, data, init);
    }

    /**
     * DELETE request handler
     */
    public async requestDELETE(path: string, init?: HeadersInit): Promise<any> {
        await this.simulateDelay();

        console.log('[MockRestService] DELETE', path);

        try {
            const { entitySet, id } = this.parseUrl(path);

            if (!id) {
                throw new Error('DELETE requires an entity ID');
            }

            const deleted = this.dataLoader.deleteEntity(entitySet, id);

            if (!deleted) {
                throw new Error(`Entity not found for delete: ${entitySet}(${id})`);
            }

            // Return 204 No Content
            return null;

        } catch (error) {
            console.error('[MockRestService] DELETE error:', error);
            throw error;
        }
    }

    /**
     * BATCH request handler
     */
    public async BATCHRequest(params: Array<BatchParameters>, changeset = true): Promise<Array<BatchParameters>> {
        await this.simulateDelay();

        console.log('[MockRestService] BATCH', params);

        // Process each batch request sequentially
        const results: Array<BatchParameters> = [];

        for (const param of params) {
            try {
                let result: any;

                switch (param.method) {
                    case 'GET':
                        result = await this.requestGET(param.url);
                        break;
                    case 'POST':
                        result = await this.requestPOST(param.url, param.payload);
                        break;
                    case 'PATCH':
                        result = await this.requestPATCH(param.url, param.payload);
                        break;
                    case 'DELETE':
                        result = await this.requestDELETE(param.url);
                        break;
                    default:
                        throw new Error(`Unsupported batch method: ${param.method}`);
                }

                results.push({
                    ...param,
                    response: result,
                    status: result ? 200 : 204
                });

            } catch (error) {
                results.push({
                    ...param,
                    error: error,
                    status: 500
                });
            }
        }

        return results;
    }

    /**
     * JSON request (lower level)
     */
    public async requestJSON(path: string, method: string = "GET", data?: any, init?: HeadersInit): Promise<Response> {
        // For mock, return a fake Response object
        const result = await this.request(path, method, data);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * Generic request handler
     */
    private async request(path: string, method: string, data?: any): Promise<any> {
        switch (method.toUpperCase()) {
            case 'GET':
                return this.requestGET(path);
            case 'POST':
                return this.requestPOST(path, data);
            case 'PATCH':
                return this.requestPATCH(path, data);
            case 'PUT':
                return this.requestPUT(path, data);
            case 'DELETE':
                return this.requestDELETE(path);
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }

    /**
     * Compile URL (for compatibility)
     */
    private compileUrl(path: string): string {
        return `${this.oConfig.baseUrl}${path}`;
    }
}

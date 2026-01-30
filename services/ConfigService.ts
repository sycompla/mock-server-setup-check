import BaseService from "./BaseService";
import RestService from "../rest/RestService";
import MockRestService from "../mock/services/MockRestService";
import ODBCService from "./ODBCService";
import MockODBCService from "../mock/services/MockODBCService";
import { AppConfig } from "../config/AppConfig";

/**
 * Central configuration and service factory
 *
 * Manages the creation of service instances based on backend mode (real/mock)
 *
 * @namespace ntt.wms.services
 */
export default class ConfigService extends BaseService {

    private _restService: RestService | MockRestService;
    private _odbcService: ODBCService | MockODBCService;

    /**
     * Initialize the ConfigService
     * Creates appropriate service instances based on backend mode
     */
    async init(): Promise<void> {
        const isMock = AppConfig.isMockMode();
        const urls = AppConfig.getBackendUrls();

        console.log(`[ConfigService] Initializing in ${isMock ? 'MOCK' : 'REAL'} mode`);

        if (isMock) {
            // Create mock services
            this._restService = new MockRestService({
                baseUrl: urls.b1s,
                urlParameters: {}
            });
            this._odbcService = new MockODBCService();

            console.log('[ConfigService] Mock services initialized');
        } else {
            // Create real services
            this._restService = new RestService({
                baseUrl: urls.b1s,
                urlParameters: {}
            });
            this._odbcService = new ODBCService();

            console.log('[ConfigService] Real services initialized');
        }
    }

    /**
     * Get the main REST service instance
     * @returns RestService or MockRestService depending on mode
     */
    public getRestService(): RestService | MockRestService {
        if (!this._restService) {
            throw new Error('[ConfigService] Not initialized. Call init() first.');
        }
        return this._restService;
    }

    /**
     * Get the ODBC service instance
     * @returns ODBCService or MockODBCService depending on mode
     */
    public getODBCService(): ODBCService | MockODBCService {
        if (!this._odbcService) {
            throw new Error('[ConfigService] Not initialized. Call init() first.');
        }
        return this._odbcService;
    }

    /**
     * Create a new REST service instance for ad-hoc requests
     * (e.g., printer server, license service)
     *
     * @param baseUrl Base URL for the service
     * @returns RestService or MockRestService instance
     */
    public createRestService(baseUrl: string): RestService | MockRestService {
        if (AppConfig.isMockMode()) {
            return new MockRestService({
                baseUrl,
                urlParameters: {}
            });
        }
        return new RestService({
            baseUrl,
            urlParameters: {}
        });
    }

    /**
     * Check if running in mock mode
     * @returns true if mock mode is enabled
     */
    public isMockMode(): boolean {
        return AppConfig.isMockMode();
    }

    /**
     * Get backend URLs configuration
     * @returns Object containing all backend service URLs
     */
    public getBackendUrls() {
        return AppConfig.getBackendUrls();
    }
}

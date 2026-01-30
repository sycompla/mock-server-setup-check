/**
 * Centralized application configuration
 * Values injected at build time via webpack DefinePlugin or can be set via environment variables
 *
 * @namespace ntt.wms.config
 */
export class AppConfig {

    /**
     * Backend mode: 'real' connects to actual SAP B1 backend, 'mock' uses local JSON files
     * @private
     */
    private static BACKEND_MODE: 'real' | 'mock' = 'real';

    /**
     * Path to mock data directory (relative to webapp)
     * @private
     */
    private static MOCK_DATA_PATH: string = '/mock';

    /**
     * Initialize configuration
     * This method can be called at app startup to override defaults
     */
    public static init(config?: { backendMode?: 'real' | 'mock', mockDataPath?: string }) {
        if (config?.backendMode) {
            this.BACKEND_MODE = config.backendMode;
        }
        if (config?.mockDataPath) {
            this.MOCK_DATA_PATH = config.mockDataPath;
        }

        // Try to read from global window object (can be set in index.html or build process)
        if (typeof window !== 'undefined') {
            const windowConfig = (window as any).WMS_CONFIG;
            if (windowConfig) {
                if (windowConfig.BACKEND_MODE) {
                    this.BACKEND_MODE = windowConfig.BACKEND_MODE;
                }
                if (windowConfig.MOCK_DATA_PATH) {
                    this.MOCK_DATA_PATH = windowConfig.MOCK_DATA_PATH;
                }
            }
        }

        console.log(`[AppConfig] Backend mode: ${this.BACKEND_MODE}`);
        console.log(`[AppConfig] Mock data path: ${this.MOCK_DATA_PATH}`);
    }

    /**
     * Get current backend mode
     * @returns Backend mode ('real' or 'mock')
     */
    public static getBackendMode(): 'real' | 'mock' {
        return this.BACKEND_MODE;
    }

    /**
     * Check if application is running in mock mode
     * @returns true if mock mode is enabled
     */
    public static isMockMode(): boolean {
        return this.getBackendMode() === 'mock';
    }

    /**
     * Get mock data directory path
     * @returns Path to mock data directory
     */
    public static getMockDataPath(): string {
        return this.MOCK_DATA_PATH;
    }

    /**
     * Get backend URLs configuration
     * @returns Object containing all backend service URLs
     */
    public static getBackendUrls() {
        return {
            b1s: '/b1s/v2',
            odbc: './ODBC',
            wms: '/wms',
            install: '/install',
            api: './api',
            printerServer: '/wms'
        };
    }
}

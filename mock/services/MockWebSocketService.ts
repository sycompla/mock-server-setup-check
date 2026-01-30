/**
 * Mock WebSocket Service
 *
 * Simulates WebSocket connection with periodic mock messages
 *
 * @namespace ntt.wms.mock.services
 */
export default class MockWebSocketService {

    private messageHandlers: Array<(message: any) => void> = [];
    private interval: number | null = null;
    private isConnected: boolean = false;

    constructor() {
        console.log('[MockWebSocketService] Mock WebSocket initialized');

        // Simulate connection after short delay
        setTimeout(() => {
            this.isConnected = true;
            this.onOpen();
        }, 100);

        // Start periodic message simulation (every 30 seconds)
        this.startMessageSimulation();
    }

    /**
     * Attach message handler
     */
    public attachMessage(handler: (message: any) => void): void {
        this.messageHandlers.push(handler);
    }

    /**
     * Detach message handler
     */
    public detachMessage(handler: (message: any) => void): void {
        const index = this.messageHandlers.indexOf(handler);
        if (index > -1) {
            this.messageHandlers.splice(index, 1);
        }
    }

    /**
     * Send message (no-op in mock)
     */
    public send(message: string): void {
        console.log('[MockWebSocketService] Send (no-op):', message);
    }

    /**
     * Close connection
     */
    public close(): void {
        console.log('[MockWebSocketService] Close connection');
        this.isConnected = false;
        this.stopMessageSimulation();
    }

    /**
     * Connection opened
     */
    private onOpen(): void {
        console.log('[MockWebSocketService] Connection opened (mock)');

        // Trigger initial message
        this.simulateMessage({
            type: 'CONNECTION',
            message: 'Mock WebSocket connected'
        });
    }

    /**
     * Start periodic message simulation
     */
    private startMessageSimulation(): void {
        // Send mock notification every 30 seconds
        this.interval = window.setInterval(() => {
            if (this.isConnected) {
                this.simulateMessage({
                    type: 'NOTIFICATION',
                    message: 'Mock notification from server',
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
    }

    /**
     * Stop message simulation
     */
    private stopMessageSimulation(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Simulate incoming message
     */
    private simulateMessage(data: any): void {
        const message = {
            id: this.createUUID(),
            timestamp: new Date().toISOString(),
            data: data
        };

        console.log('[MockWebSocketService] Simulated message:', message);

        // Trigger all handlers
        this.messageHandlers.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('[MockWebSocketService] Handler error:', error);
            }
        });
    }

    /**
     * Create UUID
     */
    private createUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Simulate specific event (for testing)
     */
    public simulateEvent(eventType: string, data: any): void {
        this.simulateMessage({
            type: eventType,
            ...data
        });
    }
}

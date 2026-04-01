export declare class CommunicationService {
    private readonly logger;
    dispatchMessage(channel: string, destination: string, body: string, providerConfig: any): Promise<boolean>;
}

export declare class EligibilityService {
    constructor();
    evaluateRecordEligibility(recordId: string, channel: string): Promise<{
        eligible: boolean;
        reason?: string;
    }>;
}

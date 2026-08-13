import { PerkoxOfferwallConfig, PerkoxReward } from "./types";
export declare class OfferwallInstance {
    appId: string;
    sdkKey: string;
    playerId: string;
    beta: boolean;
    onReward?: (reward: PerkoxReward) => void;
    onClose?: () => void;
    private unsubReward;
    private unsubClose;
    constructor(appId: string, sdkKey: string, playerId: string);
    getConfig(): PerkoxOfferwallConfig;
    /**
     * Triggers the Native Offerwall UI display using the native Android/iOS SDK bridge.
     */
    show(): Promise<boolean>;
    private removeListeners;
}
export declare class PerkoxOfferwall {
    /**
     * Initializes a new Perkox Offerwall instance (Hybrid Approach API).
     */
    static init(appId: string, sdkKey: string, playerId: string, beta?: boolean): OfferwallInstance;
    /**
     * Creates a new Offerwall instance.
     */
    static create(appId: string, sdkKey: string, playerId: string): OfferwallInstance;
    /**
     * Directly shows the native offerwall via the bridge.
     */
    static showOfferwall(appId: string, sdkKey: string, playerId: string, beta?: boolean): Promise<boolean>;
}

import { PerkoxInitConfig, PerkoxOfferwallOptions, PerkoxReward } from "./types";
export declare class PerkoxSDK {
    private static appId;
    private static sdkKey;
    private static playerId;
    private static beta;
    private static isInitialized;
    private static rewardListeners;
    private static closeListeners;
    private static rewardSubscription;
    private static closeSubscription;
    /**
     * 1. INIT: Initializes the Perkox React Native SDK.
     * Native SDK Bridge call + JS configuration.
     */
    static init(config: PerkoxInitConfig): Promise<boolean>;
    static init(appId: string, sdkKey: string, playerId?: string, beta?: boolean): Promise<boolean>;
    /**
     * 2. LOGIN / SET USER: Sets or updates the unique Player ID / User ID.
     */
    static setUserId(playerId: string): Promise<boolean>;
    /**
     * 3. SHOW OFFERWALL: Triggers the Native Offerwall display using the native Android/iOS SDK bridge.
     */
    static showOfferwall(options?: PerkoxOfferwallOptions): Promise<boolean>;
    /**
     * 4. EVENTS: Subscribe to reward events.
     */
    static onReward(callback: (reward: PerkoxReward) => void): () => void;
    /**
     * 4. EVENTS: Subscribe to offerwall close events.
     */
    static onClose(callback: () => void): () => void;
    /**
     * 5. CONFIG: Update SDK Configuration parameters.
     */
    static setConfig(config: Partial<PerkoxInitConfig>): void;
    /**
     * Getters for current SDK config
     */
    static getAppId(): string;
    static getSdkKey(): string;
    static getPlayerId(): string;
    static isBeta(): boolean;
    private static setupNativeEventListeners;
    /**
     * Cleans up all event listeners.
     */
    static removeAllListeners(): void;
}

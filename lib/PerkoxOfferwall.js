"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerkoxOfferwall = exports.OfferwallInstance = void 0;
const PerkoxSDK_1 = require("./PerkoxSDK");
class OfferwallInstance {
    constructor(appId, sdkKey, playerId) {
        this.beta = false;
        this.unsubReward = null;
        this.unsubClose = null;
        this.appId = appId;
        this.sdkKey = sdkKey;
        this.playerId = playerId;
    }
    getConfig() {
        return {
            appId: this.appId,
            sdkKey: this.sdkKey,
            playerId: this.playerId,
            beta: this.beta,
            onReward: this.onReward,
            onClose: this.onClose,
        };
    }
    /**
     * Triggers the Native Offerwall UI display using the native Android/iOS SDK bridge.
     */
    async show() {
        this.removeListeners();
        if (this.onReward) {
            this.unsubReward = PerkoxSDK_1.PerkoxSDK.onReward((reward) => {
                if (this.onReward) {
                    this.onReward(reward);
                }
            });
        }
        if (this.onClose) {
            this.unsubClose = PerkoxSDK_1.PerkoxSDK.onClose(() => {
                if (this.onClose) {
                    this.onClose();
                }
                this.removeListeners();
            });
        }
        return PerkoxSDK_1.PerkoxSDK.showOfferwall({
            appId: this.appId,
            sdkKey: this.sdkKey,
            playerId: this.playerId,
            beta: this.beta,
        });
    }
    removeListeners() {
        if (this.unsubReward) {
            this.unsubReward();
            this.unsubReward = null;
        }
        if (this.unsubClose) {
            this.unsubClose();
            this.unsubClose = null;
        }
    }
}
exports.OfferwallInstance = OfferwallInstance;
class PerkoxOfferwall {
    /**
     * Initializes a new Perkox Offerwall instance (Hybrid Approach API).
     */
    static init(appId, sdkKey, playerId, beta = false) {
        const instance = new OfferwallInstance(appId, sdkKey, playerId);
        instance.beta = beta;
        return instance;
    }
    /**
     * Creates a new Offerwall instance.
     */
    static create(appId, sdkKey, playerId) {
        return new OfferwallInstance(appId, sdkKey, playerId);
    }
    /**
     * Directly shows the native offerwall via the bridge.
     */
    static async showOfferwall(appId, sdkKey, playerId, beta = false) {
        return PerkoxSDK_1.PerkoxSDK.showOfferwall({
            appId,
            sdkKey,
            playerId,
            beta,
        });
    }
}
exports.PerkoxOfferwall = PerkoxOfferwall;

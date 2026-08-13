"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerkoxSDK = void 0;
const react_native_1 = require("react-native");
const { PerkoxModule } = react_native_1.NativeModules;
let perkoxEmitter = null;
function getEventEmitter() {
    if (!perkoxEmitter && react_native_1.NativeModules.PerkoxModule) {
        try {
            perkoxEmitter = new react_native_1.NativeEventEmitter(react_native_1.NativeModules.PerkoxModule);
        }
        catch (e) {
            console.warn("[Perkox SDK] Failed to initialize NativeEventEmitter:", e);
        }
    }
    return perkoxEmitter;
}
class PerkoxSDK {
    static async init(configOrAppId, sdkKey, playerId, beta = false) {
        var _a;
        if (typeof configOrAppId === "object") {
            PerkoxSDK.appId = configOrAppId.appId || "";
            PerkoxSDK.sdkKey = configOrAppId.sdkKey || "";
            PerkoxSDK.playerId = configOrAppId.playerId || "";
            PerkoxSDK.beta = (_a = configOrAppId.beta) !== null && _a !== void 0 ? _a : false;
        }
        else {
            PerkoxSDK.appId = configOrAppId || "";
            PerkoxSDK.sdkKey = sdkKey || "";
            PerkoxSDK.playerId = playerId || "";
            PerkoxSDK.beta = beta !== null && beta !== void 0 ? beta : false;
        }
        PerkoxSDK.setupNativeEventListeners();
        PerkoxSDK.isInitialized = true;
        if (react_native_1.NativeModules.PerkoxModule && typeof react_native_1.NativeModules.PerkoxModule.initSDK === "function") {
            try {
                await react_native_1.NativeModules.PerkoxModule.initSDK(PerkoxSDK.appId, PerkoxSDK.sdkKey, {
                    playerId: PerkoxSDK.playerId,
                    beta: PerkoxSDK.beta,
                });
            }
            catch (err) {
                console.warn("[Perkox SDK] Native initSDK warning:", err);
            }
        }
        return true;
    }
    /**
     * 2. LOGIN / SET USER: Sets or updates the unique Player ID / User ID.
     */
    static async setUserId(playerId) {
        PerkoxSDK.playerId = playerId || "";
        if (react_native_1.NativeModules.PerkoxModule && typeof react_native_1.NativeModules.PerkoxModule.setUserId === "function") {
            try {
                await react_native_1.NativeModules.PerkoxModule.setUserId(PerkoxSDK.playerId);
            }
            catch (err) {
                console.warn("[Perkox SDK] Native setUserId warning:", err);
            }
        }
        return true;
    }
    /**
     * 3. SHOW OFFERWALL: Triggers the Native Offerwall display using the native Android/iOS SDK bridge.
     */
    static async showOfferwall(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const appId = (_b = (_a = options === null || options === void 0 ? void 0 : options.appId) !== null && _a !== void 0 ? _a : PerkoxSDK.appId) !== null && _b !== void 0 ? _b : "";
        const sdkKey = (_d = (_c = options === null || options === void 0 ? void 0 : options.sdkKey) !== null && _c !== void 0 ? _c : PerkoxSDK.sdkKey) !== null && _d !== void 0 ? _d : "";
        const playerId = (_f = (_e = options === null || options === void 0 ? void 0 : options.playerId) !== null && _e !== void 0 ? _e : PerkoxSDK.playerId) !== null && _f !== void 0 ? _f : "";
        const beta = (_h = (_g = options === null || options === void 0 ? void 0 : options.beta) !== null && _g !== void 0 ? _g : PerkoxSDK.beta) !== null && _h !== void 0 ? _h : false;
        if (!appId || !sdkKey) {
            console.error("[Perkox SDK] Error: appId and sdkKey are required before showing offerwall.");
            return false;
        }
        if (!playerId) {
            console.warn("[Perkox SDK] Warning: playerId is empty. Make sure user is logged in or playerId is set.");
        }
        if (!react_native_1.NativeModules.PerkoxModule) {
            console.warn("[Perkox SDK] Native module 'PerkoxModule' is not linked. Please ensure native modules are installed.");
            return false;
        }
        PerkoxSDK.setupNativeEventListeners();
        try {
            return await react_native_1.NativeModules.PerkoxModule.showOfferwall(appId, sdkKey, playerId, beta);
        }
        catch (err) {
            console.error("[Perkox SDK] Failed to show offerwall:", err);
            return false;
        }
    }
    /**
     * 4. EVENTS: Subscribe to reward events.
     */
    static onReward(callback) {
        PerkoxSDK.rewardListeners.add(callback);
        PerkoxSDK.setupNativeEventListeners();
        return () => {
            PerkoxSDK.rewardListeners.delete(callback);
        };
    }
    /**
     * 4. EVENTS: Subscribe to offerwall close events.
     */
    static onClose(callback) {
        PerkoxSDK.closeListeners.add(callback);
        PerkoxSDK.setupNativeEventListeners();
        return () => {
            PerkoxSDK.closeListeners.delete(callback);
        };
    }
    /**
     * 5. CONFIG: Update SDK Configuration parameters.
     */
    static setConfig(config) {
        if (config.appId !== undefined)
            PerkoxSDK.appId = config.appId || "";
        if (config.sdkKey !== undefined)
            PerkoxSDK.sdkKey = config.sdkKey || "";
        if (config.playerId !== undefined)
            PerkoxSDK.setUserId(config.playerId || "");
        if (config.beta !== undefined)
            PerkoxSDK.beta = config.beta;
    }
    /**
     * Getters for current SDK config
     */
    static getAppId() {
        return PerkoxSDK.appId;
    }
    static getSdkKey() {
        return PerkoxSDK.sdkKey;
    }
    static getPlayerId() {
        return PerkoxSDK.playerId;
    }
    static isBeta() {
        return PerkoxSDK.beta;
    }
    static setupNativeEventListeners() {
        const emitter = getEventEmitter();
        if (!emitter)
            return;
        if (!PerkoxSDK.rewardSubscription) {
            PerkoxSDK.rewardSubscription = emitter.addListener("onPerkoxReward", (reward) => {
                PerkoxSDK.rewardListeners.forEach((listener) => {
                    try {
                        listener(reward);
                    }
                    catch (e) {
                        console.error("[Perkox SDK] Exception in onReward listener:", e);
                    }
                });
            });
        }
        if (!PerkoxSDK.closeSubscription) {
            PerkoxSDK.closeSubscription = emitter.addListener("onPerkoxClose", () => {
                PerkoxSDK.closeListeners.forEach((listener) => {
                    try {
                        listener();
                    }
                    catch (e) {
                        console.error("[Perkox SDK] Exception in onClose listener:", e);
                    }
                });
            });
        }
    }
    /**
     * Cleans up all event listeners.
     */
    static removeAllListeners() {
        PerkoxSDK.rewardListeners.clear();
        PerkoxSDK.closeListeners.clear();
        if (PerkoxSDK.rewardSubscription) {
            PerkoxSDK.rewardSubscription.remove();
            PerkoxSDK.rewardSubscription = null;
        }
        if (PerkoxSDK.closeSubscription) {
            PerkoxSDK.closeSubscription.remove();
            PerkoxSDK.closeSubscription = null;
        }
    }
}
exports.PerkoxSDK = PerkoxSDK;
PerkoxSDK.appId = "";
PerkoxSDK.sdkKey = "";
PerkoxSDK.playerId = "";
PerkoxSDK.beta = false;
PerkoxSDK.isInitialized = false;
PerkoxSDK.rewardListeners = new Set();
PerkoxSDK.closeListeners = new Set();
PerkoxSDK.rewardSubscription = null;
PerkoxSDK.closeSubscription = null;

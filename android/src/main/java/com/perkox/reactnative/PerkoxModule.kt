package com.perkox.reactnative

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.perkoxofferwall.sdk.Offerwall
import com.perkoxofferwall.sdk.PerkoxOfferwall

class PerkoxModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var activeAppId: String = ""
    private var activeSdkKey: String = ""
    private var activePlayerId: String = ""
    private var activeBeta: Boolean = false

    init {
        instance = this
    }

    override fun getName(): String {
        return "PerkoxModule"
    }

    @ReactMethod
    fun initSDK(
        appId: String,
        sdkKey: String,
        options: ReadableMap?,
        promise: Promise
    ) {
        activeAppId = if (appId != "undefined") appId else ""
        activeSdkKey = if (sdkKey != "undefined") sdkKey else ""
        activePlayerId = options?.getString("playerId")?.takeIf { it != "undefined" } ?: ""
        activeBeta = if (options?.hasKey("beta") == true) options.getBoolean("beta") else false

        promise.resolve(true)
    }

    @ReactMethod
    fun setUserId(
        playerId: String,
        promise: Promise
    ) {
        activePlayerId = if (playerId != "undefined") playerId else ""
        promise.resolve(true)
    }

    @ReactMethod
    fun showOfferwall(
        appId: String,
        sdkKey: String,
        playerId: String,
        beta: Boolean,
        promise: Promise
    ) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Current Activity does not exist")
            return
        }

        try {
            val app = if (!appId.isNullOrEmpty() && appId != "undefined") appId else activeAppId
            val key = if (!sdkKey.isNullOrEmpty() && sdkKey != "undefined") sdkKey else activeSdkKey
            val user = if (!playerId.isNullOrEmpty() && playerId != "undefined") playerId else activePlayerId

            val offerwall: Offerwall = PerkoxOfferwall.create(app, key, user)

            offerwall.onReward = { rewardMap ->
                val params = Arguments.createMap()
                if (rewardMap != null) {
                    for (entry in rewardMap.entries) {
                        val k = entry.key
                        val v = entry.value
                        when (v) {
                            is Number -> params.putDouble(k, v.toDouble())
                            is Boolean -> params.putBoolean(k, v)
                            is String -> params.putString(k, v)
                            else -> params.putString(k, v?.toString() ?: "")
                        }
                    }
                }
                sendEvent(EVENT_ON_REWARD, params)
            }

            offerwall.onClose = {
                sendEvent(EVENT_ON_CLOSE, null)
            }

            offerwall.launch(activity, beta)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PERKOX_SDK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN NativeEventEmitter
    }

    fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    companion object {
        const val EVENT_ON_REWARD = "onPerkoxReward"
        const val EVENT_ON_CLOSE = "onPerkoxClose"

        @Volatile
        var instance: PerkoxModule? = null
            private set

        fun sendRewardEvent(rewardParams: WritableMap) {
            instance?.sendEvent(EVENT_ON_REWARD, rewardParams)
        }

        fun sendCloseEvent() {
            instance?.sendEvent(EVENT_ON_CLOSE, null)
        }
    }
}

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PerkoxModule, RCTEventEmitter)

RCT_EXTERN_METHOD(initSDK:(NSString *)appId
                  sdkKey:(NSString *)sdkKey
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setUserId:(NSString *)playerId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showOfferwall:(NSString *)appId
                  sdkKey:(NSString *)sdkKey
                  playerId:(NSString *)playerId
                  beta:(BOOL)beta
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end


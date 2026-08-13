import Foundation
import UIKit

#if canImport(React)
import React
#endif

#if canImport(PerkoxOfferwall)
import PerkoxOfferwall
#endif

@objc(PerkoxModule)
class PerkoxModule: RCTEventEmitter {

  public static var shared: PerkoxModule?
  private var hasListeners: Bool = false

  private var activeAppId: String = ""
  private var activeSdkKey: String = ""
  private var activePlayerId: String = ""
  private var activeBeta: Bool = false

  override init() {
    super.init()
    PerkoxModule.shared = self
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }

  override class func moduleName() -> String! {
    return "PerkoxModule"
  }

  override func supportedEvents() -> [String]! {
    return ["onPerkoxReward", "onPerkoxClose"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc(sendRewardEvent:)
  func sendRewardEvent(rewardData: [String: Any]) {
    if hasListeners {
      sendEvent(withName: "onPerkoxReward", body: rewardData)
    }
  }

  @objc func sendCloseEvent() {
    if hasListeners {
      sendEvent(withName: "onPerkoxClose", body: nil)
    }
  }

  @objc(initSDK:sdkKey:options:resolver:rejecter:)
  func initSDK(
    appId: String,
    sdkKey: String,
    options: [String: Any]?,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String?, String?, Error?) -> Void
  ) {
    activeAppId = appId != "undefined" ? appId : ""
    activeSdkKey = sdkKey != "undefined" ? sdkKey : ""
    if let playerId = options?["playerId"] as? String, playerId != "undefined" {
      activePlayerId = playerId
    }
    activeBeta = options?["beta"] as? Bool ?? false

    resolve(true)
  }

  @objc(setUserId:resolver:rejecter:)
  func setUserId(
    playerId: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String?, String?, Error?) -> Void
  ) {
    activePlayerId = playerId != "undefined" ? playerId : ""
    resolve(true)
  }

  private func getTopViewController(from rootVC: UIViewController? = nil) -> UIViewController? {
    let root = rootVC ?? {
      if #available(iOS 13.0, *) {
        return UIApplication.shared.connectedScenes
          .compactMap { $0 as? UIWindowScene }
          .flatMap { $0.windows }
          .first(where: { $0.isKeyWindow })?.rootViewController
      } else {
        return UIApplication.shared.keyWindow?.rootViewController
      }
    }()

    if let nav = root as? UINavigationController {
      return getTopViewController(from: nav.visibleViewController)
    }
    if let tab = root as? UITabBarController {
      return getTopViewController(from: tab.selectedViewController)
    }
    if let presented = root?.presentedViewController {
      return getTopViewController(from: presented)
    }
    return root
  }

  @objc(showOfferwall:sdkKey:playerId:beta:resolver:rejecter:)
  func showOfferwall(
    appId: String,
    sdkKey: String,
    playerId: String,
    beta: Bool,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String?, String?, Error?) -> Void
  ) {
    DispatchQueue.main.async {
      guard let topVC = self.getTopViewController() else {
        reject("NO_VIEW_CONTROLLER", "Unable to find top view controller to present offerwall", nil)
        return
      }

      #if canImport(PerkoxOfferwall)
      let app = (!appId.isEmpty && appId != "undefined") ? appId : self.activeAppId
      let key = (!sdkKey.isEmpty && sdkKey != "undefined") ? sdkKey : self.activeSdkKey
      let user = (!playerId.isEmpty && playerId != "undefined") ? playerId : self.activePlayerId

      let offerwall = PerkoxOfferwall.create(
        appId: app,
        sdkKey: key,
        playerId: user
      )

      offerwall.onReward = { [weak self] reward in
        var rewardMap: [String: Any] = [:]
        for (k, v) in reward {
          if let val = v {
            rewardMap[k] = val
          }
        }
        self?.sendRewardEvent(rewardData: rewardMap)
      }

      offerwall.onClose = { [weak self] in
        self?.sendCloseEvent()
      }

      offerwall.launch(viewController: topVC, beta: beta)
      resolve(true)
      #else
      reject("PERKOX_IOS_SDK_MISSING", "PerkoxOfferwall framework is not linked in podspec", nil)
      #endif
    }
  }
}

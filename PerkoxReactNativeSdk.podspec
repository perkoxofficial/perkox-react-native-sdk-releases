require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "PerkoxReactNativeSdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/perkoxofficial/perkox-react-native-sdk"
  s.license      = "MIT"
  s.authors      = { "Perkox" => "support@perkox.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/perkoxofficial/perkox-react-native-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React-Core"

  # Link prebuilt PerkoxiOSSDK framework if placed in ios/Frameworks/
  s.vendored_frameworks = "ios/Frameworks/*.xcframework", "ios/Frameworks/*.framework"
  s.preserve_paths = "ios/Frameworks/*"

  # Optional: Link to native Perkox iOS SDK when published on CocoaPods or vendored in ios/Frameworks/
  # s.dependency "PerkoxiOSSDK"
end

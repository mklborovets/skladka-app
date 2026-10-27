#import <UIKit/UIKit.h>

#if __has_include(<React_RCTAppDelegate/RCTAppDelegate.h>)
#import <React_RCTAppDelegate/RCTAppDelegate.h>
#elif __has_include(<React-RCTAppDelegate/RCTAppDelegate.h>)
#import <React-RCTAppDelegate/RCTAppDelegate.h>
#elif __has_include(<React/RCTAppDelegate.h>)
#import <React/RCTAppDelegate.h>
#elif __has_include(<RCTAppDelegate.h>)
#import <RCTAppDelegate.h>
#else
#import "../../../../node_modules/react-native/Libraries/AppDelegate/RCTAppDelegate.h"
#endif

@interface AppDelegate : RCTAppDelegate

@end


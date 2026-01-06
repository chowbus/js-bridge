/**
 * PlatformDetector - 平台检测器
 */

export class PlatformDetector {
  static detect() {
    if (typeof window === 'undefined') {
      return 'node';
    }

    const ua = navigator.userAgent.toLowerCase();

    // iOS WebKit
    if (typeof window.webkit !== 'undefined' && 
        window.webkit.messageHandlers && 
        window.webkit.messageHandlers.NativeBridge) {
      return 'ios';
    }

    // Android WebView
    if (typeof window.AndroidBridge !== 'undefined') {
      return 'android';
    }

    // 浏览器环境判断
    if (/iphone|ipad|ipod/.test(ua)) {
      return 'ios-browser';
    }

    if (/android/.test(ua)) {
      return 'android-browser';
    }

    return 'browser';
  }

  static isNative(platform) {
    return platform === 'ios' || platform === 'android';
  }

  static isBrowser(platform) {
    return platform.includes('browser') || platform === 'browser';
  }

  static getPlatformInfo(platform) {
    return {
      type: platform,
      isNative: this.isNative(platform),
      isBrowser: this.isBrowser(platform),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    };
  }
}

export default PlatformDetector;
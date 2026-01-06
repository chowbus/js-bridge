/**
 * Logger - 日志工具
 */

class Logger {
  constructor(prefix = 'NativeBridge') {
    this.prefix = prefix;
    this.enabled = true;
  }

  log(message, data) {
    if (!this.enabled) return;
    if (typeof console !== 'undefined' && console.log) {
      console.log(`[${this.prefix}] ${message}`, data || '');
    }
  }

  warn(message, data) {
    if (!this.enabled) return;
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[${this.prefix}] ⚠️ ${message}`, data || '');
    }
  }

  error(message, error) {
    if (!this.enabled) return;
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[${this.prefix}] ❌ ${message}`, error || '');
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

/**
 * PlatformDetector - 平台检测器
 */

class PlatformDetector {
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

/**
 * CallbackManager - 回调管理器
 */

class CallbackManager {
  constructor() {
    this.callbacks = {};
    this.callbackId = 0;

    // 在全局对象上创建回调存储
    if (typeof window !== 'undefined' && !window.__nativeBridgeCallbacks) {
      window.__nativeBridgeCallbacks = {};
    }
  }

  /**
   * 生成唯一的回调 ID
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const id = ++this.callbackId;
    return `cb_${timestamp}_${id}_${random}`;
  }

  /**
   * 注册回调函数
   */
  register(callbackId, callback, timeout = 10000) {
    if (typeof window === 'undefined') return;

    window.__nativeBridgeCallbacks[callbackId] = callback;

    // 设置超时
    if (timeout > 0) {
      setTimeout(() => {
        this.remove(callbackId);
      }, timeout);
    }
  }

  /**
   * 执行回调
   */
  execute(callbackId, response) {
    if (typeof window === 'undefined') return false;

    const callback = window.__nativeBridgeCallbacks[callbackId];
    
    if (typeof callback === 'function') {
      callback(response);
      return true;
    }

    return false;
  }

  /**
   * 移除回调
   */
  remove(callbackId) {
    if (typeof window === 'undefined') return;

    if (window.__nativeBridgeCallbacks[callbackId]) {
      delete window.__nativeBridgeCallbacks[callbackId];
    }
  }

  /**
   * 清空所有回调
   */
  clear() {
    if (typeof window === 'undefined') return;

    Object.keys(window.__nativeBridgeCallbacks).forEach(key => {
      delete window.__nativeBridgeCallbacks[key];
    });
  }

  /**
   * 获取回调数量
   */
  count() {
    if (typeof window === 'undefined') return 0;
    return Object.keys(window.__nativeBridgeCallbacks).length;
  }
}

/**
 * iOSAdapter - iOS WebKit 适配器
 */

class iOSAdapter {
  constructor(logger) {
    this.logger = logger;
    this.available = this.checkAvailability();
  }

  checkAvailability() {
    return typeof window !== 'undefined' &&
           typeof window.webkit !== 'undefined' &&
           window.webkit.messageHandlers &&
           window.webkit.messageHandlers.NativeBridge;
  }

  postMessage(message) {
    if (!this.available) {
      throw new Error('iOS WebKit Bridge not available');
    }

    try {
      window.webkit.messageHandlers.NativeBridge.postMessage(message);
      this.logger.log('iOS message sent', message);
    } catch (error) {
      this.logger.error('iOS message send failed', error);
      throw error;
    }
  }

  isAvailable() {
    return this.available;
  }
}

/**
 * AndroidAdapter - Android WebView 适配器
 */

class AndroidAdapter {
  constructor(logger) {
    this.logger = logger;
    this.available = this.checkAvailability();
  }

  checkAvailability() {
    return typeof window !== 'undefined' &&
           typeof window.AndroidBridge !== 'undefined';
  }

  postMessage(message) {
    if (!this.available) {
      throw new Error('Android Bridge not available');
    }

    try {
      const jsonString = JSON.stringify(message);
      window.AndroidBridge.postMessage(jsonString);
      this.logger.log('Android message sent', message);
    } catch (error) {
      this.logger.error('Android message send failed', error);
      throw error;
    }
  }

  isAvailable() {
    return this.available;
  }
}

/**
 * NativeBridge - 核心 Bridge 类
 */


class NativeBridge {
  constructor() {
    this.logger = new Logger('NativeBridge');
    this.callbackManager = new CallbackManager();
    this.eventHandlers = {};
    this.initialized = false;
    this.platform = null;
    this.adapter = null;

    this.init();
  }

  /**
   * 初始化
   */
  init() {
    if (this.initialized) return;

    // 检测平台
    this.platform = PlatformDetector.detect();
    
    // 创建适配器
    this.createAdapter();

    this.initialized = true;
    this.logger.log('Initialized', { 
      platform: this.platform,
      isNative: this.isNative()
    });
  }

  /**
   * 创建适配器
   */
  createAdapter() {
    switch (this.platform) {
      case 'ios':
        this.adapter = new iOSAdapter(this.logger);
        break;
      case 'android':
        this.adapter = new AndroidAdapter(this.logger);
        break;
      default:
        this.adapter = null;
    }
  }

  /**
   * 调用 Native 方法
   */
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      // 非 Native 环境返回模拟数据
      if (!this.isNative()) {
        this.logger.warn(`Not in native environment: ${method}`);
        setTimeout(() => {
          resolve({ mock: true, method, params });
        }, 100);
        return;
      }

      // 生成回调 ID
      const callbackId = this.callbackManager.generateId();

      this.logger.log(`Call: ${method}`, { params, callbackId });

      // 注册回调
      this.callbackManager.register(
        callbackId,
        (response) => {
          this.logger.log(`Callback: ${method}`, response);

          // 处理响应
          if (typeof response === 'object') {
            if (response.success === true) {
              resolve(response.data || {});
            } else if (response.success === false) {
              reject(new Error(response.error || 'Unknown error'));
            } else {
              resolve(response);
            }
          } else {
            resolve(response);
          }

          // 移除回调
          this.callbackManager.remove(callbackId);
        },
        10000 // 10 秒超时
      );

      // 发送消息
      try {
        this.adapter.postMessage({
          method,
          params,
          callbackId
        });
      } catch (error) {
        this.logger.error(`Send failed: ${method}`, error);
        this.callbackManager.remove(callbackId);
        reject(error);
      }
    });
  }

  /**
   * 监听事件
   */
  on(eventName, handler) {
    if (typeof handler !== 'function') {
      this.logger.error('Handler must be a function');
      return;
    }

    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }

    this.eventHandlers[eventName].push(handler);
    this.logger.log(`Listen: ${eventName}`);
  }

  /**
   * 取消监听
   */
  off(eventName, handler) {
    if (!this.eventHandlers[eventName]) return;

    if (handler) {
      this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
        h => h !== handler
      );
    } else {
      delete this.eventHandlers[eventName];
    }

    this.logger.log(`Unlisten: ${eventName}`);
  }

  /**
   * 触发事件
   */
  emit(eventName, data) {
    const handlers = this.eventHandlers[eventName];

    if (!handlers || handlers.length === 0) {
      this.logger.warn(`No listeners for: ${eventName}`);
      return;
    }

    this.logger.log(`Emit: ${eventName}`, data);

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        this.logger.error(`Event handler error: ${eventName}`, error);
      }
    });
  }

  /**
   * 发送单向消息
   */
  send(method, data = {}) {
    if (!this.isNative()) {
      this.logger.warn(`Not in native environment: ${method}`);
      return;
    }

    this.logger.log(`Send: ${method}`, data);

    try {
      this.adapter.postMessage({
        method,
        params: data,
        callbackId: null
      });
    } catch (error) {
      this.logger.error(`Send failed: ${method}`, error);
    }
  }

  /**
   * 检查是否在 Native 环境
   */
  isNative() {
    return PlatformDetector.isNative(this.platform);
  }

  /**
   * 获取平台信息
   */
  getPlatform() {
    return PlatformDetector.getPlatformInfo(this.platform);
  }

  /**
   * 设置日志开关
   */
  setLogEnabled(enabled) {
    this.logger.setEnabled(enabled);
  }

  /**
   * 销毁
   */
  destroy() {
    this.callbackManager.clear();
    this.eventHandlers = {};
    this.initialized = false;
    this.logger.log('Destroyed');
  }
}

/**
 * NativeBridge - 入口文件
 * @version 1.0.0
 * @author jiawei.chen
 */


// 创建单例实例
const instance = new NativeBridge();

if (typeof window !== 'undefined') {
  window.NativeBridge = instance;
}

export { instance as default };

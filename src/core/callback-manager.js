/**
 * CallbackManager - 回调管理器
 */

export class CallbackManager {
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

export default CallbackManager;
/**
 * NativeBridge - 核心 Bridge 类
 */

import { Logger } from '../utils/logger.js';
import { PlatformDetector } from './platform-detector.js';
import { CallbackManager } from './callback-manager.js';
import { iOSAdapter } from '../adapters/ios-adapter.js';
import { AndroidAdapter } from '../adapters/android-adapter.js';

export class NativeBridge {
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

export default NativeBridge;
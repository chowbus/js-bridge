/**
 * NativeBridge - 入口文件
 * @version 1.0.0
 * @author jiawei.chen
 */

import { NativeBridge } from './core/bridge.js';

// 创建单例实例
const instance = new NativeBridge();

if (typeof window !== 'undefined') {
  window.NativeBridge = instance;
}

// 导出
export default instance;
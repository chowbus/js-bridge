/**
 * Logger - 日志工具
 */

export class Logger {
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

export default Logger;
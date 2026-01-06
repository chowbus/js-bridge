# 🌉 Native Bridge

一个通用的 WebView 与原生应用通信的 JavaScript 桥接库，支持 iOS 和 Android 平台。

## ✨ 特性

- 🔄 **统一接口**: 为 iOS 和 Android 提供一致的 API
- 📱 **自动检测**: 自动识别运行平台
- ⚡ **Promise 支持**: 使用现代 async/await 语法
- 🎯 **类型安全**: 完整的参数验证
- 🪶 **轻量级**: 无依赖，体积小
- 🔧 **易于使用**: 简单直观的 API 设计

## 📦 安装

### 通过 CDN 使用 (推荐)

#### jsDelivr (推荐)

```html
<!-- 使用最新版本 -->
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js"></script>

<!-- 使用指定版本 (生产环境推荐) -->
<script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@1.0.0/dist/native-bridge.min.js"></script>
```
```

### 通过 npm 安装

```bash
npm install @chowbus/native-bridge
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/chowbus/js-bridge.git
cd js-bridge

# 安装依赖
npm install

# 构建
npm run build

# 开发模式 (监听文件变化)
npm run dev
```

## 🚀 快速开始

### 基本使用

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Native Bridge Demo</title>
</head>
<body>
  <!-- 从 CDN 加载 -->
  <script src="https://cdn.jsdelivr.net/gh/chowbus/js-bridge@latest/dist/native-bridge.min.js"></script>
  
  <script>
    // 检查平台
    console.log('Platform:', NativeBridge.getPlatform());
    console.log('Is Native:', NativeBridge.isNative());

    // 调用原生方法 (带回调)
    async function callNative() {
      try {
        const result = await NativeBridge.call('getUserInfo', { userId: 123 });
        console.log('User Info:', result);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // 发送消息到原生 (不需要回调)
    NativeBridge.send('trackEvent', { 
      event: 'page_view',
      page: 'home'
    });

    // 监听原生事件
    NativeBridge.on('notification', (data) => {
      console.log('Received notification:', data);
    });
  </script>
</body>
</html>
```

### ES Module 使用

```javascript
import NativeBridge from '@chowbus/native-bridge';

// 检测平台
const platform = NativeBridge.getPlatform();
console.log(`Running on ${platform.type}`);

// 调用原生方法
const result = await NativeBridge.call('nativeMethod', { param: 'value' });

// 发送消息
NativeBridge.send('event', { data: 'value' });

// 监听事件
NativeBridge.on('nativeEvent', (data) => {
  console.log('Received:', data);
});
```

## 📖 API 文档

### `NativeBridge.call(method, params, options)`

调用原生方法并等待返回结果。

```javascript
const result = await NativeBridge.call('methodName', {
  param1: 'value1',
  param2: 'value2'
}, {
  timeout: 10000  // 可选，超时时间(毫秒)
});
```

**参数:**
- `method` (string): 原生方法名
- `params` (object): 传递给原生的参数
- `options` (object): 可选配置
  - `timeout` (number): 超时时间，默认 30000ms

**返回:** Promise<any>

### `NativeBridge.send(method, params)`

发送消息到原生，不等待返回。

```javascript
NativeBridge.send('trackEvent', {
  event: 'click',
  target: 'button'
});
```

**参数:**
- `method` (string): 原生方法名
- `params` (object): 传递给原生的参数

### `NativeBridge.on(event, handler)`

监听原生发送的事件。

```javascript
NativeBridge.on('notification', (data) => {
  console.log('Notification:', data);
});
```

**参数:**
- `event` (string): 事件名称
- `handler` (function): 事件处理函数

### `NativeBridge.off(event, handler)`

取消监听事件。

```javascript
const handler = (data) => console.log(data);
NativeBridge.on('event', handler);
// ...
NativeBridge.off('event', handler);
```

### `NativeBridge.getPlatform()`

获取当前平台信息。

```javascript
const platform = NativeBridge.getPlatform();
// {
//   type: 'ios' | 'android' | 'web',
//   version: string,
//   isNative: boolean
// }
```

### `NativeBridge.isNative()`

判断是否在原生环境中运行。

```javascript
if (NativeBridge.isNative()) {
  // 在原生 WebView 中
} else {
  // 在普通浏览器中
}
```

### `NativeBridge.setLogEnabled(enabled)`

启用/禁用调试日志。

```javascript
NativeBridge.setLogEnabled(true);  // 开启日志
NativeBridge.setLogEnabled(false); // 关闭日志
```

## 🔧 原生端集成

### iOS (Swift)

```swift
import WebKit

class WebViewController: UIViewController, WKScriptMessageHandler {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "nativeBridge")
        
        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)
    }
    
    func userContentController(_ userContentController: WKUserContentController, 
                              didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let callbackId = body["callbackId"] as? String,
              let method = body["method"] as? String,
              let params = body["params"] as? [String: Any] else {
            return
        }
        
        // 处理原生方法调用
        handleMethod(method, params: params) { result in
            self.sendCallback(callbackId: callbackId, data: result)
        }
    }
    
    func sendCallback(callbackId: String, data: Any) {
        let json = try? JSONSerialization.data(withJSONObject: data)
        let jsonString = String(data: json!, encoding: .utf8)!
        let js = "window.NativeBridgeCallbacks.resolve('\(callbackId)', \(jsonString))"
        webView.evaluateJavaScript(js)
    }
}
```

### Android (Kotlin)

```kotlin
class WebViewActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.addJavascriptInterface(NativeBridge(), "NativeBridge")
        
        setContentView(webView)
    }
    
    inner class NativeBridge {
        @JavascriptInterface
        fun postMessage(message: String) {
            val json = JSONObject(message)
            val callbackId = json.getString("callbackId")
            val method = json.getString("method")
            val params = json.getJSONObject("params")
            
            // 处理原生方法调用
            handleMethod(method, params) { result ->
                sendCallback(callbackId, result)
            }
        }
    }
    
    private fun sendCallback(callbackId: String, data: JSONObject) {
        val js = "window.NativeBridgeCallbacks.resolve('$callbackId', $data)"
        webView.post {
            webView.evaluateJavascript(js, null)
        }
    }
}
```

## 🧪 测试

项目包含多个测试文件：

- `test-complex.html` - 本地测试文件
- `test-cdn.html` - CDN 加载测试文件

```bash
# 构建项目
npm run build

# 在浏览器中打开测试文件
open test-complex.html  # macOS
start test-complex.html # Windows
```

## 📝 开发指南

### 项目结构

```
js-bridge/
├── src/
│   ├── adapters/          # 平台适配器
│   │   ├── android-adapter.js
│   │   └── ios-adapter.js
│   ├── core/              # 核心功能
│   │   ├── bridge.js      # 主要桥接逻辑
│   │   ├── callback-manager.js
│   │   └── platform-detector.js
│   ├── utils/
│   │   └── logger.js
│   └── index.js           # 入口文件
├── dist/                  # 构建输出
├── test-complex.html      # 本地测试
├── test-cdn.html          # CDN 测试
└── rollup.config.js       # 构建配置
```

### 构建配置

项目使用 Rollup 构建，生成多种格式：

- `native-bridge.js` - UMD 格式 (浏览器)
- `native-bridge.esm.js` - ES Module 格式
- `native-bridge.cjs.js` - CommonJS 格式
- `native-bridge.min.js` - 压缩版本



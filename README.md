````markdown
# CAudio

A real-time audio streaming plugin that automatically handles data loss, with support for HTTP.

## Installation

Install using [npm](https://www.npmjs.com/package/caudio):

```bash
npm i caudio
```

## Usage

you can use **ECMAScript modules** syntax instead:

```javascript
import CAudio from "caudio";
```


## Example

```javascript
const CAudio = new CAudio({
  url: '/api/xxx',  // 请求地址
  params: xxx,  // 请求参数
  audioType: 'wav',  // 音频格式 
  token: 'yourToken',  // 请求token
  inputCodec： 'Int16',  // 采样编码方式
  sampleRate: 16000,   // 采样率
  bufferSize: 6400,  // 缓冲池音频片段播放大小
  bufferFirstWaitTime: 1000, // 缓冲池第一次等待时间
  bufferIntervalWaitTime: 500, // 缓冲池后续始等待时间
  bufferIntervalPlayTime: 200, // 缓冲池音频片段播放时间
  volume: 1, // 音频声音大小
  flushTime: 200, // 缓冲区刷新时间
  channels: 1  // 声道数
});

CAudio.play();

CAudio.stop();

```

````


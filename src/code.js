
import PCMPlayer from "pcm-player";

class CAudio {
  constructor(config) {
    this.config = config;

    const { url, params, audioType, token,sampleRate, bufferSize, volume, flushTime, inputCodec, channels  } = config
    
    this.player = null
    this.apiUrl = url || ''  // 请求地址
    this.params = params || '' // 请求参数
    this.audioType = audioType || 'wav' // 音频格式
    this.token = token || ''  // 请求token
    this.sampleRate = sampleRate || 16000 // 采样率
    this.bufferSize = bufferSize || 16000; // 音频帧的缓冲区大小
    this.volume = volume || 1 // 音频声音大小
    this.flushTime = flushTime || 200 // 缓冲区刷新时间
    this.channels = channels || 1  // 声道数
    this.inputCodec = inputCodec || 'Int16' // 采样编码方式

    this.init();
  }

  play() {
    const self = this;
    try {
      const headers = new Headers();
      headers.append("Authorization", this.token);
      headers.append("Accept", `audio/${this.audioType}`);

      const signal = this.controller.signal;

      const buffer = new Uint8Array(this.bufferSize);
      let bufferIndex = 0;

      fetch(this.apiUrl + '?' + this.params.toString(), {
        headers,
        signal
      }).then(response => {
        const reader = response.body.getReader();
        return new ReadableStream({
          start(controller) {
            function pump() {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                return pump();
              });
            }
            return pump();
          }
        });
      })
      .then(stream => {
        const reader = stream.getReader();
        return new Response(
          new ReadableStream({
            start(controller) {
              const read = () => {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  // 处理每次获取的数据流（value），大小为不定
                  const data = new Uint8Array(value.buffer);
                  for (let i = 0; i < data.length; i++) {
                    buffer[bufferIndex] = data[i];
                    bufferIndex++;
                    if (bufferIndex >= self.bufferSize) {
                      // 缓冲区已满，可以进行播放操作
                      self.player.feed(buffer);
                      // 重置缓冲区索引
                      bufferIndex = 0;
                    }
                  }
                  return read();
                });
              }
              return read();
            }
          })
        );
      })
      .catch(error => {
        // 处理错误
      });
    } catch (err) {
      console.error(err);
    }
  }

  stop() {
    try {
      this.player.pause()
      this.controller.abort();
    }catch(err) {
      console.warn(err)
    }

    this.player = null

    this.init()
  }

  init() {
    // 初始化逻辑
    this.controller = new AbortController(); // 控制器对象
    this.audioBuffer = []; // 音频缓冲区

    // 初始化PCM
    this.player = new PCMPlayer({
      inputCodec: this.inputCodec,
      channels: this.channels,
      sampleRate: this.sampleRate,
      flushTime: this.flushTime,
      onstatechange: (node, event, type) => {
        console.log("type", node, event, type);
        return {};
      },
      onended: (node, event) => {
        console.log("end fire", node, event);
        return {};
      }
    });
    this.player.volume(this.volume);
  }
}

export default CAudio;
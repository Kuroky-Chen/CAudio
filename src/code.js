import PCMPlayer from "pcm-player";

class CAudio {
  constructor(config) {
    this.config = config;
    const {
      url,
      params,
      audioType,
      token,
      sampleRate,
      bufferSize,
      volume,
      flushTime,
      inputCodec,
      channels,
      bufferFirstWaitTime,
      bufferIntervalWaitTime,
      bufferIntervalPlayTime
    } = config;

    this.player = null;
    this.apiUrl = url || ""; // 请求地址
    this.params = params || ""; // 请求参数
    this.audioType = audioType || "wav"; // 音频格式
    this.token = token || ""; // 请求token
    this.inputCodec = inputCodec || "Int16"; // 采样编码方式
    this.sampleRate = sampleRate || 16000; // 采样率
    this.bufferSize = bufferSize || 6400; // 音频帧的缓冲区大小
    this.bufferFirstWaitTime = bufferFirstWaitTime || 10000; // 缓冲池第一次等待时间
    this.bufferIntervalWaitTime = bufferIntervalWaitTime || 5000; // 缓冲池后续始等待时间
    this.bufferIntervalPlayTime = bufferIntervalPlayTime || 200; // 缓冲池音频片段播放时间
    this.volume = volume || 1; // 音频声音大小
    this.flushTime = flushTime || 200; // 缓冲区刷新时间
    this.channels = channels || 1; // 声道数

    this.init();
  }

  play() {
    const self = this;
    try {
      const headers = new Headers();
      headers.append("Authorization", this.token);
      headers.append("Accept", `audio/${this.audioType}`);

      const signal = this.controller.signal;

      let timer;

      const timerInit = time => {
        setTimeout(() => {
          timer = setInterval(() => {
            onPlay();
          }, self.bufferIntervalPlayTime);
        }, time);
      };

      const onPlay = () => {
        if (self.bufferPool.length > self.bufferSize) {
          const temp = self.bufferPool.splice(0, self.bufferSize);
          self.player.feed(new Uint8Array(temp));
        } else {
          clearInterval(timer);
          timerInit(self.bufferIntervalWaitTime);
        }
      };

      fetch(this.apiUrl + "?" + this.params.toString(), {
        headers,
        signal
      })
        .then(response => {
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
                    const normalArr = Array.from(value);
                    self.bufferPool.push(...normalArr);
                    return read();
                  });
                };
                timerInit(self.bufferFirstWaitTime);
                return read();
              }
            })
          );
        })
        .catch(error => {
          console.error(error);
        });
    } catch (err) {
      console.error(err);
    }
  }

  stop() {
    try {
      this.player.pause();
      this.controller.abort();
    } catch (err) {
      console.warn(err);
    }

    this.player = null;

    this.init();
  }

  init() {
    // 初始化逻辑
    this.controller = new AbortController(); // 控制器对象
    this.bufferPool = []; // 音频缓冲区
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

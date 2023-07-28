class CAudio {
  constructor(config) {
    this.config = config;

    const { url, params, audioType, token, frameSize, bufferSize, frameMethod } = config

    this.apiUrl = url || ''
    this.params = params || ''
    this.audioType = audioType || 'wav'
    this.token = token || ''
    this.frameSize = frameSize || 32; // 音频帧的大小
    this.bufferSize = bufferSize || 10; // 音频帧的缓冲区大小
    this.frameMethod = frameMethod || 'empty' // 补帧方式


    this.init();
  }

  start() {
    try {
      const headers = new Headers();
      headers.append("Authorization", this.token);
      headers.append("Accept", `audio/${this.audioType}`);

      const signal = this.controller.signal;

      fetch(this.apiUrl + '?' + this.params.toString(), {
        headers,
        signal
      })
        .then(response => {
          if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
          }

          const reader = response.body.getReader();

          const read = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                console.log("The audio stream transmission is complete.");
                return;
              }

              // 将接收到的音频数据添加到缓冲区
              this.audioBuffer.push(value);

              // 检查是否有缺失的帧
              if (this.audioBuffer.length >= 2) {
                const currentFrame = new Uint8Array(
                  this.audioBuffer[this.audioBuffer.length - 1]
                );
                const previousFrame = new Uint8Array(
                  this.audioBuffer[this.audioBuffer.length - 2]
                );

                // 补充缺失的帧
                if (currentFrame.length < this.frameSize) {
                  const missingFrame = new Uint8Array(this.frameSize);
                  if (this.frameMethod !== 'empty') {
                    // 补上一帧
                    const offset = currentFrame.length;
                    missingFrame.set(
                      previousFrame.subarray(0, this.frameSize - offset),
                      offset
                    );
                  }

                  this.audioBuffer.push(missingFrame);

                }
              }

              // 处理接收到的音频流数据
              if (this.audioBuffer.length >= this.bufferSize) {
                const audioData = new Blob(this.audioBuffer);
                this.audioUrl = URL.createObjectURL(audioData);
                const audio = new Audio(this.audioUrl);
                this.audioList.push(audio);
                audio.play();
              }

              // 继续读取下一部分音频流数据
              read();
            });
          }

          read();

        })
        .catch(error => {
          console.error("Failed to retrieve real-time audio stream data.:", error);
        });
    } catch (err) {
      console.error(err);
    }
  }

  stop() {
    this.controller.abort();

    this.audioList.forEach(audio => {
      audio.pause();
      audio = null;
    });

    URL.revokeObjectURL(this.audioUrl)

    this.init()
  }

  init() {
    // 初始化逻辑
    this.audioUrl = ""; // 音频url
    this.controller = new AbortController(); // 控制器对象
    this.audioBuffer = []; // 音频缓冲区
    this.audioList = []; // 音频控制台
  }
}

export default CAudio;

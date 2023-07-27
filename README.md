````markdown
# CAudio

A plugin that handles real-time audio streaming data from API endpoints, including frame interpolation and playback.

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


you can use **CommonJS** syntax:

```javascript
const CAudio = require("caudio");
```




## Example

```javascript
const CAudio = new CAudio({
  url: '/api/xxx',
  params: xxx,
  audioType: 'wav',
  token: 'yourToken',
  frameSize: 1024,
  bufferSize: 10,
  frameMethod: 'empty'
});

CAudio.start();

CAudio.stop();

```

````


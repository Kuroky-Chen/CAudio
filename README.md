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
  url: '/api/xxx',
  params: xxx,
  audioType: 'wav',
  token: 'yourToken',
  frameSize: 1024,
  bufferSize: 10,
  frameMethod: 'empty'
});

CAudio.play();

CAudio.stop();

```

````


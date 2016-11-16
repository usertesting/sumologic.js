# sumologic.js

### Installation
`npm install --save sumologic.js`

### Build the module
`npm run build`

### Run the build process locally
`npm run watch`

### Run the specs
`npm run test`

---

### Usage
You need to import `SumoLogic` module:
`import SumoLogic from 'sumologic.js';`


```javascript
const settings = {
  endpoint: "{your Sumo Logic http endpoint}",
  captureConsole: true,
  captureError: true,
};

const sumoLogic = new SumoLogic(settings);
```

### methods

To log an info message
```javascript
sumoLogic.info({
  message: 'message',
  any: 'object',
});
```

To log an error message
```javascript
sumoLogic.error({
  message: 'message',
  any: 'object',
});
```

To log a warning message:
```javascript
sumoLogic.warn({
  message: 'message',
  any: 'object',
});
```

### Settings:
`endpoint` (mandatory) provided by SumoLogic when you create an HTTP collection

`syncInterval` (optional - 3000ms by default) is the frequency we're sending the logs to SumoLogic.

`captureConsole` (optional - true by default). To send console logs to SumoLogic; it includes ('warn', 'info', 'log', 'error'). 

`captureError` (optional - true by default). To send runtime errors to SumoLogic. 

#### Context
It is possible to attach context to the logs. Here is how to do it:
```javascript
sumoLogic.context = {
  host: http://example.com,
  object_id: 22200
};
```

## Additional methods
`SumoLogic.dump()` dump all the logs that are not sent yet to SumoLogic. One use case for this is when you need to make sure all the logs are sent before closing your application.

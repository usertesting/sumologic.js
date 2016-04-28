# sumologic.js

### Build the module
`npm run build`

### Run the build process locally
`npm run watch`

### Run the specs
`npm run test`

---

### Usage
You need to import `SumoLogic` module:

`import SumoLogic from 'sumologic';`

And set the settings:

```javascript
SumoLogic.settings = {
  syncInterval: 3000,
  endpoint: "{your Sumo Logic http endpoint}"
};
```

Then log:

`SumoLogic.send("message");`

`SumoLogic.send({message: "log", id: 222});`

#### Context
It is possible to attach context to the logs. Here is how to do it:
```javascript
SumLogic.context = {
  host: http://example.com,
  object_id: 22200
};
```
---

### Settings:
`syncInterval` is the frequency we're sending the logs to SumoLogic.

`endpoint` provided by SumoLogic when you create an HTTP collection

## Additional methods
`SumoLogic.dump()` dump all the logs that are not sent yet to SumoLogic. One use case for this is when you need to make sure all the logs are sent before closing your application.

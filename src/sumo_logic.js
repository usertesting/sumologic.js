import $ from "jquery";

const SYNC_INTERVAL = 5000;

class SumoLogic {
  constructor(settings= {}, context = {}) {
    
    this.settings = settings;
    this.messages = [];
    this.context = context;
    this.syncInterval = SYNC_INTERVAL;
    if (settings.captureConsole === undefined || settings.captureConsole) {
      this.captureConsole();
    }
    if (settings.captureError === undefined  || settings.captureError) {
      this.captureError();
    }
    this.devMode = settings.devMode;
  }

 log(msg) {
    this._addMessage(msg);
  }

  error(msg) {
    this._addMessage(msg, 'error');
  }

  warn(msg) {
    this._addMessage(msg, 'warning');
  }

  info(msg) {
    this._addMessage(msg);
  }

  dump(success_cb){
    if(this.messages.length == 0) return;
    if(this.devMode) return;
    
    this.sendMessages().done((response)=> this.onMessagesSent(response, success_cb));
  }

  _addMessage(message, level = 'info') {
    if (!message) return;
    this._validateSettings();
    if (typeof(message) === "string"){
      message = { 
        message: message,
      };
    }
    message = {
      ...message,
      level,
    };
    this.messages.push(
      injectContext(
        injectTimeStamp(message), this.context
      )
    );

    if(!this.intervalId){
      this.startDumping();
    }
  }

  startDumping() {
    this.intervalId = setInterval(()=> this.dump(), this.syncInterval);
  }


  sendMessages() {
    return $.ajax({
      type: "POST",
      url: this.settings.endpoint,
      data: this.sentMessages()
    })
  }

  onMessagesSent(response, cb) {
    this.clearMessages();

    if(cb){
      succes_cb(response);
    }
  }

  sentMessages() {
    return this.messages.map((s) => {
      let result = null;
      try {
        result = JSON.stringify(s);
      } catch(_err) {
        // ignore the message
      }
      return result;
    }).join("\n");
  }

  clearMessages() {
    this.messages = [];
  }

  _validateSettings(){
    if(!this.settings.endpoint) {
      throw new Error("Endpoint is missing");
    }
  }

  captureConsole() {
    const info = console.info;
    const log = console.log;
    const warn = console.warn;
    const error = console.error;

    console.log = (...args) => {
      this._addMessage(args[0], "info");
      return log.apply(console, args);
    };

    window.console.info = (...args) => {
      this._addMessage(args[0], "info");
      return info.apply(console, args);
    };

    window.console.warn = (...args) => {
      this._addMessage(args[0], "warning");
      return warn.apply(console, args);
    };

    window.console.error = (...args) => {
      this._addMessage(args[0], "error");
      return error.apply(console, args);
    };
  }

  captureError() {
    const onerror = window.onerror;
    window.onerror = (...args) => {
      const message = args[0];
      const fileName = args[1];
      const line = args[2];
      this._addMessage(`An error '${message}' occured at line ${line} of ${fileName}`, 'error');
      onerror.apply(window, args);
    };
  }
}


const injectTimeStamp = (msg) => $.extend(msg, { timestamp: new Date().toString() } );
const injectContext = (msg, context) => $.extend(msg, { context });

export default SumoLogic;

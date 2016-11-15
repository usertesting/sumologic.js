import $ from "jquery";

const SYNC_INTERVAL = 5000;

class SumoLogic {
  constructor(settings={}) {
    this.settings = settings;
    this.messages = [];
    if (settings.captureConsole || true) {
      this.captureConsole();
    }
    if (settings.captureError || true) {
      this.captureError();
    }
  }

  static log(msg) {
    this.logger = this.logger || new SumoLogic(this.settings);
    this.logger.log(msg);
  }

  static dump(cb){
    this.logger.dump(cb);
  }

  static set settings(new_settings) {
    this._settings = new_settings;
  }

  static get settings() {
    return this._settings;
  }

  static set context(context){
    this._context = context;
  }

  static get context(){
    return this._context;
  }

  get syncInterval() {
    return this.settings.syncInterval || SYNC_INTERVAL;
  }

  

  log(msg) {
    this.validateSettings();
    this.addMessage(msg);
    if(!this.intervalId){
      this.startDumping();
    }
  }

  addMessage(message, level = 'info') {
    if (!message) return;

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
        injectTimeStamp(message)
      )
    );
  }

  startDumping() {
    this.intervalId = setInterval(()=> this.dump(), this.syncInterval);
  }

  dump(success_cb){
    if(this.messages.length == 0) return;

    this.sendMessages().done((response)=> this.onMessagesSent(response, success_cb));
  }

  sendMessages() {
    return $.ajax({
      type: "POST",
      url: SumoLogic.settings.endpoint,
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
    return this.messages.map((s) => JSON.stringify(s)).join("\n");
  }

  clearMessages() {
    this.messages = [];
  }

  validateSettings(){
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
      this.addMessage(args.join(' '), "info");
      return log.apply(console, args);
    };

    window.console.info = (...args) => {
      this.addMessage(args.join(' '), "info");
      return info.apply(console, args);
    };

    window.console.warn = (...args) => {
      this.addMessage(args.join(' '), "warn");
      return warn.apply(console, args);
    };

    window.console.error = (...args) => {
      this.addMessage(args.join(' '), "error");
      return error.apply(console, args);
    };
  }

  captureError() {
    const onerror = window.onerror;
    window.onerror = (...args) => {
      const message = args[0];
      const fileName = args[1];
      const line = args[2];
      this.addMessage(`An error '${message}' occured at line ${line} of ${fileName}`, 'error');
      onerror.apply(window, args);
    };
  }
}


const injectTimeStamp = (msg) => $.extend(msg, { timestamp: new Date().toString() } );
const injectContext = (msg) => $.extend(msg, { context: SumoLogic.context });

export default SumoLogic;

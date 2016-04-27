import $ from "jquery";

const SYNC_INTERVAL = 5000;

class SumoLogic {
  constructor(settings={}) {
    this.settings = settings;
    this.messages = [];
  }

  static log(msg) {
    this.logger = this.logger || new SumoLogic(this.settings);
    this.logger.log(msg);
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

  addMessage(msg) {
    if(msg && typeof(msg) === "string"){
      msg = { message: msg };
    }
    if(msg){
      this.messages.push(this.injectContext(msg));
    }
  }
  
  startDumping() {
    this.intervalId = setInterval(()=> this.dump(), this.syncInterval);
  }

  dump(success_cb){
    if(this.messages.length == 0) return;

    this.sendMessages().done((response)=> onMessagesSent(response, success_cb));
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

  injectContext(msg) {
    return $.extend(msg, {context: SumoLogic.context});
  }
}
export default SumoLogic;

import $ from "jquery";

const DUMP_INTERVAL = 2000;

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

  log(msg) {
    this.validateSettings();
    this.messages.push(msg);
    if(!this.intervalId){
      this.startDumping();
    }
    this.dump(this.clearMessages.bind(this));
  }

  startDumping() {
    this.intervalId = setInterval(this.dump.bind(this), DUMP_INTERVAL);
  }

  dump(succes_cb){
    if(this.messages.length > 0) {
      $.ajax({
        type: "POST",
        url: SumoLogic.settings.endpoint,
        data: this.messages.map((s) => JSON.stringify(s)).join("\n")
      }).done((response)=> succes_cb(response));
    }
  }

  clearMessages() {
    this.messages = [];
  }

  validateSettings(){
    if(!this.settings.endpoint) {
      throw new Error("Endpoint is missing");
    }
  }
}
export default SumoLogic;

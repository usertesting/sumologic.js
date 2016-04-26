import request from 'request';
import jQuery from 'jquery';

class SumoLogic {
  static log(msg) {
    this.logger = this.logger || new SumoLogic();
    this.logger.log(msg);
  }

  constructor() {
    this.settings = SumoLogic.settings;
    this.messages = [];
  }

  static set settings(new_settings) {
    this._settings = new_settings;
  }

  static get settings() {
    return this._settings || {};
  }


  log(msg) {
    SumoLogic.validateSettings()
    this.messages.push(msg);
    this.send();
  }

  send(){
    jQuery.post({
          url: SumoLogic.settings.endpoint,
          data: this.messages.join("\n")
        });
  }

  static validateSettings(){
    if(!this.settings.endpoint) {
      throw new Error("Endpoint is missing");
    }
  }


} export default SumoLogic;

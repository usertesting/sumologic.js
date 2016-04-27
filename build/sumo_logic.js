"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SYNC_INTERVAL = 5000;

var SumoLogic = function () {
  function SumoLogic() {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SumoLogic);

    this.settings = settings;
    this.messages = [];
  }

  _createClass(SumoLogic, [{
    key: "log",
    value: function log(msg) {
      this.validateSettings();
      this.messages.push(msg);
      if (!this.intervalId) {
        this.startDumping();
      }
      this.dump(this.clearMessages.bind(this));
    }
  }, {
    key: "startDumping",
    value: function startDumping() {
      this.intervalId = setInterval(this.dump.bind(this), this.syncInterval);
    }
  }, {
    key: "dump",
    value: function dump(succes_cb) {
      if (this.messages.length > 0) {
        _jquery2.default.ajax({
          type: "POST",
          url: SumoLogic.settings.endpoint,
          data: this.messages.map(function (s) {
            return JSON.stringify(s);
          }).join("\n")
        }).done(function (response) {
          return succes_cb(response);
        });
      }
    }
  }, {
    key: "clearMessages",
    value: function clearMessages() {
      this.messages = [];
    }
  }, {
    key: "validateSettings",
    value: function validateSettings() {
      if (!this.settings.endpoint) {
        throw new Error("Endpoint is missing");
      }
    }
  }, {
    key: "syncInterval",
    get: function get() {
      this.settings.syncInterval || SYNC_INTERVAL;
    }
  }], [{
    key: "log",
    value: function log(msg) {
      this.logger = this.logger || new SumoLogic(this.settings);
      this.logger.log(msg);
    }
  }, {
    key: "settings",
    set: function set(new_settings) {
      this._settings = new_settings;
    },
    get: function get() {
      return this._settings;
    }
  }]);

  return SumoLogic;
}();

exports.default = SumoLogic;
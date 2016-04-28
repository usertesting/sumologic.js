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
      this.addMessage(msg);
      if (!this.intervalId) {
        this.startDumping();
      }
    }
  }, {
    key: "addMessage",
    value: function addMessage(msg) {
      if (msg && typeof msg === "string") {
        msg = { message: msg };
      }
      if (msg) {
        this.messages.push(this.injectContext(msg));
      }
    }
  }, {
    key: "startDumping",
    value: function startDumping() {
      var _this = this;

      this.intervalId = setInterval(function () {
        return _this.dump();
      }, this.syncInterval);
    }
  }, {
    key: "dump",
    value: function dump(success_cb) {
      var _this2 = this;

      if (this.messages.length == 0) return;

      this.sendMessages().done(function (response) {
        return _this2.onMessagesSent(response, success_cb);
      });
    }
  }, {
    key: "sendMessages",
    value: function sendMessages() {
      return _jquery2.default.ajax({
        type: "POST",
        url: SumoLogic.settings.endpoint,
        data: this.sentMessages()
      });
    }
  }, {
    key: "onMessagesSent",
    value: function onMessagesSent(response, cb) {
      this.clearMessages();

      if (cb) {
        succes_cb(response);
      }
    }
  }, {
    key: "sentMessages",
    value: function sentMessages() {
      return this.messages.map(function (s) {
        return JSON.stringify(s);
      }).join("\n");
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
    key: "injectContext",
    value: function injectContext(msg) {
      return _jquery2.default.extend(msg, { context: SumoLogic.context });
    }
  }, {
    key: "syncInterval",
    get: function get() {
      return this.settings.syncInterval || SYNC_INTERVAL;
    }
  }], [{
    key: "log",
    value: function log(msg) {
      this.logger = this.logger || new SumoLogic(this.settings);
      this.logger.log(msg);
    }
  }, {
    key: "dump",
    value: function dump(cb) {
      this.logger.dump(cb);
    }
  }, {
    key: "settings",
    set: function set(new_settings) {
      this._settings = new_settings;
    },
    get: function get() {
      return this._settings;
    }
  }, {
    key: "context",
    set: function set(context) {
      this._context = context;
    },
    get: function get() {
      return this._context;
    }
  }]);

  return SumoLogic;
}();

exports.default = SumoLogic;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SYNC_INTERVAL = 5000;

var SumoLogic = function () {
  function SumoLogic() {
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, SumoLogic);

    this.settings = settings;
    this.messages = [];
    this.context = context;
    this.syncInterval = SYNC_INTERVAL;
    if (settings.captureConsole === undefined || settings.captureConsole) {
      this.captureConsole();
    }
    if (settings.captureError === undefined || settings.captureError) {
      this.captureError();
    }
  }

  _createClass(SumoLogic, [{
    key: 'log',
    value: function log(msg) {
      this._addMessage(msg);
    }
  }, {
    key: 'error',
    value: function error(msg) {
      this._addMessage(msg, 'error');
    }
  }, {
    key: 'warn',
    value: function warn(msg) {
      this._addMessage(msg, 'warning');
    }
  }, {
    key: 'info',
    value: function info(msg) {
      this._addMessage(msg);
    }
  }, {
    key: 'dump',
    value: function dump(success_cb) {
      var _this = this;

      if (this.messages.length == 0) return;

      this.sendMessages().done(function (response) {
        return _this.onMessagesSent(response, success_cb);
      });
    }
  }, {
    key: '_addMessage',
    value: function _addMessage(message) {
      var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';

      if (!message) return;
      this._validateSettings();
      if (typeof message === "string") {
        message = {
          message: message
        };
      }
      message = _extends({}, message, {
        level: level
      });
      this.messages.push(injectContext(injectTimeStamp(message), this.context));

      if (!this.intervalId) {
        this.startDumping();
      }
    }
  }, {
    key: 'startDumping',
    value: function startDumping() {
      var _this2 = this;

      this.intervalId = setInterval(function () {
        return _this2.dump();
      }, this.syncInterval);
    }
  }, {
    key: 'sendMessages',
    value: function sendMessages() {
      return _jquery2.default.ajax({
        type: "POST",
        url: this.settings.endpoint,
        data: this.sentMessages()
      });
    }
  }, {
    key: 'onMessagesSent',
    value: function onMessagesSent(response, cb) {
      this.clearMessages();

      if (cb) {
        succes_cb(response);
      }
    }
  }, {
    key: 'sentMessages',
    value: function sentMessages() {
      return this.messages.map(function (s) {
        return JSON.stringify(s);
      }).join("\n");
    }
  }, {
    key: 'clearMessages',
    value: function clearMessages() {
      this.messages = [];
    }
  }, {
    key: '_validateSettings',
    value: function _validateSettings() {
      if (!this.settings.endpoint) {
        throw new Error("Endpoint is missing");
      }
    }
  }, {
    key: 'captureConsole',
    value: function captureConsole() {
      var _this3 = this;

      var info = console.info;
      var log = console.log;
      var warn = console.warn;
      var error = console.error;

      console.log = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this3._addMessage(args[0], "info");
        return log.apply(console, args);
      };

      window.console.info = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this3._addMessage(args[0], "info");
        return info.apply(console, args);
      };

      window.console.warn = function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        _this3._addMessage(args[0], "warning");
        return warn.apply(console, args);
      };

      window.console.error = function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        _this3._addMessage(args[0], "error");
        return error.apply(console, args);
      };
    }
  }, {
    key: 'captureError',
    value: function captureError() {
      var _this4 = this;

      var onerror = window.onerror;
      window.onerror = function () {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        var message = args[0];
        var fileName = args[1];
        var line = args[2];
        _this4._addMessage('An error \'' + message + '\' occured at line ' + line + ' of ' + fileName, 'error');
        onerror.apply(window, args);
      };
    }
  }]);

  return SumoLogic;
}();

var injectTimeStamp = function injectTimeStamp(msg) {
  return _jquery2.default.extend(msg, { timestamp: new Date().toString() });
};
var injectContext = function injectContext(msg, context) {
  return _jquery2.default.extend(msg, { context: context });
};

exports.default = SumoLogic;
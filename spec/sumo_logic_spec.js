import SumoLogic from '../src/sumo_logic';
import $ from 'jquery';

describe("SumoLogic", ()=>{
  const validSettings = {
    endpoint: "http://sumologic_endpoint.com",
    syncInterval: 2000,
  }

  beforeEach(()=>{
    SumoLogic.settings = validSettings;
  });

  describe("capture console logs", () => {
    describe("if capture console is disabled", () => {
      let sumoLogic;

      beforeEach(() => {
       sumoLogic = new SumoLogic({
          ...validSettings,
          captureConsole: false,
        });
      });

      it("when console.log is called, it doesn't send any logs to SumoLogic", () => {
        console.log("This", "is");
        expect(sumoLogic.messages.length).toEqual(0);
      });

      it("when console.info is called, it doesn't send any logs to SumoLogic", () => {
        console.info("This", "is");
        expect(sumoLogic.messages.length).toEqual(0);
      });

      it("when console.warn is called, it doesn't send any logs to SumoLogic", () => {
        console.warn("This", "is");
        expect(sumoLogic.messages.length).toEqual(0);
      });

      it("when console.error is called, it doesn't send any logs to SumoLogic", () => {
        console.error("This", "is");
        expect(sumoLogic.messages.length).toEqual(0);
      });
    });

    describe("if capture console is enabled", () => {
      it('console.log', () => {
        const originalFunction = console.log = jasmine.createSpy("log");
        const sumoLogic = new SumoLogic(validSettings);
        console.log("This");
        expect(sumoLogic.messages[0]).toEqual(jasmine.objectContaining({
          message: "This",
          level: 'info',
        }));
        expect(originalFunction).toHaveBeenCalledWith("This");
      });

      it('console.info', () => {
        const originalFunction = console.info = jasmine.createSpy("info");
        const sumoLogic = new SumoLogic(validSettings);
        console.info({
          hello: 'message',
        });
        expect(sumoLogic.messages[0]).toEqual(jasmine.objectContaining({
          hello: "message",
          level: 'info',
        }));
        expect(originalFunction).toHaveBeenCalledWith({
          hello: 'message',
        });
      });

      it('console.warn', () => {
        const originalFunction = console.warn = jasmine.createSpy("warn");
        const sumoLogic = new SumoLogic(validSettings);
        console.warn("This");
        expect(sumoLogic.messages[0]).toEqual(jasmine.objectContaining({
          message: "This",
          level: 'warning',
        }));
        expect(originalFunction).toHaveBeenCalledWith("This");
      });

      it('console.error', () => {
        const originalFunction = console.error = jasmine.createSpy("error");
        const sumoLogic = new SumoLogic(validSettings);
        console.error("This is an error");
        expect(sumoLogic.messages[0]).toEqual(jasmine.objectContaining({
          message: "This is an error",
          level: 'error',
        }));
        expect(originalFunction).toHaveBeenCalledWith("This is an error");
      });
    });
  });
  

  describe("capture errors", () => {
    describe("if capture errors is disabled", () => {
      let sumoLogic;

      beforeEach(() => {
       window.onerror = () => {};
       sumoLogic = new SumoLogic({
          ...validSettings,
          captureError: false,
        });
      });

      it('window.onerror', () => {
        const fileName = "sumo_logic.js";
        const lineNumber = 302;
        window.onerror("Missing audio");
        expect(sumoLogic.messages.length).toEqual(0);
      });
    });

    describe("if capture errors is enabled", () => {
      it('window.onerror', () => {
        const originalOnError = window.onerror = jasmine.createSpy("onerror");
        const sumoLogic = new SumoLogic(validSettings);
        const fileName = "sumo_logic.js";
        const lineNumber = 302;
        window.onerror("Missing audio", fileName, lineNumber);
        expect(sumoLogic.messages[0]).toEqual(jasmine.objectContaining({
          message: "An error 'Missing audio' occured at line 302 of sumo_logic.js",
          level: 'error',
        }));
        expect(originalOnError).toHaveBeenCalledWith("Missing audio", fileName, lineNumber);
      });
    });
  });

  describe("#log", () => {
    let sumoLogic;

    beforeEach(()=>{
      sumoLogic = new SumoLogic(validSettings);
    });

    describe("settings are provided", ()=>{
      it("does not throw an error", ()=>{
        expect(() => sumoLogic.log("message")).not.toThrow();
      });
    });

    describe("settings are not provided", ()=>{
      it("throw an error", ()=>{
        let sumoLogic = new SumoLogic({})
        expect(() => sumoLogic.log("message")).toThrow();
      });
    });

    it("starts dumping", ()=>{
      let sumoLogic = new SumoLogic(validSettings);
      let spy = spyOn(sumoLogic, 'startDumping');
      jasmine.clock().install();
      sumoLogic.log("anything");
      jasmine.clock().tick(validSettings.syncInteval-2);
      expect(sumoLogic.startDumping).toHaveBeenCalled();
      jasmine.clock().uninstall();
    });

    it("adds a string as an object", ()=>{
      sumoLogic.log("hello")
      expect(sumoLogic.messages[0]["message"]).toEqual("hello");
    });

    it("adds a an object as is", ()=>{
      sumoLogic.log({ hello: "this is great" });
      expect(sumoLogic.messages[0].hello).toEqual("this is great");
    });

    it("adds current time as a timestamp field", ()=>{
      let currentTime = new Date();
      sumoLogic.log({hello: "this is great"});
      expect(sumoLogic.messages[0]["timestamp"]).toEqual(currentTime.toString());
    });

    it("set log level to info by default", () => {
      sumoLogic.log({ hello: "this is great" });
      expect(sumoLogic.messages[0]["level"]).toEqual("info");
    });

    it("supports warning", () => {
      sumoLogic.warn({ hello: "this is great" });
      expect(sumoLogic.messages[0]).toEqual(jasmine.objectContaining({
        hello: 'this is great',
        level: "warning",
      }));
    });

    it("ignores an empty object", ()=>{
      sumoLogic.log("");
      sumoLogic.log();
      sumoLogic.log(null);
      expect(sumoLogic.messages.length).toEqual(0);
    });

    describe("context is available", ()=>{
      const context = {
        session_id: 1000
      }

      it("injects context into the message", ()=>{
        sumoLogic = new SumoLogic(validSettings, context);
        sumoLogic.log("HELLO");
        let message = sumoLogic.messages[0];
        expect(message.context).toEqual(context);
      });
    })
  })
  describe("#dump", ()=>{
    let sumoLogic;
    beforeEach(function() {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(validSettings.endpoint);

      sumoLogic = new SumoLogic(validSettings);
    });
    afterEach(function() {
     jasmine.Ajax.uninstall();
   });

    it("posts messages to the specified endpoint", ()=>{
      sumoLogic.log("Message1");
      sumoLogic.log("Message2");
      sumoLogic.dump();

      let request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toEqual(validSettings.endpoint);
      expect(request.method).toBe('POST');
    });

    it("send post request only if there are message", ()=>{
      sumoLogic.dump();

      let request = jasmine.Ajax.requests.mostRecent();
      expect(request).toEqual(undefined);
    });

    it("send post request only if devMode is false", () => {
      sumoLogic = new SumoLogic({ 
        ...validSettings,
        devMode: false,
      });
      sumoLogic.log("Message1");
      sumoLogic.dump();

      let request = jasmine.Ajax.requests.mostRecent();
      expect(request).not.toEqual(undefined);
    });

    it("doesn't post request if devMode is true", () => {
      sumoLogic = new SumoLogic({ 
        ...validSettings,
        devMode: true,
      });
      sumoLogic.log("Message1");
      sumoLogic.dump();

      let request = jasmine.Ajax.requests.mostRecent();
      expect(request).toEqual(undefined);
    });
  });

  describe("#clearMessages", ()=>{
    it("clear messages", ()=>{
      let sumoLogic = new SumoLogic(validSettings);
      sumoLogic.log("Message1");
      sumoLogic.log("Message2");
      sumoLogic.clearMessages();
      expect(sumoLogic.messages.length).toEqual(0);
    });
  });
});

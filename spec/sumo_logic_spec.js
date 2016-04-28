import SumoLogic from '../src/sumo_logic';
import $ from 'jquery';

describe("SumoLogic", ()=>{
  const validSettings = {
    endpoint: "http://sumologic_endpoint.com",
    syncInterval: 2000
  }


  beforeEach(()=>{
    SumoLogic.settings = validSettings;
  });

  describe("#log", ()=>{
    describe("settings are provided", ()=>{
      it("does not throw an error", ()=>{
        expect(() => SumoLogic.log("message")).not.toThrow();
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
  });

  describe("#addMessage", ()=>{
    let sumoLogic;

    beforeEach(()=>{
      sumoLogic = new SumoLogic(validSettings);
    });

    it("adds a string as an object", ()=>{
      sumoLogic.addMessage("hello")
      expect(sumoLogic.messages[0]["message"]).toEqual("hello");
    });

    it("adds a an object as is", ()=>{
      sumoLogic.addMessage({hello: "this is great"});
      expect(sumoLogic.messages[0].hello).toEqual("this is great");
    });

    it("adds current time as a timestamp field", ()=>{
      let currentTime = new Date();
      sumoLogic.addMessage({hello: "this is great"});
      expect(sumoLogic.messages[0]["timestamp"]).toEqual(currentTime.toString());
    });

    it("ignores an empty object", ()=>{
      sumoLogic.addMessage("");
      sumoLogic.addMessage();
      sumoLogic.addMessage(null);
      expect(sumoLogic.messages.length).toEqual(0);
    });

    describe("context is available", ()=>{
      const context = {
        session_id: 1000
      }

      it("injects context into the message", ()=>{
        SumoLogic.context = context;
        sumoLogic.addMessage("HELLO");
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

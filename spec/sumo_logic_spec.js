import SumoLogic from '../src/sumo_logic';
import $ from 'jquery';

describe("SumoLogic", ()=>{
  const validSettings = {
    endpoint: "http://sumologic_endpoint.com",
    sync_interval: 2000
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

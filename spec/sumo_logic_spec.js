
import SumoLogic from '../src/sumo_logic';

describe("SumoLogic", ()=>{

  const validSettings = {
    endpoint: "http://sumologic_endpoint.com"
  }

  beforeEach(()=>{
    SumoLogic.settings = validSettings;
    spyOn(SumoLogic.prototype, 'send')
  });

  describe(".log", ()=>{
    describe("settings are provided", ()=>{
      it("does not throw an error", ()=>{
        expect(() => SumoLogic.log("message")).not.toThrow();
      });
    });

    describe("settings are not provided", ()=>{
      it("throw an error", ()=>{
        SumoLogic.settings = {};
        expect(() => SumoLogic.log("message")).toThrow();
      });
    });
  });
});

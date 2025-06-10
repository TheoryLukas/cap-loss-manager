const cds = require("@sap/cds");

class TreatyBrowserService extends cds.ApplicationService {
  init() {
    const { Treaty } = this.entities;
    const Treaties = this.entities["Losses.treaties"];

    this.on("READ", Treaty, async (req) => {
      const result = await cds.tx(req).run(req.query);
      return result;
    });

    this.on("getSelectedTreaties", async (req) => {
      const treaties = await SELECT.from(Treaties).where({
        up__ID: req.data.lossid,
      });
      return treaties.map((treaty) => ({
        ID: treaty.ID,
        treatyname: treaty.treatyname,
        treatydata: treaty.treatydata,
      }));
    });

    this.on("saveData", async (req) => {
      const { destination, source } = req.data;

      const LossCreatorService = await cds.connect.to("LossCreatorService");

      try {
        await LossCreatorService.send({
          event: "updateData",
          entity: "Losses.drafts",
          data: { selectedTreaties: source },
          params: [destination],
        });
      } catch (error) {
        req.error(error.message);
      }
    });

    return super.init();
  }
}

module.exports = TreatyBrowserService;

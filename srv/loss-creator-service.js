const cds = require("@sap/cds");

class LossCreatorService extends cds.ApplicationService {
  init() {
    const { Losses } = this.entities;
    const Treaties = this.entities["Losses.treaties"];

    this.on("updateData", Losses.drafts, async (req) => {
      const sourceData = req.data.selectedTreaties;
      const destinationID = req.params[0];

      const draftID = (await SELECT.one.from(Treaties.drafts))
        .DraftAdministrativeData_DraftUUID;

      await DELETE.from(Treaties.drafts).where({ up__ID: destinationID });

      const newTreaties = sourceData.map((treaty) => ({
        ...treaty,
        up__ID: destinationID,
        DraftAdministrativeData_DraftUUID: draftID,
      }));

      await INSERT.into(Treaties.drafts).entries(newTreaties);
    });

    return super.init();
  }
}

module.exports = LossCreatorService;

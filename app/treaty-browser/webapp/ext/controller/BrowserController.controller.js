sap.ui.define(
  ["sap/ui/core/mvc/ControllerExtension"],
  function (ControllerExtension) {
    "use strict";

    return ControllerExtension.extend(
      "treatybrowser.ext.controller.BrowserController",
      {
        override: {
          onAfterRendering: async function () {
            const oExtensionAPI = this.base.getExtensionAPI();

            const oTable = oExtensionAPI
              .byId(
                "treatybrowser::TreatyList--fe::table::Treaty::LineItem::Table"
              )
              .getMDCTable();

            const params = this.base
              .getAppComponent()
              .getComponentData().startupParameters;
            const lossid = params && params.lossid ? params.lossid[0] : "";

            const treaties = (
              await oExtensionAPI.editFlow.invokeAction("getSelectedTreaties", {
                model: oExtensionAPI.editFlow.getView().getModel(),
                invocationGrouping: "isolated",
                parameterValues: [{ name: "lossid", value: lossid }],
                skipParameterDialog: true,
              })
            ).getObject().value;

            setTimeout(
              (table, setTreaties) => {
                const oRows = [];

                table.findElements(true).forEach((oControl) => {
                  if (oControl.isA("sap.m.ColumnListItem"))
                    oRows.push(oControl);
                });

                oRows.forEach((oRow) => {
                  const rowID = oRow.getBindingContext().getProperty("ID");

                  setTreaties.forEach((treaty) => {
                    if (treaty.ID === rowID) {
                      oRow.setSelected(true);
                    }
                  });
                });

                table.getActions()[0].getAction().setEnabled(true);
              },
              1000,
              oTable,
              treaties
            );

            oTable.attachSelectionChange(function () {
              const params = this.getParent()
                .getPageController()
                .getAppComponent()
                .getComponentData().startupParameters;
              const lossid = params && params.lossid ? params.lossid[0] : "";

              const oExtensionAPI = this.getParent()
                .getPageController()
                .getExtensionAPI();

              const selectedTreaties = [];

              this.getSelectedContexts().forEach((treaty) => {
                selectedTreaties.push({
                  ID: treaty.getProperty("ID"),
                  treatyname: treaty.getProperty("treatyname"),
                  treatydata: treaty.getProperty("treatydata"),
                });
              });

              oExtensionAPI.editFlow.invokeAction("saveData", {
                model: oExtensionAPI.editFlow.getView().getModel(),
                invocationGrouping: "Isolated",
                parameterValues: [
                  { name: "destination", value: lossid },
                  {
                    name: "source",
                    value: selectedTreaties,
                  },
                ],
                skipParameterDialog: true,
              });
            });
          },
        },
        navigateBack: function () {
          const params = this.base
            .getAppComponent()
            .getComponentData().startupParameters;
          const lossid = params && params.lossid ? params.lossid[0] : "";

          sap.ushell.Container.getService(
            "CrossApplicationNavigation"
          ).toExternal({
            target: {
              semanticObject: "loss",
              action: "creator",
            },
            params: {
              ID: lossid,
            },
          });
        },
      }
    );
  }
);

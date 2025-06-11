sap.ui.define([], function () {
  "use strict";

  return {
    import: function (oEvent) {
      sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
        target: {
          semanticObject: "treaty",
          action: "browser",
        },
        params: {
          lossid: oEvent.getProperty("ID"),
        },
      });
    },
  };
});

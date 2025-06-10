# Creating Losses and assigning Treaties with SAP CAP and Fiori ELements

## 1. Create CAP Services

## 1.1. Create DB-Schema

```cds
namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';

@Common.SemanticObject: 'Loss'
@Common.SemanticKey   : [ID]
entity Losses : cuid, managed {
    losstype         : String @mandatory;
    lossdata         : String @mandatory;
    lossoptionaldata : String;

    treaties         : Composition of many {
                           key ID         : UUID;
                               treatyname : String;
                               treatydata : String;
                       }
}
```

The Entity `Losses` saves the data of the associated treaties in an embedded `composition of many` (the key `ID` is required to save multiple).

To facilitate navigation add the annotations `@Common.SemanticObject` and `@Common.SemanticKey`.

## 1.2. Create Services

Create a CAP Service to Browse Entities (refered to as the **Browser**):

```cds
using {cuid} from '@sap/cds/common';
using { db } from '../db/schema';


service TreatyBrowserService {
    @Common.SemanticObject: 'Treaty'
    @Common.SemanticKey   : [ID]
    @readonly
    entity Treaty : cuid {
        treatyname : String;
        treatydata : String;
    }

    entity Losses as projection on db.Losses;    

    action saveData(destination : UUID, source : array of Treaty);
    action getSelectedTreaties(lossid: UUID) returns array of Treaty;
}
```
The Treaties are defined within the servic, because they're not stored within the CAP project and are instead fetched from another system.

The Treatied in the Browser only need to be viewable, so the annotation `@readonly` is added.

The unbound action `saveData` recieves the `source` (selected) Treaties and the `destination` (from **Creator**) Loss-ID. It _may_ perfom rudimentary validation. It then forwards the IDs to an action in the **Creator**.

The unbound action `getSelectedTreaties` allows the Fiori frontend to get the assigned Treaties to a specific Loss and select them automatically.   

---

Create a CAP Service to Manage/Create Entities (refered to as the **Creator**):

```cds
using {db} from '../db/schema';

service LossCreatorService {
    @odata.draft.enabled
    entity Losses as projection on db.Losses
        actions {
            action updateData(selectedTreaties : array of {
                ID         : UUID;
                treatyname : String;
                treatydata : String;
            });
        };
}
```

Add the annotation `@odata.draft.enabled` to allow creating new Entities and use the Fiori Drafts.

The bound action `updateData` inserts the data from the entity selected in the User-Client (e.g. Webbrowser). It is called by an action in the **Browser**.

### 1.3. Implement Service Logic

```js
this.on("READ", Treaty, async (req) => {
    const result = await cds.tx(req).run(req.query);
    return result;
});
```

To simulate the loading of the Treaties from another system, the `"READ"` event is overwritten with an analog `SELECT` operation.

```js
    const Treaties = this.entities["Losses.treaties"];

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
```

To allow the service to read the Treaties stored within the Losses the entity is accessed with `this.entities["Losses.treaties"]`. The relevant Treaties are identified by the uplink field `up__ID`.

```js
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
```

The implementation of `saveData` forwards the data to `updateData` on a draft Loss in the **Creator** specified by the destination argument. It also forwards a possible Error back to the User-Client.

---

```js
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
```

The implementation of `updateData` replaces the draft data with the selected Treaties.

## 2. Create two Fiori Elements Apps

Create two SAP Fiori Elements Apps (e.g. List-Report & Object-Page) with the Application Generator.

The Apps should be named according to the following schema:
    
`SemanticObject Name`-`Action Name` -> e.g. `loss-creator`

### 2.1. Add a Fiori-Launchpad for local Development

The Navigation Functionality of SAPUI5 requires a Launchpad to work.

### 2.2. Configure CrossNavigation

```json
"crossNavigation": {
    "inbounds": {
        "Loss-Creator": {
            "semanticObject": "Loss",
            "action": "Creator",
            "title": "{{appTitle}}",
            "signature": {
                "parameters": {
                    "ID": {
                        "required": false
                    }
                }
            }
        }
    }
}
```

The Navigation Option on the **Creator** needs an optional parameter for the primary key field of the entity to automatically redirect the user to the specific Object-Page.

---

```json
"crossNavigation": {
    "inbounds": {
        "Treaty-Browser": {
            "semanticObject": "Treaty",
            "action": "Browser",
            "title": "{{appTitle}}",
            "signature": {
                "parameters": {
                    "lossid": {
                        "required": false
                    }
                }
            }
        }
    }
}
```

The Navigation Option on the **Browser** the optional parameter holds the primary key of the entity the User wants to import to. To prevent automatically applying a filter for the primary key, the parameter should have a different name.

### 2.3. Extend Object-Page of Creator

Add a button on the Object-Page which invokes the navigation.

```json
"content": {
    "header": {
        "actions": {
            "importLoss": {
                "visible": true,
                "enabled": "{ui>/isEditable}",
                "text": "Search to Import",
                "press": "losscreator.ext.controller.NavigationSender.import"
            }
        }
    }
}
```

> [!TIP]
> Use the Apps Page Map inside Visual Studio Code and the SAP Fiori Extensions or SAP Business Application Studio

Define a button `importLoss` in the `manifest.json` of the **Creator** App in the `LossesObjectPage` section. The button invokes the action `import` inside `NavigationSender.js` in the `ext/controller` directory.

```js
import: function(oEvent) {
    sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
        target: {
            semanticObject: "treaty",
            action: "browser"
        },
        params: {
            lossid: oEvent.getProperty("ID")
        }
    })
}
```

The `import` action calls the `.toExternal()` method of the `CrossApplicationNavigation` service. The `target` property should match the configuration in the targets `manifest.json` and the `params` property contains the primary key.

### 2.4 Extend List-Report of Browser

Add a Controller Extension on the List-Report to implement the Navigation and apply a filter to not show the entity the User wants to import to.

```json
"extends": {
    "extensions": {
        "sap.ui.controllerExtensions": {
            "sap.fe.templates.ListReport.ListReportController": {
                "controllerName": "treatybrowser.ext.controller.BrowserController"
            }
        }
    }
}
```

The Controller Extension in the `ext/controller` directory contains the implementation for the Navigation to have easy access to the Pages `ExtensionAPI`.

```json
"controlConfiguration": {
    "@com.sap.vocabularies.UI.v1.LineItem": {
        "tableSettings": {
            "type": "ResponsiveTable",
            "selectionMode": "Multi"
        },
        "actions": {
            "NavigateBack": {
                "requiresSelection": true,
                "text": "Go Back",
                "press": ".extension.treatybrowser.ext.controller.BrowserController.navigateBack",
                "visible": true,
                "enabled": true
            }
        }
    }
}
```

> [!IMPORTANT]
> The button is required to add the checkboxes inside the table of the List-Report

> [!TIP]
> Use the Apps Page Map inside Visual Studio Code and the SAP Fiori Extensions or SAP Business Application Studio

```js
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
```

After the Page has finished rendering the Loss Id and selected treaties are retrieved.

```js
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
```

To automatically select the rows in the table that contain the already assigned Treaties the controller needs to wait for the table to be fully loaded to access the rows. Because the button isn't enabled by this, it has to be done manually.

This is implemented with a timeout.

> [!IMPORTANT]
> This should be possible with `table.initialized(): Promise` but I couldn't get it to work.

```js
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
}
```

After the user selects/unselects a row the selected rows are sent to the CAP service to save the current state.

```js
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
}
```

To assign the button a useful function, it navigates the user back to the Loss.

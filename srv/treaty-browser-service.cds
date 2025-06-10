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

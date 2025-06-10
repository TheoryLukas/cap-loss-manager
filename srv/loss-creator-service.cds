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

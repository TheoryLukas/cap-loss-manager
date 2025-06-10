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

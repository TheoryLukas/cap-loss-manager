using LossCreatorService as service from '../../srv/loss-creator-service';
using from '../../db/schema';


annotate service.Losses with @(
    UI.FieldGroup #LossesFacet: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'losstype',
                Value: losstype,
            },
            {
                $Type: 'UI.DataField',
                Label: 'lossdata',
                Value: lossdata,
            },
            {
                $Type: 'UI.DataField',
                Label: 'lossoptionaldata',
                Value: lossoptionaldata,
            }
        ],
    },
    UI.Facets                 : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'LossesFacet',
            Label : 'General Information',
            Target: '@UI.FieldGroup#LossesFacet',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'TreatiesFacet',
            Label : 'Treaties',
            Target: 'treaties/@UI.PresentationVariant',
        }
    ],
    UI.LineItem               : [
        {
            $Type: 'UI.DataField',
            Label: 'losstype',
            Value: losstype,
        },
        {
            $Type: 'UI.DataField',
            Label: 'lossdata',
            Value: lossdata,
        },
        {
            $Type: 'UI.DataField',
            Label: 'lossoptionaldata',
            Value: lossoptionaldata,
        }
    ],
);

annotate service.Losses.treaties with @UI: {
    PresentationVariant: {
        Visualizations: ['@UI.LineItem'],
        $Type         : 'UI.PresentationVariantType',
        SortOrder     : [{
            $Type     : 'Common.SortOrderType',
            Property  : treatyname,
            Descending: true,
        }]
    },
    LineItem           : [
        {
            $Type: 'UI.DataField',
            Label: 'treatyname',
            Value: treatyname,
        },
        {
            $Type: 'UI.DataField',
            Label: 'treatydata',
            Value: treatydata,
        }
    ],
    CreateHidden : true,
    DeleteHidden : true,
};
annotate service.Losses.treaties with {
    treatyname @Common.FieldControl : #ReadOnly
};

annotate service.Losses.treaties with {
    treatydata @Common.FieldControl : #ReadOnly
};


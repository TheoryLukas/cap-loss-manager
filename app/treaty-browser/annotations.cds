using TreatyBrowserService as service from '../../srv/treaty-browser-service';
annotate service.Treaty with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'treatyname',
                Value : treatyname,
            },
            {
                $Type : 'UI.DataField',
                Label : 'treatydata',
                Value : treatydata,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'treatyname',
            Value : treatyname,
        },
        {
            $Type : 'UI.DataField',
            Label : 'treatydata',
            Value : treatydata,
        },
    ],
);


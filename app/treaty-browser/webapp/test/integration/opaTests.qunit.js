sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'treatybrowser/test/integration/FirstJourney',
		'treatybrowser/test/integration/pages/TreatyList',
		'treatybrowser/test/integration/pages/TreatyObjectPage'
    ],
    function(JourneyRunner, opaJourney, TreatyList, TreatyObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('treatybrowser') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheTreatyList: TreatyList,
					onTheTreatyObjectPage: TreatyObjectPage
                }
            },
            opaJourney.run
        );
    }
);
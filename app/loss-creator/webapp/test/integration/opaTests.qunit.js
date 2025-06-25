sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'losscreator/test/integration/FirstJourney',
		'losscreator/test/integration/pages/LossesList',
		'losscreator/test/integration/pages/LossesObjectPage'
    ],
    function(JourneyRunner, opaJourney, LossesList, LossesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('losscreator') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheLossesList: LossesList,
					onTheLossesObjectPage: LossesObjectPage
                }
            },
            opaJourney.run
        );
    }
);
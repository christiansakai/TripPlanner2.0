'use strict';

angular.module('tripPlannerApp')
  .controller('MapOverlayCtrl', function ($scope, $interval, $timeout, planData, ngGPlacesAPI) {
  	// Sets the autocomplete box to search a location with a radius of meters
  	var currentTrip = planData.getCurrentTrip();
    var bounds = new google.maps.Circle({
    	center: new google.maps.LatLng(
    		currentTrip.location.latitude, 
    		currentTrip.location.longitude
    		),
    	// radius: 2000
    })
    .getBounds();

    this.details = {};

    this.toggleView = function(view) {
        this.initialButtonState = false;
    	planData.toggleView(view);
    };

    this.initialButtonState = true;

    this.textSearch = function(autocomplete) {
    	var self = this;
    	var alreadyDetails = false;
    	/*
			If something is selected from the autocomplete list, the user wants that
			specific location, not 20 search results, so, this function will check 10 
			times within 500ms to see if there are any place details.  If there aren't,
			then it's assumed that we should query google for a list of results rather 
			than just the details of the place that they selected.
    	*/
    	var checkForDetails = $interval(function() {
    		if(self.details.details !== undefined) {
				$interval.cancel(checkForDetails);
                planData.setTextSearch(self.details.details);
				self.details.details = undefined;
				alreadyDetails = true;
    		}
    	}, 50, 10);

		$timeout(function() {
			if(!alreadyDetails) {
				ngGPlacesAPI.textSearch({'query':autocomplete})
					.then(function(data) {
						planData.setTextSearch(data);
					});
			}
		},500);		

    };

    this.radarSearch = function(type) {
        ngGPlacesAPI.radarSearch({
            'location': new google.maps.LatLng(37.775, -122.419),
            'radius':2000,
            'keyword':type})
        .then(function(data) {
            for(var i=0, n=data.length; i<n; i++) {
                data[i].id = i;
            }
            planData.setRadarSearch(data);
        });
    };

    this.searchFieldOptions = {
    	bounds: bounds
    };

    this.showCalendar = function() {
        return planData.getCalendarStatus();
    };

    this.showMap = function() {
        return planData.getMapStatus();
    };

    this.getSearchResults = function() {
        return planData.getSearchResults();
    }
  });

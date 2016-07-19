app.controller('EegCtrl', function($base64, $scope, sessionsService){

	var QueryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  //return no paramters
	  if(query === ''){
	  	return false;
	  }
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	        // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = decodeURIComponent(pair[1]);
	        // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
	      query_string[pair[0]] = arr;
	        // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(decodeURIComponent(pair[1]));
	    }
	  } 
	    return query_string;
	}();	

	//Session builder
	function Session(key, topic, category, start, end, location){
		return {
			"Key": key,
			"Topic": topic,
			"Printed": "",
			"Category" : category,
			"StartDate": parseDate(start, 'M/D/YYYY'),
			"StartTime" : parseDate(start, 'HH:mm'),
			"EndDate" : parseDate(end, 'M/D/YYYY'),
			"EndTime" : parseDate(end, 'HH:mm'),
			"Description" : "",
			"Location" : location,
			"Tags" : key
		}
	}

	function parseDate(wholeDate, format) {
		var date = moment(wholeDate);	
		return date.format(format);		
	}

	function getInnerText(element) {
		if(element) {
			return element.innerHTML;
		} else {
			return '';
		}
	}

	//Helper function to re-render inputs
	$scope.renderInputs = function() {
		setTimeout(function(){componentHandler.upgradeDom()});
	};	

	//Export Csv from table data
	$scope.exportCsv = function(){
		if ($scope.eeg.tableData.length  <= 0){
			return false;
		}
		return $scope.eeg.tableData;
	};

	//Get session token
	$scope.connect = function(){
		var authorize = sessionsService.authorize($scope.eeg.creds.username, $scope.eeg.creds.password);
		authorize.then(function(obj){
			var parseXml,
				xmlSessionDoc;

			//Ensure response is OK
			if(obj.statusText === 'OK' && obj.data) {
				//Ensure xml parsing is available
				if (typeof window.DOMParser != "undefined"){
					parseXml = function(xmlStr) {
						return (new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
					}
					xmlSessionDoc = parseXml(obj.data);
				} else {
					console.log("ERROR: please use a modern browser.");
					$scope.eeg.error = true;
				}

				if (xmlSessionDoc){
					var sessionTokenElement = xmlSessionDoc.getElementsByTagName('sessionId')[0];
					
					//Check for sessionId element
					if(sessionTokenElement){
						$scope.eeg.creds.sessionToken = sessionTokenElement.innerHTML;
						$scope.eeg.creds.authorized = true;
						$scope.eeg.creds.authroizedText = "Authorized";
					} else {
						console.log("ERROR: invalid credentials.");
						$scope.eeg.error = true;
					}					
				}
			} else {
				console.log("ERROR: unsuccessful request.");
				$scope.eeg.error = true;
			}
		},
			function(err){
				console.log("ERROR");
				console.log(err);
				$scope.eeg.error = true;
			}
		);
	};

	$scope.listSessions = function() {
		$scope.eeg.tableData = [];
		$scope.eeg.results = {};
		var getSessions = sessionsService.getSessions($scope.eeg.creds.sessionToken, $scope.eeg.creds.eventId, $scope.eeg.creds.mobileSecret);
		getSessions.then(function(obj){
			if(obj.statusText === 'OK' && obj.data){
				var parseXml,
					xmlDoc;
				//Ensure xml parsing is available
				if (typeof window.DOMParser != "undefined"){
					parseXml = function(xmlStr) {
						return (new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
					}
					xmlDoc = parseXml(obj.data);
				} else {
					console.log("ERROR: please use a modern browser.");
					$scope.eeg.error = true;
				}

				if(xmlDoc){
					var sessionElements = xmlDoc.getElementsByTagName('result');
					$scope.eeg.sessionNumbers = sessionElements.length;					
					if(sessionElements.length > 0){
						$scope.eeg.success = true;
						$scope.parseResults(sessionElements);
					} else {
						console.log("ERROR: no sessions");
						$scope.eeg.error = true;
					}

				} else {
					console.log("ERROR: no response.");
					$scope.eeg.error = true;
				}
			} else {
				console.log("ERROR: unsuccessful request.");
				$scope.eeg.error = true;
			}

		},
			function(err){
				console.log("ERROR");
				console.log(err);
				$scope.eeg.error = true;
			}
		);
	};	

	$scope.parseResults = function(sessionList){
		//Take data and create new session instance and add to list
		for(var i = 0, j = sessionList.length; i < j; i++){
			var keyEl = getInnerText(sessionList[i].getElementsByTagName('sessionOccurrenceId')[0]);
			var topicEl = getInnerText(sessionList[i].getElementsByTagName('sessionName')[0]);
			var categoryEl = getInnerText(sessionList[i].getElementsByTagName('sessionCategories')[0]);
			var startEl = getInnerText(sessionList[i].getElementsByTagName('sessionStartTime')[0]);
			var endEl = getInnerText(sessionList[i].getElementsByTagName('sessionEndTime')[0]);
			var locationEl = getInnerText(sessionList[i].getElementsByTagName('sessionRoomName')[0]);	
			$scope.eeg.tableData.push(Session(keyEl, topicEl, categoryEl, startEl, endEl, locationEl));		
		}
	};	
	
	$scope.csvOrder = ["Key", "Topic", "Printed", "Category", "StartDate", "StartTime", "EndDate", "EndTime", "Description", "Location", "Tags", "TrackAttendance", "Capacity"];

	$scope.eeg = {};
	$scope.eeg.creds = {};
	$scope.eeg.creds.username = '';
	$scope.eeg.creds.password = '';
	$scope.eeg.creds.mobileSecret = '';
	$scope.eeg.creds.eventId = '';
	$scope.eeg.creds.authorized = false;
	$scope.eeg.creds.url = 'https://login.salesforce.com/services/Soap/c/24.0/';
	$scope.eeg.creds.sessionToken = '';
	$scope.eeg.creds.authroizedText = "Authorize";

	$scope.eeg.results = {};	
	$scope.eeg.tableData = [];
	$scope.eeg.success = false;
	$scope.eeg.error = false;
	$scope.eeg.sessionNumbers = 0;

	//Import url paramaters if they exist
	if(QueryString){
		if(QueryString.u){
			$scope.eeg.creds.username = QueryString.u;
		}
		if(QueryString.p){
			$scope.eeg.creds.password = QueryString.p;
		}
		if(QueryString.e){
			$scope.eeg.creds.eventId = QueryString.e;
		}
		if(QueryString.m){
			$scope.eeg.creds.mobileSecret = QueryString.m;
		}
	}


	$scope.renderInputs();

});

//Entire card element
app.directive('card', function() {
	return {
		restrict: 'E',
		templateUrl: './js/templates/card.html'
	}
});

//Passbook Settings Element
app.directive('settings', function() {
	return {
		restrict: 'E',
		templateUrl: './js/templates/settings.html',
		link: function($scope){
			$scope.renderInputs();
		}
	}
});


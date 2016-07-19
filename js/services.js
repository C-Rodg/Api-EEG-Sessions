app.service('sessionsService', function($http){

	this.authorize = function(username, password) {
		
		var soapData = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com"><soapenv:Body><urn:login><urn:username>'
		soapData += username + '</urn:username><urn:password>';
		soapData += password + '</urn:password></urn:login></soapenv:Body></soapenv:Envelope>';	
		var aspAction = 'js/actions/connect.asp';

		return $http.post(aspAction, soapData);
	};

	this.getSessions = function(sessionToken, eventId, mobileSecret) {

		var soapData = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:eeg="http://soap.sforce.com/schemas/class/EEG_SessionMobileWebService"><soapenv:Header><eeg:SessionHeader><eeg:sessionId>';
		soapData += sessionToken + '</eeg:sessionId></eeg:SessionHeader></soapenv:Header><soapenv:Body>';
		soapData += '<eeg:getAllSessionOccurrences><eeg:eventId>';
		soapData += eventId + '</eeg:eventId><eeg:mobileAppSecretKey>';
		soapData += mobileSecret + '</eeg:mobileAppSecretKey></eeg:getAllSessionOccurrences></soapenv:Body></soapenv:Envelope>';
		var aspAction = 'js/actions/getSessions.asp';

		return $http.post(aspAction, soapData);
	};
	
});
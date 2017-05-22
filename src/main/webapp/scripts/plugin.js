

registerTopcatPlugin(function(pluginUrl){
	return {
		scripts: [],

		stylesheets: [],

		configSchema: {
			facilities: {
				_type: 'array',
                _item: {
                	authenticationTypes: {
                        _type: 'array',
                        _item: {
                        	casUrl: { _type: 'string', _mandatory: function(o){
                                return o.plugin == 'cas';
                            }}
                        }
                    }
                }
			}
		},

		setup: function($rootScope, tc){

			var casIframes = [];

			$rootScope.$on('login:enter', function(){
		        _.each(tc.nonUserFacilities(), function(facility){
		            _.each(facility.config().authenticationTypes, function(authenticationType){
		                if(authenticationType.plugin == 'cas'){

		                    var service = window.location.href.replace(/#.*$/, '').replace(/[^\/]*$/, '') + 'topcat_cas_plugin/cas.html?facilityName=' + facility.config().name;

		                    var casIframe = $('<iframe>').attr({
		                        src: authenticationType.casUrl + '/login?service=' + encodeURIComponent(service)
		                    }).css({
		                        position: 'relative',
		                        left: '-1000000px',
		                        height: '1px',
		                        width: '1px'
		                    });

		                    $(document.body).append(casIframe);
		                    casIframes.push(casIframe);
		                }
		            });
		        });
		    });

	        $rootScope.$on('login:leave', function(){
	            _.each(casIframes, function(casIframe){
	                $(casIframe).remove();
	            });

	            casIframes = [];
	        });

			$rootScope.$on('login:external:cas', function(event, facility, authenticationType){
				var service = window.location.href.replace(/#.*$/, '').replace(/[^\/]*$/, '') + 'topcat_cas_plugin/cas.html?facilityName=' + facility.config().name;
				window.location = authenticationType.casUrl + '/login?service=' + encodeURIComponent(service);
			});

			$rootScope.$on('cas:authentication', function(event, facilityName, ticket){
	            var service = window.location.href.replace(/#.*$/, '').replace(/[^\/]*$/, '') + 'topcat_cas_plugin/cas.html?facilityName=' + facilityName;
	            tc.icat(facilityName).login('cas', {service: service, ticket: ticket}).then(function(){
	                var name;
	                var params = {};
	                if($sessionStorage.lastState){
	                    name = $sessionStorage.lastState.name;
	                    params = $sessionStorage.lastState.params;
	                } else {
	                    name = tc.config().home == 'browse' ? 'home.browse.facility' : 'home.' + tc.config().home;
	                }
	                $state.go(name, params);
	            });
	        });

	        $rootScope.$on('session:remove', function(icat){
	        	if(icat.session().plugin == 'cas'){
                    var authenticationTypesIndex = {};
                    _.each(icat.facility().config().authenticationTypes, function(authenticationType){
                        authenticationTypesIndex[authenticationType.plugin] = authenticationType;
                    });

                    var authenticationType = authenticationTypesIndex['cas'];

                    var casIframe = $('<iframe>').attr({
                        src: authenticationType.casUrl + '/logout'
                    }).css({
                        position: 'relative',
                        left: '-1000000px',
                        height: '1px',
                        width: '1px'
                    });

                    $(document.body).append(casIframe);

                    var defered = $q.defer();
                    promises.push(defered.promise);

                    $(casIframe).on('load', function(){
                        defered.resolve();
                        $(casIframe).remove();
                    });

                }
	        });

		}
	};
});


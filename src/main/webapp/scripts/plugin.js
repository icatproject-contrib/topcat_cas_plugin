

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

		                    var service = window.location.href.replace(/#.*$/, '').replace(/[^\/]*$/, '') + 'topcat_cas_plugin/cas?facilityName=' + facility.config().name;

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

			$rootScope.$on('login:external:cas', function(){
				var service = window.location.href.replace(/#.*$/, '').replace(/[^\/]*$/, '') + 'topcat_cas_plugin/cas?facilityName=' + this.facilityName;
				console.log('cas');
			});

			$rootScope.$on('cas:authentication', function(event, facilityName, ticket){
	            var service = window.location.href.replace(/#.*$/, '').replace(/[^\/]*$/, '') + 'topcat_cas_plugin/cas?facilityName=' + facilityName;
	            tc.icat(facilityName).login('cas', service, ticket).then(function(){
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
		}
	};
});


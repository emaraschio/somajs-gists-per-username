;(function (gist, undefined) {
	'use strict';

	var App = soma.Application.extend({
		init:function () {
			this.injector.mapClass('service', GistService);
			this.commands.add(Events.SEARCH, SearchCommand);
			this.createTemplate(GistTemplate, $('.gist')[0]);
		}
	});

	var Events = {
		"SEARCH": "search",
		"SEARCH_RESULT": "search_result"
	};

	var SearchCommand = function (service) {
		return {
			execute:function (event) {
				service.search(event.params);
			}
		};
	};

	var GistService = function (dispatcher) {
		var url = "https://api.github.com/users/{username}/gists";
		return {
			search:function (query) {
				$.ajax({
					type:'GET',
					url: url.replace("{username}", query),
					jsonp: "callback",
					dataType:'json',
					success:function (data) {
						dispatcher.dispatch(Events.SEARCH_RESULT, data);
					}
				});
			}
		};
	};

	var GistTemplate = function(scope, template, element, mediators, dispatcher) {

		dispatcher.addEventListener(Events.SEARCH, searchHandler);
		dispatcher.addEventListener(Events.SEARCH_RESULT, resultHandler);

		function searchHandler(event) {
			scope.message = "Searching...";
			template.render();
		}

		function resultHandler(event) {
			scope.gists = event.params;
			scope.message = "Search result: " + scope.gists.length;
			template.render();
		}

		scope.visit = function(event, url) {
			window.open(url);
		};

		scope.search = function(event) {
			var value = $('.queryInput', element).val();
			if (event.which === 13 && value !== "") {
				dispatcher.dispatch(Events.SEARCH, value);
			}
		};

		return {
			dispose: function() {
				dispatcher.removeEventListener(Events.SEARCH, searchHandler);
				dispatcher.removeEventListener(Events.SEARCH_RESULT, resultHandler);
			}
		};

	};

	var app = new App();

})(window.gist = window.gist || {});

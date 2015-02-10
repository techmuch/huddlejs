define(['q', 'knockout', 'dataLoader'], function(Q,ko,dl) {

	function Dataprovider() {
	  	this.self = this;
	  	self.path = path = 'data/project.json';
	  	
	  	self.point = ko.observable(0);
	  	self.splotData = ko.observableArray([]);
	  	self.cadData = ko.observableArray([]);

	  	self.splot = ko.computed(function(){
	  		return self.splotData()[self.point()]
	  	})

	  	self.cad = ko.computed(function(){
	  		return self.cadData()[self.point()]
	  	})

	  	dl.GET(path)
	  	.then(function(data){
	  		debugger;
	  	})

	}

	return new Dataprovider();

});

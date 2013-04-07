;(function($) {

	var gmap = function(obj, options) {
		var $mapDiv = $(obj);
		var _DB = "markerDB";
		var _TABLE = "markerTable";
	
		var t = {
			bounds: new google.maps.LatLngBounds(),
			db: new localStorageDB(_DB, localStorage),
			geocoder: new google.maps.Geocoder(),
			map: false,
			mapDiv: $mapDiv,
			mapOptions: {
				center: new google.maps.LatLng(39.76, -86.15), 
				mapTypeId: google.maps.MapTypeId.HYBRID, 
				scrollwheel: false,
				zoom: 8,
			},
			markers: [],
		}
		
		//merge options into object
		if(options) {
			t = $.extend(true, t, options);
		}
		
		t.init = function(options) {
		
			t.bounds = new google.maps.LatLngBounds();
		
			if(options) {
				t.mapOptions = $.extend(true, t.mapOptions, options);	
			}
			t.map = new google.maps.Map(t.mapDiv[0], t.mapOptions);
			
			if(!t.db.tableExists(_TABLE)) {
				t.db.createTable(_TABLE, ["name", "street", "city", "state", "zip", "lat", "lng", "index"]);
				t.db.commit();
			} else {
				t.db.query(_TABLE, function(row){
					t.addMarker(row.lat, row.lng, row.name);
				});
			}
				
			if(t.markers.length>1) {
				t.map.fitBounds(t.bounds);
			} else if (t.markers.length==1) {
				console.log(t.markers);
				t.map.panTo(t.markers[0][0].getPosition());
			}
			
			return t.map;
		}
		
		t.addMarker = function(lat, lng, name, callback) {
			var latlng = new google.maps.LatLng(lat, lng);
		
			var marker = new google.maps.Marker({
				map: t.map,
				position: latlng,
				title: name,
			});
			
			var index = t.markers.length +1; //identifier for row in table
			t.markers.push([marker, index]);
			
			google.maps.event.addListener(marker, 'click', function(){
				var row = t.db.query(_TABLE, {index:index});
				row = row[0];
				
				var form    = $('#edit-marker');
				var $name   = form.find('#name');
				var $street = form.find('#street');
				var $city   = form.find('#city');
				var $state  = form.find('#state');
				var $zip    = form.find('#zip');
				
				$name.val(row.name);
				$street.val(row.street);
				$city.val(row.city);
				$state.val(row.state);	
				$zip.val(row.zip);
				
				form.attr("value", index);
				$("a[href='#edit']").click();
			});
			t.bounds.extend(latlng);
			return [marker, index];
		}
		
		t.moveMarker = function(marker, lat, lng) {
			var latlng = new google.maps.LatLng(lat, lng);
			marker.setPosition(latlng);
			t.bounds.extend(latlng);
		}
		
		t.hasLatLng = function(lat, lng) {
			var result = t.db.query(_TABLE, {"lat":lat, "lng":lng});
			if (result.length === 0) {
				return false;
			} else {
				return true;
			}
		}
		
		t.saveRow = function(row) {
			if(t.db.tableExists(_TABLE)) {
				t.db.insert(_TABLE, {
					name: row.name,
					street: row.street,
					city: row.city,
					state: row.state,
					zip: row.zip,
					lat: row.lat,
					lng: row.lng,
					index: row.index,
				});
				t.db.commit();
			} else {
				console.log("table doesnt exist yet");
			}
		}
		
		t.getRow = function(index) {
			var row = t.db.query(_TABLE, {index:index});
			return row[0];
		}
		
		t.updateRow = function(index, row) {
			if(t.db.tableExists(_TABLE)) {
				t.db.update(_TABLE, {index: index}, function(r) {
					r.name = row.name;
					r.street = row.street;
					r.city = row.city;
					r.state = row.state;
					r.zip = row.zip;
					r.lat = row.lat;
					r.lng = row.lng;
					console.log(r);
					return r;
				});
				t.db.commit();
			} else {
				console.log("table doesnt exist yet");
			}
		}
		
		t.deleteRow = function(index) {
			if(t.db.tableExists(_TABLE)) {
				t.db.deleteRows(_TABLE, {index: index});
				t.db.commit();
			} else {
				console.log("table doesnt exist yet");
			}
		}
		
		t.deleteMarkers = function() {
			t.db.dropTable(_TABLE);
			t.markers = [];
		}
		
		t.geocode = function(location, callback) {
		
			t.geocoder.geocode({"address": location}, function(results, status) {
				
				var response = {
					success: status == google.maps.GeocoderStatus.OK ? true : false,
					status: status,
					results: results
				}
				if(typeof callback === "function") {
					callback(response);
				}				
			});
		}
		
		return t;
	}
	
	//jQuery alias
	$.fn.gmap = function(options) {
		return new gmap($(this), options);
	}
	
})(jQuery);
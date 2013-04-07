;(function($, window) {
	
	var jQT, map;
	
	jQT = $.jQTouch({
				statusBar: 'black'
	});
		
	$(document).ready(function() {
		
		
		map = $("#map").gmap();
		map.init();
		
		var goHome = function() {
			$("a[href='#home']").click();
		}
		
		$("#home").bind('pageAnimationEnd', function(event, info) {
			if (info.direction == "in") {
				$("#map").show();
				google.maps.event.trigger(map.map, 'resize');
				map.map.fitBounds(map.bounds);
			}
			return false;
		});
	
		//marker form
		$("#new-marker").submit(function(e) {
			var $t      = $(this);
			var $name   = $t.find("#name");
			var $street = $t.find("#street");
			var $city   = $t.find("#city");
			var $state  = $t.find("#state");
			var $zip    = $t.find("#zip");
			var index = map.markers.length +1;
			
			var address = [
				$street.val(),
				$city.val(),
				$state.val(),
				$zip.val()
			];
			
			var resetFields = function() {
				$name.val("");
				$street.val("");
				$city.val("");
				$state.val("");
				$zip.val("");
			}
			
			map.geocode(address.join(" "), function(response) {
				if(response.success) {	
					var lat = response.results[0].geometry.location.lat();
					var lng = response.results[0].geometry.location.lng();
					
					if(!map.hasLatLng(lat, lng)) {
						var marker = map.addMarker(lat, lng, $name.val() /*callback*/);
						map.saveRow({name: $name.val(), street: $street.val(), city: $city.val(), state: $state.val(), zip: $zip.val(), lat: lat, lng: lng, index: index});
						resetFields();
						goHome();
					} else {
						alert('\"' + $.trim(address.join(" ")) + '\" already has a marker. Enter a different address.' );
					}
				} else {
					alert("Invalid address. Enter a different address.");
				}
			});
			
			e.preventDefault();
		});
		
		$("#edit-marker").submit(function(e) {
			var $t      = $(this);
			var $name   = $t.find("#name");
			var $street = $t.find("#street");
			var $city   = $t.find("#city");
			var $state  = $t.find("#state");
			var $zip    = $t.find("#zip");
			var index = $t.attr("value");			
			var row = map.getRow(index);
			
			console.log(index);
			
			var address = [
				$street.val(),
				$city.val(),
				$state.val(),
				$zip.val()
			];
			
			var resetFields = function() {
				$name.val("");
				$street.val("");
				$city.val("");
				$state.val("");
				$zip.val("");
			}
			
			map.geocode(address.join(" "), function(response) {
				if(response.success) {	
					var lat = response.results[0].geometry.location.lat();
					var lng = response.results[0].geometry.location.lng();
					
					if(!map.hasLatLng(lat, lng)) {
						map.moveMarker(map.markers[index-1][0], lat, lng);
						map.updateRow(index, {name: $name.val(), street: $street.val(), city: $city.val(), state: $state.val(), zip: $zip.val(), lat: lat, lng: lng});
						resetFields();
						goHome();
					} else if($name.val() != row.name){
						map.updateRow(index, {name: $name.val(), street: $street.val(), city: $city.val(), state: $state.val(), zip: $zip.val(), lat: lat, lng: lng});
						map.markers[index-1][0].setTitle($name.val());
						resetFields();
						goHome();
					} else if($street.val() === row.street || $city.val() === row.city || $state.val() === row.state || $zip.val() === row.zip) {
						resetFields();
						goHome();
					} else {
						alert('\"' + $.trim(address.join(" ")) + '\" already has a marker. Enter a different address.' );
					}
				} else {
					alert("Invalid address. Enter a different address.");
				}
			});
			
			e.preventDefault();
		});
		
		$("#delete-everything").bind("click", function(e){			
			map.deleteMarkers();
			map.init();
		});
		
		$("#delete-marker").bind("click", function(e){			
			var index = $("#edit-marker").attr("value");
			alert(index);
			/*map.deleteRow(index);
			map.init();
			goHome();*/
		});
		
		console.log(map.markers);
		console.log(map.db.query("markerTable"));
	});
}(jQuery, this));
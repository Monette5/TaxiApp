/**
 * Utility to get default value from the field name if it was undefined or empty
 * @param {type} fieldName
 * @param {type} defaultValue
 * @returns {jQuery}
 */
function isLetter(str) {
	return str.length === 1 && str.match(/[a-z]/i);
}
function isNumber(str) {
	return str.length === 1 && str.match(/[0-9]/);
}
//FR1.1 Validating the OUCU starts with a letter and ends with a number.
function get_name_value(fieldName, defaultValue) {
	var value = $('#' + fieldName).val();
	if (value == "") {
		value = defaultValue;
		$('#' + fieldName).val(value);
	}
	if (fieldName == "oucu") {
		if (!(isLetter(value.charAt(0)) && isNumber(value.charAt(value.length - 1)))) {
			alert("Please enter the correct value");
			return "";
		}
	}
	return value;
}

/**
 * The main class
 */
var app = {
	initialize: function () {
		this.bindEvents();
	},

	bindEvents: function () {

		var address; // The client address 
		var aCounter = 0;  //The counter for the widget next and previous buttons
		var anCounter = 0; //The counter for the orders next and previous buttons
		var arr = []; // The totals to update on each addition of order items
		var orderItems = []; //The order items object storage
		var latitude; // The latitude to set for the order items table view
		var longitude; // The longitude to set for the order items table view


		// !!!use geolocaqtion instead og google open street map!!!

		function MegaMaxSale() {

			document.addEventListener("DOMContentLoaded", function () {
				getWidget(aCounter); //Loads the first widget on app loading, listener for content loading.
				/* setOrderId();Sets an order to add items to - this could be used to place an empty order on start
				however I selected the option to place the order using the 'place new order' button. */
			});
			
			/**
			 * allows the user to navigate to the previous widget in the catalogue.
			 */
			 
			this.previous = function () { 
				var id = document.getElementById('widget_id').value; // Gets the widget_id from the hidden field ("widget_id")
				if (id > 8) { //A check to make sure that the widget id is greater than 8, which is the lowest widget_id to prevent failure due to a lower id not being present.
					getWidget(--aCounter); // decrements aCounter
				} else {
					document.getElementById("previous").disabled = true;
					document.getElementById("next").disabled = false;
				}
			};
			
			/**
			 * allows the user to navigate to the next widget in the catalogue.
			 */

			this.next = function () { 
				var id = document.getElementById('widget_id').value; // Gets the widget_id from the hidden field ("widget_id")
				if (id < 17) { //A check to make sure that the widget id is less than 17, which is the highest widget_id to prevent failure due to a higher id not being present.
					getWidget(++aCounter); // increments aCounter
				} else {
					document.getElementById("next").disabled = true;
					document.getElementById("previous").disabled = false;
				}
			};
			
			/**
			 * The next order button - not required but for future use
			 */
			
			this.nextorder = function () { 
				viewOrders(++anCounter);
				if (anCounter > 0) {
					document.getElementById("prevorder").disabled = false;
				}
			};
			
			/**
			 * The previous order button - not required but for future use
			 */
			this.prevorder = function () { 
				if (anCounter == 0) {
					document.getElementById("prevorder").disabled = true;

				} else {
					viewOrders(--anCounter);
				}
			};
			
			/**
			 * Displays the widget information and allows navigating the widget calalogue using nextwidget and prevwidget buttons
			 * @param aCounter
			 * @returns undefined
			 */
			function getWidget(aCounter) { //Scrolls through the orders using next and previous buttons
				/* Fetch the user ID from the "name" input field */
				var oucu = get_name_value('oucu', 'mag569');
				/* Fetch the password from the "pass" input field */
				var password = get_name_value('pass', 'Ai7PSUV6');
				//FR1.2 Navigating the widgets catalogue (with Previous and Next buttons) and display of widget images,
				//in addition to the description and asking price, presented in text fields.
				$.get('http://137.108.93.222/openstack/api/widgets?OUCU=' + oucu + '&password=' + password,
					//$.get('http://137.108.93.222/openstack/api/widgets?OUCU=mag569&password=Ai7PSUV6',
					function (data) {
					var obj = $.parseJSON(data);
					if (obj.status == "fail" || obj.status == "error") { // Error checking
						alert(obj.data[0].reason); // alerting the user to the issue
					} else {
						// extracting the relevant widget information to display
						var Id = obj.data[aCounter].id;
						var url = obj.data[aCounter].url;
						var description = obj.data[aCounter].description;
						var price = obj.data[aCounter].pence_price;

						document.getElementById('widget_id').value = Id; //This field is hidden but is used to enable the functionality of the next/previous widget buttons.
						document.getElementById('description').value = description; // Sets the description to the text description of the widget.
						document.getElementById('pence_price').value = price; // Sets the price to the price of the widget.
						img.src = url;
						document.getElementById('imagename').value = img.src; // Sets the image to the widget image.

					}

				});

			}

			/**
			 * Sets the address to be converted to latitude and longitude to place the order
			 * @param client_id
			 * @returns undefined
			 */
			function getClientDetails(client_id) { //gets the address details to be converted to latitude and longitude using the client_id as returned by clicking the Place New Order button.
				var currentDate = new Date(); // Get the current date
				// 2(a) FR1.4
				$.get('http://137.108.93.222/openstack/api/clients/' + client_id + '?OUCU=mag569&password=Ai7PSUV6', //Query the clients table via the API using GET
					function (data) {
					var obj = $.parseJSON(data);
					if (obj.status == "fail" || obj.status == "error") { // Error checking
						alert(obj.data[0].reason); // alerting the user to the issue
					} else {

						obj.data.forEach(function (item) { // Iterate the returned JSON to extract the client details

							address = item.address; 
							var name = item.name;
							var id = item.id;
							
							//Set the row in the client_table for the order_items list to the client details
							table = document.getElementById('client_table');
							var x = table.rows[0].cells;
							/* if (obj.data[0].id == client_id) { */

							x[0].innerHTML = "Dear " + name + " Your order at " + address + " on " + tidyDate(currentDate); // output the client information to the order items list
							setLatLon(address); // Set the latitude and longitude using the client address by calling setLatLon(address)

						});
					}
				});

			}
			/**
			 * Sets the latitude and longitude of the client's address to include as parameters for the order
			 * @param address
			 * @returns undefined
			 */
			function setLatLon(address) { //sets the latitude and longitude for the order

				var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false"; //This is the url for the google maps API
				// The client address is the parameter for the google maps API call and from this the latitude and longitude is returned as follows:
				$.get(url, function (data) {
					//The jquery get processes the JSON data results from the url

					latitude = data.results[0].geometry.location.lat; // The returned latitude
					longitude = data.results[0].geometry.location.lng; //The returned longitude
					if (latitude != undefined & longitude != undefined) { // If these are are defined
						setOrderId(latitude, longitude); // Sets the latitude and longitude as parameters for the order to be placed and calls setOrderId(latitude, longitude)
					}
					// sets the table cells in the order_items list view to latitude and longitude 
					var table = document.getElementById("totals_table");
					var a = table.rows[3].cells;
					a[1].innerHTML = latitude; 
					
					var b = table.rows[4].cells;
					b[1].innerHTML = longitude;
				});

			}
			/**
			 * Formats the date so they can be compared to get the orders for the current date
			 * @param date
			 * @returns undefined
			*/
			
			function tidyDate(date) { 
				var d = date.getDate(); // Formats the day
				var m = date.getMonth() + 1; // Formats the month
				var y = date.getFullYear(); // Formats the year
				return '' + (d <= 9 ? '0' + d : d) + '-' + (m <= 9 ? '0' + m : m) + '-' + y; // returns the formatted date
			}
			
			/**
			 * Scrolls through the current orders - future functionality would be to updat the map with the day's orders using this instead of the "place new order button"
			 * @param anCounter
			 * @returns undefined
			 */
			function viewOrders(anCounter) { //Scrolls through the orders using nextorder and prevorder order buttons

				var oucu = get_name_value('oucu', 'mag569');
				var password = get_name_value('pass', 'Ai7PSUV6');
				var client_id = get_name_value('client_id', '1');

				//var client_id = document.getElementById('client_id');

				$.get('http://137.108.93.222/openstack/api/orders?OUCU=mag569&password=Ai7PSUV6', // Calls the orders API to GET orders
					function (data) {
					var obj = $.parseJSON(data);
					if (obj.status == "fail" || obj.status == "error") { // Error checking
						alert(obj.data[0].reason);// alerting the user to the problem
					} else {
						if (anCounter == obj.data.length) { // Checks if the value of aCounter has reached the length of the returned JSON object
							document.getElementById("nextorder").disabled = true; // Disables the nextorder button
						} else { // Iterates through the orders
							Id = obj.data[anCounter].id;
							var client = obj.data[anCounter].client_id;
							var date = obj.data[anCounter].date;
							lat = obj.data[anCounter].latitude;
							lon = obj.data[anCounter].longitude;
							var d = new Date(date);
							var theDate = tidyDate(d); //Formats the date

							document.getElementById("nextorder").disabled = false; // Enables the nextorder button

							document.getElementById('order_out').value = "Order " + Id + " for client " + client + " on date " + date; //Sets the order out field to the selected order
						}
					}

				});

			};
			
			/**
			 * Getting the current orders from the MegaMax API and if the date matches the current date then update the map to show the order locations
			 * @returns undefined
			 */
			function getOrders() { //Shows currently placed order on map and in the order_out form field
				var curr = new Date(); // Creates a new date object curr for today's date
				var currentDate = tidyDate(curr); //formats the date object to a simpler format for comparison purposes
				var oucu = get_name_value('oucu', 'mag569');
				var password = get_name_value('pass', 'Ai7PSUV6');
				$.get('http://137.108.93.222/openstack/api/orders?OUCU=mag569&password=Ai7PSUV6', // Calls the orders API to GET orders
					function (data) {
					var obj = $.parseJSON(data);
					if (obj.status == "fail" || obj.status == "error") { // Error checking
						alert(obj.data[0].reason); // alerting the user to the problem
					} else {
						obj.data.forEach(function (item) { //Iterate the items in the returned JSON object to retrieve the order information
							id = item.id;
							var client = item.client_id;
							var date = item.date;
							var lat = item.latitude;
							var lon = item.longitude;
							//LatLon = {lat: lat, lon:lon};
							var d = new Date(date); // Format the date for comparison with the currentDate value
							var theDate = tidyDate(d);
							if (theDate == currentDate) { // Compare dates to see if the currentDate and the order date match
								setMarker(lat, lon);
							}
					
							
						});
		
						
					}
					//resetform();resets the inputs ready for the next order - can be uncommented if required
				});

			}
			/**
			 * Adding order items to an order when the "add new order" button is clicked
			 * Adds the listed items to the order using the orderItems global variable
			 * @param order_id
			 * @returns undefined
			 */
			function addOrderItemsToOrder(order_id) { 
				for (var i = 0; i < orderItems.length; i++) { //Iterates the orderItems object and retrieves the POST parameters

					var oucu = orderItems[i].OUCU;
					var numb = orderItems[i].number;
					var password = orderItems[i].password;
					var price = orderItems[i].pence_price;
					var widget_id = orderItems[i].widget_id;
					//var order_id = get_name_value('order_id', '206');
					//var order_id = document.getElementById('order_id');

					$.post('http://137.108.93.222/openstack/api/order_items?', { // Posts the details to the order_items API 
						widget_id: widget_id,
						OUCU: oucu,
						password: password,
						number: numb,
						pence_price: price,
						order_id: order_id, // The order_id passed from the setOrderId(latitude, longitude) function.
					},

						function (data) {

						var obj = $.parseJSON(data);
						if (obj.status == "fail" || obj.status == "error") { // Error checking if POST fails
							alert(" Please try again"); // Alerts the user
						} else {
							getOrders(); // Calls the getOrders() function to complete FR2.2

						}

					});

				}
			}
			/**
			 * Create a new order - this would be an FR as outlined in Q2 Part a. 
			 * This sets the latitude and longitude shown in the latitude and longitude fields shown in the order items list.
			 * @param latitude 
			 * @param longitude
			 * @returns undefined
			 */
			function setOrderId(latitude, longitude) { // creates an order with the converted latitude and longitude, this is FR 2 as described in Q2a
				var oucu = get_name_value('oucu', 'mag569');
				var password = get_name_value('pass', 'Ai7PSUV6');
				var client_id = get_name_value('client_id', '1');

				//var client_id = document.getElementById('client_id');
				if (client_id == "1" || client_id == "2") { // valid client ids
					$.post('http://137.108.93.222/openstack/api/orders?', { // POST to the orders API
						OUCU: oucu,
						password: password,
						client_id: client_id,
						latitude: latitude,
						longitude: longitude,
					},

						function (data) {

						var obj = $.parseJSON(data);
						if (obj.status == "fail" || obj.status == "error") { // Error checking if POST fails
							alert("Please try again"); // Alerts the user
						} else {

							var order_id = obj.data[0].id; // Sets the order_id 
							addOrderItemsToOrder(order_id); // Calls the addOrderItemsToOrder(order_id) method to add the order items to the order with the order_id returned by the API. 
							document.getElementById('order_id').value = order_id; //Sets the order_id hidden field. Used for testing.

						}

					});
				} else {
					alert("Not a valid Client ID") // If an invalid client ID is entered alerts the user to this.

				}
			}

			/**
			 * FR1.3 "Adding the currently displayed widget to the order items, including the amount and the agreed price."
			 * Adding order items to an object to be stored and added to an order when an order is placed using "place new order"
			 */
			this.addToItemList = function () { // adds the currently selected widget to the list

				var oucu = get_name_value('oucu', 'mag569');
				var password = get_name_value('pass', 'Ai7PSUV6');
				var widget_id = get_name_value('widget_id', '1');
				var number = get_name_value('number', '1');
				var price = get_name_value('pence_price', '10');
				//var number = document.getElementById('number');
				//var widget_id = document.getElementById('widget_id');
				//var price = document.getElementById('pence_price');

				orderItems.push({
					widget_id: widget_id,
					OUCU: oucu,
					password: password,
					number: number,
					pence_price: price,
				});

				var table = document.getElementById("order_table");

				var row = table.insertRow(0);
	
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);
				

				var indCost = price * number;

				cell1.innerHTML = number + " (widget " + widget_id + ")" + " x " + price/100 + "GBP =";
				cell2.innerHTML =" ";
				cell3.innerHTML = (indCost/100) + " GBP ";
				cell3.align = "right";
				arr.push(parseInt(price));
				setTotal(arr);
			};
           
		   	/**
			 * Sets the running totals for the selected order items
			 * FR1.4 "Displaying the sum of ordered items and adding VAT to the agreed price of each of the order items at 20%."
			 * @param arr
			 * @returns undefined
			 */
			function setTotal(arr) { //sets the totals and VAT and converts from pence to GBP
				var total = 0;
				var vat = 0.2;
				var grandTotal = 0;
				var discount = document.getElementById('discount').value;

				var table = document.getElementById("totals_table");

				for (var i = 0; i < arr.length; i++) {

					var newNum = arr[i] - discount;
					total += newNum;
					subVat = total * vat
						grandTotal = subVat + total;

				}

				var x = table.rows[0].cells;
				x[1].innerHTML = (total / 100) + " GBP";

				var y = table.rows[1].cells;
				y[1].innerHTML = (subVat / 100) + " GBP";

				var z = table.rows[2].cells;
				z[1].innerHTML = (grandTotal / 100) + " GBP";

			};

			this.placeneworder = function () { // this sets off the process of placing the order and showing the day's orders on the map
				var client_id = get_name_value('client_id', '1');
				getClientDetails(client_id); //sets latitude and longitude

			};
			 function setMarker(lat, lon) {
                var places;
                            places = new plugin.google.maps.LatLng(lat, lon);
                            map.addMarker({
                                'position': places,
                                'title': id
                            }, function (marker) {
                                marker.showInfoWindow();    // Note: when several markers displayed, click on marker to see title
                            });
                            // ;
							}
                        //});
            
			/**
             * Setting the initial map location on application load.			
			 * Updating the Map location when called by the getOrders() function 
			 * @returns {undefined}
			 */
			/** FR 2.1 Begins at the current location gained from the device geolocation */
			function updateMap(lat, lon) { 
			var onSuccess = function (position) {
				var div = document.getElementById("map_canvas");

                    div.width = window.innerWidth - 20;
                    div.height = window.innerHeight * 0.8 - 40;
				map = plugin.google.maps.Map.getMap(div);
				
				map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady, false);
				
				
				function onMapReady() { // onMapReady provided by Adam Daley on the software support forum.
					map.setVisible(false);
					//map = plugin.google.maps.Map.getMap(div);
					plugin.google.maps.Map.setDiv(div);
					
					var currentLocation = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					
					if (lat != undefined & lon != undefined) { //if there are values for lat and lon
					/** FR2.2 "When clicking on Place NEW Order, displaying the orders along the day’s journey with markers, where the location of client’s addresses are used to place the markers."
					The new value for currentLocation is the value from the getOrders() function which accesses the orders and selects the 
					orders with the current date to update the map markers.*/			
					currentLocation = new plugin.google.maps.LatLng(lat, lon); /**Sets the new location on the map using the google maps plugin */
															
						/**Adding markers based on the address results to mark the locations on the map. The id shown on the marker is the order id.*/
						map.addMarker({
							'position': new plugin.google.maps.LatLng(lat, lon),
							'title': id, //adds a caption with the order id no.
						}, function (marker) {
							marker.showInfoWindow();
						});
					
					}else {
						// This is the initial map marker using the phone's location.
						map.addMarker({
							'position': currentLocation,
							'title': "You are here!"
						}, function (marker) {
							marker.showInfoWindow();
						});
					map.setZoom(5); // It would be better to use the markers to set the bounds of the map, however there wasn't enough time to do this.
					map.setCenter(currentLocation); // This updates with the new location once it is set.
					map.refreshLayout();
					map.setVisible(true);
					}
				
						
				}
			};
			var onError = function (error) {
				alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
			};
			navigator.geolocation.getCurrentPosition(onSuccess, onError, {
				timeout: 10000,
				enableHighAccuracy: true //timeout added to manage failure, accuracy allows integration with expected settings
			});

		}
		
			/** 
			* This function can be used to reset the form fields ready for the next input
			*/
			function resetform() {
				document.getElementById("myform").reset();
			}
			
			/**
			 * Callback function for cancelling the orders with null latitude and longitude
				This was completed because Q1 of the EMA produced an error if there were orders with
				null latitude and longitude. For future use it could be used to delete orders for the purposes of cancellation.
			 */
				this.deleteorders = function () { // using to delete orders with null lat and lon but could be used in future for cancellations
				var oucu = get_name_value('oucu', 'mag569');
				var password = get_name_value('pass', 'Ai7PSUV6');
				
				$.get('http://137.108.93.222/openstack/api/orders?OUCU=mag569&password=Ai7PSUV6',
					function (data) {
					var obj = $.parseJSON(data);
					if (obj.status == "fail") {
						alert(obj.data[0].reason);
					} else {

						$.each(obj.data, function (index, value) {
							
							if (value.latitude == null || value.longitude == null) { // if null values are present
								// value.id is the order id of the order to delete
								var url = "http://137.108.93.222/openstack/api/orders/" + value.id + "?OUCU=" + oucu + "&password=" + password; // the url to access the API

								$.ajax({
									url: url,
									type: 'DELETE',
									success: function (result) {
										alert("Deleted: " + result);
									}
								});
							}
						});
					}
				});
			};
			document.addEventListener("deviceready", updateMap, false);
			//updateMap(); /**FR2.1 "Displaying a Google Map for the area around the current location of the salesperson." */

		}
		this.megaMaxSale = new MegaMaxSale(); 
	}

};
app.initialize();

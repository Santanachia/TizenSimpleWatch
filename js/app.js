
var	battery, AirlylastUpdate;
var ctxLayout, ctxContent,
	center, watchRadius,
	bgLColor, bgDColor, txtColor;
    
/**
 * Updates air pollution icon, status and text.
 * @private
 */
function updateAirPolution() {
	var now = new Date();
	
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
		    /**
		     * xmlHttp - XMLHttpRequest object for get information about air pollution
		     */
		    var xmlHttp = new XMLHttpRequest();
		
		    /**
		     * NearestSensorMeasurements {
				  address (Address, optional): Sensor's address,
				  airQualityIndex (number): Common Air Quality Index (CAQI). http://www.airqualitynow.eu/about_indices_definition.php,
				  distance (number, optional): Distance,
				  id (integer, optional): ID,
				  location (Coordinates, optional): Location,
				  measurementTime (string, optional): MeasurementTime,
				  name (string, optional): Name,
				  pm10 (number, optional): PM10,
				  pm25 (number, optional): PM2.5,
				  pollutionLevel (integer, optional): Pollution level based on CAQI value. Possible values: [0 to 6]. 0 - unknown, 1 - best air, 6 - worst.,
				  vendor (string, optional): Vendor
				}
				Address {
				  country (string, optional),
				  locality (string, optional),
				  route (string, optional),
				  streetNumber (string, optional)
				}
				Coordinates {
				  latitude (number): Latitude component of location.,
				  longitude (number): Longitude component of location.
				}
		     */
		    xmlHttp.open('GET', 'https://airapi.airly.eu/v1/nearestSensor/measurements?latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude + '&maxDistance=1000');
		    xmlHttp.setRequestHeader('apikey', 'wfxBXm5iQvmM5S3NaQ69PFDqfQ0Yfm91');
		    xmlHttp.onreadystatechange = function() {
		        // Checks responseXML isn't empty
		        if (xmlHttp.response) {
		        	var ARR_COLOR = ['black', '#0c0', '#6c0', '#ff0', '#f90', 'red', 'brown'],
				        airPollutionInform = JSON.parse(xmlHttp.responseText);
		            console.log(airPollutionInform);
		            document.querySelector("#air-leaf").style.fill = ARR_COLOR[airPollutionInform.pollutionLevel];
		            document.querySelector("#air-text").innerHTML = Math.round(airPollutionInform.airQualityIndex) + ' CAQI';
		            AirlylastUpdate = new Date();
		        }
		        else {
		        	console.error('connection error');
		        	console.log(xmlHttp);
		        }
		    };
		
		    xmlHttp.send();
        }, function(error){
        	console.log(error);
        }, {maximumAge: 60000});
    }
	else if(AirlylastUpdate.getTime() + 60*60*1000 < now.getTime()) {
		document.querySelector("#air-leaf").style.fill = 'black';
		document.querySelector("#air-text").innerHTML = 'N/A';
	}
			
}

/**
 * Updates battery icon and text.
 * @private
 */
function updateBattery() {
	
    document.querySelector('#battery-icon-e').style.display = 'none';
    document.querySelector('#battery-icon-0').style.display = 'none';
    document.querySelector('#battery-icon-1').style.display = 'none';
    document.querySelector('#battery-icon-2').style.display = 'none';
    document.querySelector('#battery-icon-3').style.display = 'none';
    document.querySelector('#battery-icon-4').style.display = 'none';
    document.querySelector('#battery-icon-c').style.display = 'none';
	
	if (battery.charging) {
	    document.querySelector('#battery-icon-c').style.display = 'block';
	    document.querySelector('#battery-text').innerHTML = LANG_JSON_DATA.charge;
	}
	else if (0 <= battery.level) {
	    var batteryLevel = Math.floor(battery.level * 100),
	        batteryGrade = Math.floor(batteryLevel / 20);
	    
	    if (5 === batteryGrade) {
	    	batteryGrade = 4;
	    }
	    
	    document.querySelector('#battery-icon-' + batteryGrade).style.display = 'block';
	    document.querySelector('#battery-text').innerHTML = batteryLevel + '%';
	}
	else {
		document.querySelector('#battery-icon-e').style.display = 'block';
	    document.querySelector('#battery-text').innerHTML = 'N/A';
	}
}

/**
 * Renders a circle with specific center, radius, and color
 * @private
 * @param {object} context - the context for the circle to be placed in
 * @param {number} radius - the radius of the circle
 * @param {string} color - the color of the circle
 */
function renderCircle(context, center, radius, color) {
    context.save();
    context.beginPath();
    context.fillStyle = color;
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
    context.restore();
}

/**
 * Renders a needle with specific center, angle, start point, end point, width and color
 * @private
 * @param {object} context - the context for the needle to be placed in
 * @param {number} angle - the angle of the needle (0 ~ 360)
 * @param {number} startPoint - the start point of the needle (-1.0 ~ 1.0)
 * @param {number} startPoint - the end point of the needle (-1.0 ~ 1.0)
 * @param {number} width - the width of the needle
 * @param {string} color - the color of the needle
 */
function renderNeedle(context, angle, startPoint, endPoint, width, color) {
    var radius = context.canvas.width / 2,
        centerX = context.canvas.width / 2,
        centerY = context.canvas.height / 2;

    context.save();
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.moveTo(centerX + radius * Math.cos(angle) * startPoint, centerY + radius * Math.sin(angle) * startPoint);
    context.lineTo(centerX + radius * Math.cos(angle) * endPoint, centerY + radius * Math.sin(angle) * endPoint);
    context.stroke();
    context.closePath();
    context.restore();
}

/**
 * Renders text at a specific center, radius, and color
 * @private
 * @param {object} context - the context for the text to be placed in
 * @param {string} text - the text to be placed
 * @param {number} x - the x-coordinate of the text
 * @param {number} y - the y-coordinate of the text
 * @param {number} wr - 
 */
function renderText(context, text, x, y, wr) {
    context.save();
    context.beginPath();
    context.font = "25px Courier";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = txtColor;
    context.fillText(text, x, y + wr);
    context.closePath();
    context.restore();
}

/**
 * Draws the basic layout of the watch
 * @private
 */
function drawWatchLayout() {
    var grd;

    // Clear canvas
    ctxLayout.clearRect(0, 0, ctxLayout.canvas.width, ctxLayout.canvas.height);

    // Draw the background circle
    renderCircle(ctxLayout, center, watchRadius, "#000000");
    grd = ctxLayout.createLinearGradient(0, 0, watchRadius * 2, 0);
    grd.addColorStop(0, "#000000");
    grd.addColorStop(0.5, bgDColor);
    grd.addColorStop(1, "#000000");
    ctxLayout.fillStyle = grd;
    renderCircle(ctxLayout, center, watchRadius * 0.945, grd);
    renderCircle(ctxLayout, center, watchRadius * 0.7, "#000000");

    // Draw the dividers
    // 60 unit divider
    for (var i = 1; i <= 60; i++) {
        renderNeedle(ctxLayout, (i - 15) * (Math.PI * 2) / 60, 0.95, 1.0, 1, bgLColor);
    }

    // 12 unit divider
    for (var j = 1; j <= 12; j++) {
        renderNeedle(ctxLayout, (j - 3) * (Math.PI * 2) / 12, 0.7, 0.945, 10, bgLColor);
    }
}

/**
 * Draws the content of the watch
 * @private
 */
function drawWatchContent() {
    var datetime = tizen.time.getCurrentDateTime(),
        hour = datetime.getHours(),
        minute = datetime.getMinutes(),
        second = datetime.getSeconds();

    // Clear canvas
    ctxContent.clearRect(0, 0, ctxContent.canvas.width, ctxContent.canvas.height);

    // Draw the hour needle
    renderNeedle(ctxContent, Math.PI * (((hour + minute / 60) / 6) - 0.5), 0, 0.50, 3, bgDColor);

    // Draw the minute needle
    renderNeedle(ctxContent, Math.PI * (((minute + second / 60) / 30) - 0.5), 0, 0.70, 3, bgDColor);

    // Draw the minute/hour circle
    renderCircle(ctxContent, center, 8, bgDColor);

    // Draw the second needle
    ctxContent.shadowOffsetX = 4;
    ctxContent.shadowOffsetY = 4;
    renderNeedle(ctxContent, Math.PI * ((second / 30) - 0.5), -0.10, 0.85, 1, bgLColor);

    // Draw the second circle
    ctxContent.shadowOffsetX = 0;
    ctxContent.shadowOffsetY = 0;
    renderCircle(ctxContent, center, 5, bgLColor);

    // Draw the center circle
    renderCircle(ctxContent, center, 2, bgDColor);

    // Draw the text for time
    renderText(ctxContent, (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute + ':' + (second < 10 ? '0' : '') + second, center.x, center.y - 25, watchRadius * 0.5);
    
    // Draw the text for date
    renderText(ctxContent, datetime.getFullYear() + '.' + ((datetime.getMonth() + 1 < 10 ? '0' : '') + (datetime.getMonth() + 1)) + '.' + datetime.getDate(), center.x, center.y, watchRadius * 0.5);
}

/**
 * Changes display attribute of two elements when occur click event
 * @private
 * @param {object} element1 - The first element id for changing display
 * @param {object} element2 - The second element id for changing display
 */
function toggleElement(element1, element2) {
    if (document.querySelector(element1).style.display === "none") {
        document.querySelector(element1).style.display = "block";
        document.querySelector(element2).style.display = "none";
    } else {
        document.querySelector(element1).style.display = "none";
        document.querySelector(element2).style.display = "block";
    }
}
    
(function() {

    /**
     * Set default variables
     * @private
     */
    function setDefaultVariables() {
    	var canvasLayout = document.querySelector("#canvas-layout"),
    		canvasContent = document.querySelector("#canvas-content");
    	
        ctxLayout = canvasLayout.getContext("2d");
        
        ctxContent = canvasContent.getContext("2d");

        // Set the canvases square
        canvasLayout.width = document.body.clientWidth;
        canvasLayout.height = canvasLayout.width;
        canvasContent.width = document.body.clientWidth;
        canvasContent.height = canvasContent.width;

        center = {
            x: document.body.clientWidth / 2,
            y: document.body.clientHeight / 2
        };

        watchRadius = canvasLayout.width / 2;

        battery = navigator.battery || navigator.battery || navigator.webkitBattery || navigator.mozBattery;
        
        bgLColor = '#c4c4c4';
        bgDColor = '#454545';
        txtColor = '#999';
    	
    	AirlylastUpdate = new Date(2018, 5, 18, 0, 0, 0, 0);
    }

    /**
     * Set default event listeners
     * @private
     */
    function setDefaultEvents() {
        
        // add eventListener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                drawWatchContent();
            }
        });

        // Adds event listeners to update battery state when the battery is changed.
        battery.addEventListener("chargingchange", updateBattery);
        battery.addEventListener("chargingtimechange", updateBattery);
        battery.addEventListener("dischargingtimechange", updateBattery);
        battery.addEventListener("levelchange", updateBattery);

        // Adds event listeners to change displaying child element when the battery element is clicked.
        document.querySelector("#body-battery").addEventListener("click", function() {
            toggleElement("#battery-icon", "#battery-text");
        });

        // Adds event listeners to change displaying child element when the air pollution element is clicked.
        document.querySelector("#body-air").addEventListener("click", function() {
            toggleElement("#air-icon", "#air-text");
        });
    }

    /**
     * Initiates the application
     * @private
     */
    function init() {
        setDefaultVariables();
        setDefaultEvents();

        // Draw the basic layout and the content of the watch at the beginning
        drawWatchLayout();
        drawWatchContent();
        updateAirPolution();
        updateBattery();

        // Update the content of the watch every second
        setInterval(function() {
            drawWatchContent();
        }, 1000);

        // Update air pollution info every minute
        setInterval(function() {
        	updateAirPolution();
        }, 1000*60);
    }

    window.onload = init;
}());

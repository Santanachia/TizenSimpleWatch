
(function() {
    var canvasLayout, canvasContent,
        ctxLayout, ctxContent,
        center, watchRadius,
        bgLColor, bgDColor, txtColor,
        ambient,
        ARR_COLOR = ["red", "orange", "yellow", "green", "blue", "blue"],
        URL_AIR_POLLUTION_DATA = "./data/airPollutionData.xml",
        battery;

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
            centerY = context.canvas.height / 2,
            dxi = radius * Math.cos(angle) * startPoint,
            dyi = radius * Math.sin(angle) * startPoint,
            dxf = radius * Math.cos(angle) * endPoint,
            dyf = radius * Math.sin(angle) * endPoint;

        context.save();
        context.beginPath();
        context.lineWidth = width;
        context.strokeStyle = color;
        context.moveTo(centerX + dxi, centerY + dyi);
        context.lineTo(centerX + dxf, centerY + dyf);
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
        var grd,
            angle,
            i,
            j;

        // Clear canvas
        ctxLayout.clearRect(0, 0, ctxLayout.canvas.width, ctxLayout.canvas.height);

        if (!ambient) {
	        // Draw the background circle
	        renderCircle(ctxLayout, center, watchRadius, "#000000");
	        grd = ctxLayout.createLinearGradient(0, 0, watchRadius * 2, 0);
	        grd.addColorStop(0, "#000000");
	        grd.addColorStop(0.5, bgDColor);
	        grd.addColorStop(1, "#000000");
	        ctxLayout.fillStyle = grd;
	        renderCircle(ctxLayout, center, watchRadius * 0.945, grd);
	        renderCircle(ctxLayout, center, watchRadius * 0.7, "#000000");
        }

        // Draw the dividers
        // 60 unit divider
        for (i = 1; i <= 60; i++) {
            angle = (i - 15) * (Math.PI * 2) / 60;
            renderNeedle(ctxLayout, angle, 0.95, 1.0, 1, bgLColor);
        }

        // 12 unit divider
        for (j = 1; j <= 12; j++) {
            angle = (j - 3) * (Math.PI * 2) / 12;
            renderNeedle(ctxLayout, angle, 0.7, 0.945, 10, bgLColor);
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
    
    /**
     * Updates air pollution icon, status and text.
     * @private
     */
    function updateAirPolution() {
        /**
         * xmlHttp - XMLHttpRequest object for get information about air pollution
         */
        var xmlHttp = new XMLHttpRequest(),
            airPollutionInform,
            elAirPollText = document.querySelector("#air-text"),
            airPollLevel,
            airPollGrade;

        xmlHttp.open("GET", URL_AIR_POLLUTION_DATA, false);
        xmlHttp.onreadystatechange = function() {
            // Checks responseXML isn't empty
            if (xmlHttp.responseXML) {
                airPollutionInform = xmlHttp.responseXML;
                // Gets air pollution level from pm10value node in responseXML
                airPollLevel = airPollutionInform.getElementsByTagName("pm10Value")[0].childNodes[0].nodeValue;
                elAirPollText.innerHTML = airPollLevel;

                if (airPollLevel === "-") {
                    airPollGrade = 4;
                } else {
                    elAirPollText.innerHTML += "AQI";
                    if (airPollLevel < 50) {
                        airPollGrade = 4;
                    } else if (airPollLevel < 150) {
                        airPollGrade = 3;
                    } else if (airPollLevel < 200) {
                        airPollGrade = 2;
                    } else if (airPollLevel < 300) {
                        airPollGrade = 1;
                    } else {
                        airPollGrade = 0;
                    }
                }

                document.querySelector("#air-leaf").style.fill = ARR_COLOR[airPollGrade];
            }
            else {}
        };

        xmlHttp.send();
    }

    /**
     * Updates battery icon and text.
     * @private
     */
    function updateBattery() {
        var elBatteryIcon = document.querySelector("#battery-icon"),
            elBatteryText = document.querySelector("#battery-text"),
            batteryLevel = Math.floor(battery.level * 100),
            batteryGrade = Math.floor(batteryLevel / 20),
            statusColor = ARR_COLOR[batteryGrade];

        elBatteryIcon.style.backgroundImage = "url('./image/color_status/battery_icon_" + statusColor + ".png')";
        elBatteryText.innerHTML = batteryLevel + "%";
    }

    /**
     * Set default variables
     * @private
     */
    function setDefaultVariables() {
        canvasLayout = document.querySelector("#canvas-layout");
        ctxLayout = canvasLayout.getContext("2d");
        canvasContent = document.querySelector("#canvas-content");
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
        
        ambient = false;
    }

    /**
     * Set default event listeners
     * @private
     */
    function setDefaultEvents() {
        /**
         * elBattery - Element contains battery icon, status and text
         * elAir - Element contains air pollution icon, status and text
         */
        var elBattery = document.querySelector("#body-battery"),
            elAir = document.querySelector("#body-air");
        
        // add eventListener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                drawWatchContent();
            }
        });
        
        document.addEventListener('ambientmodechanged', function(ev) {
        	ambient = ev.detail.ambientMode;
        });

        // Adds event listeners to update battery state when the battery is changed.
        battery.addEventListener("chargingchange", updateBattery);
        battery.addEventListener("chargingtimechange", updateBattery);
        battery.addEventListener("dischargingtimechange", updateBattery);
        battery.addEventListener("levelchange", updateBattery);

        // Adds event listeners to change displaying child element when the battery element is clicked.
        elBattery.addEventListener("click", function() {
            toggleElement("#battery-icon", "#battery-text");
        });

        // Adds event listeners to change displaying child element when the air pollution element is clicked.
        elAir.addEventListener("click", function() {
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
//        updateAirPolution();
        updateBattery();

        // Update the content of the watch every second
        setInterval(function() {
            drawWatchContent();
        }, 1000);

        // Update air pollution info every minute
//        setInterval(function() {
//        	updateAirPolution();
//        }, 1000*60);
    }

    window.onload = init;
}());

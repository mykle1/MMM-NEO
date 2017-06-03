/* Magic Mirror
 * Module: MMM-NEO
 *
 * By Mykle1
 *
 */
Module.register("MMM-NEO", {

    // Module config defaults.
    defaults: {        
		rotateInterval: 5 * 60 * 1000, // New Image Appears
		useHeader: false,
        header: "Near Earth Objects Today",
		maxWidth: "225px",             // adjust to your liking 
		animationSpeed: 3000,          // Image fades in and out
        initialLoadDelay: 2250,
        retryDelay: 2500,
		updateInterval: 60 * 60 * 1000, // NEO limitation = 50 calls per day. Do NOT change!
		
    },

    getStyles: function() {
        return ["MMM-NEO.css"];
    },
    
    getScripts: function () {
		return ["moment.js"];
	},

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = "https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=DEMO_KEY";       
	    this.neo = {};
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "This is gonna be close...";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }
		
		
		var neoKeys = Object.keys(this.neo);
        if (neoKeys.length > 0) {
            if (this.activeItem >= neoKeys.length) {
                this.activeItem = 0;
            }
            var neo = this.neo[neoKeys[this.activeItem]];
	
// console.log(this.neo);  
  
            var top = document.createElement("div");
            top.classList.add("list-row");
			
        //  Name of Near Earth Object   
            var name = document.createElement("div");
           
			name.classList.add("small", "bright");
			name.innerHTML = "NASA NEO ID: &nbsp" + neo.name;
			wrapper.appendChild(name);
		
			
			// Potentially Hazardous
			var neoDanger = document.createElement("div");
			neoDanger.classList.add("xsmall", "bright");
			neoDanger.innerHTML = "Potentially Hazardous: &nbsp" + neo.is_potentially_hazardous_asteroid;
			wrapper.appendChild(neoDanger);
			
			
			// Estimated Diameter
			var neoDiameter = document.createElement("div");
			neoDiameter.classList.add("xsmall", "bright");
			neoDiameter.innerHTML = "Estimated Diameter: &nbsp" + neo.estimated_diameter.meters.estimated_diameter_max + '&nbsp' + "meters";
			wrapper.appendChild(neoDiameter);
			
			
			// relative_velocity
			var neoVelocity = document.createElement("div");
			neoVelocity.classList.add("xsmall", "bright");
			neoVelocity.innerHTML = "Relative Velocity: &nbsp" + neo.close_approach_data[0].relative_velocity.miles_per_hour + '&nbsp' + "mph";
			wrapper.appendChild(neoVelocity);
			
			
			// Close Approach Date
			var neoApproach = document.createElement("div");
			neoApproach.classList.add("xsmall", "bright");
			neoApproach.innerHTML = "Close Approach Date: &nbsp" + neo.close_approach_data[0].close_approach_date;
			wrapper.appendChild(neoApproach);
			
			
			
			// Miss Distance
			var neoMiss = document.createElement("div");
			neoMiss.classList.add("xsmall", "bright");
			neoMiss.innerHTML = "Missed Earth by &nbsp" + neo.close_approach_data[0].miss_distance.miles + '&nbsp' + "miles";
			//wrapper.appendChild(neoMiss);
		
					
			
        }
		wrapper.appendChild(neoMiss);
        return wrapper;
    },

    processNEO: function(data) {
        var date = moment(new Date()).format("YYYY-MM-DD");
		this.today = data.Today;
        this.neo = data[date];
        this.loaded = true;
    },
    
    

    scheduleCarousel: function() {
        console.log("Near Earth Objects");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getNEO();
        }, this.config.updateInterval);
        this.getNEO(this.config.initialLoadDelay);
        var self = this;
    },

    getNEO: function() {
        this.sendSocketNotification('GET_NEO', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEO_RESULT") {
            this.processNEO(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});

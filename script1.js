function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError);
    } else {
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    document.getElementById("location").innerHTML = `Latitude: ${latitude}, Longitude: ${longitude}`;
    updateMap(latitude, longitude);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

let map;
let marker;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: { lat: 0, lng: 0 },  // Default center
    });
    marker = new google.maps.Marker({
        position: { lat: 0, lng: 0 },
        map: map,
        title: "Your Location",
    });
}

function updateMap(lat, lng) {
    let newPos = { lat, lng };
    map.setCenter(newPos);
    marker.setPosition(newPos);
}
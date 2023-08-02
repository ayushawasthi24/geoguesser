let map;
let marker;

function initMap() {
  const locationInput = document.getElementById("locationInput");
  const autocomplete = new google.maps.places.Autocomplete(locationInput);

  const defaultLocation = { lat: 40.7128, lng: -74.006 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 8,
  });
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      alert("No location data available for this place.");
      return;
    }

    if (marker) {
      marker.setMap(null);
    }

    marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
    });

    map.setCenter(place.geometry.location);
  });
}
const actualLocation = {
  lat: 22.52861447947698,
  lng: 75.92348630892366,
};
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function openLocationPicker() {
  const locationPickerDiv = document.getElementById("locationPicker");
  locationPickerDiv.style.display = "block";
  map = L.map("map").setView([22.52675360093836, 75.92588544673066], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  marker = L.marker([0, 0]).addTo(map);
  map.on("click", (event) => {
    const locationInput = document.getElementById("guessInput");
    locationInput.value = event.latlng.lat + ", " + event.latlng.lng;

    marker.setLatLng(event.latlng);
    locationPickerDiv.style.display = "none";
  });
}

function submitLocation() {
  const locationInput = document.getElementById("guessInput");
  lat = parseFloat(locationInput.value.split(",")[0].trim());
  lng = parseFloat(locationInput.value.split(",")[1].trim());
  const distanceInKm = calculateDistance(
    actualLocation.lat,
    actualLocation.lng,
    lat,
    lng
  );
  const maxScore = 100;
  const minDistance = 0;
  const maxDistance = 0.15; 
  const score = Math.max(
    maxScore -
      (distanceInKm - minDistance) *
        ((maxScore - 1) / (maxDistance - minDistance)),
    0
  );
  console.log(score);
  fetch("/update-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ score: score }),
  })
    .catch((error) => {
      console.error("Error updating score:", error);
    });
}



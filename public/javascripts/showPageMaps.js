maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS,
  center: campground.geometry.coordinates,
  zoom: 6,
});

new maptilersdk.Marker({ color: '#EEACC7' })
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 35 }).setHTML(
      `<h4>${campground.title}</h4><p>${campground.location}</p>`
    )
  )
  .addTo(map);

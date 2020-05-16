import React from 'react';

export default function Home() {
	return (
		<div>
			<h2>Administration af GeoJSON brugere</h2>
			<p>Alt data hente via graphQL endpoint</p>
      <br />
      <h3>Users menu</h3>
			<p>Se, opret og slet brugere</p>
      <br />
      <h3>Geo menu</h3>
			<p>Geo-menu indeholder kun spil område som en masse lokationer. På sigt skal den kunne vise kort.</p>
			<p>Til gengæld henter den geo-data som [lon, lat] arrays, uden key-values.</p>
			<p>Den vil hurtigt kunne omskrives til at sende en hel geometri der kan bruges i en geojson app</p>
		</div>
	);
}

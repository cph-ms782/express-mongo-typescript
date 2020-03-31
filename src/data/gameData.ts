export const gameArea: any = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[12.53591537475586, 55.78863940650064],
						[12.518405914306639, 55.767689769836],
						[12.555656433105469, 55.75523050030093],
						[12.581405639648438, 55.76402001102562],
						[12.589130401611328, 55.781689623414294],
						[12.580375671386719, 55.79529845202839],
						[12.53591537475586, 55.78863940650064]
					]
				]
			}
		}
	]
};

export const players: any[] = [
	{
		"type": "Feature",
		"properties": { "name": "Peter" },
		"geometry": {
			"type": "Point",
			"coordinates": [
				12.5695454,
				55.7721959
			]
		}
	},
	{
		"type": "Feature",
		"properties": { "name": "Hans" },
		"geometry": {
			"type": "Point",
			"coordinates": [
				12.568630,
				55.776643
			]
		}
	},
	{
		"type": "Feature",
		"properties": { "name": "Petine" },
		"geometry": {
			"type": "Point",
			"coordinates": [
				12.564826,
				55.776258
			]
		}
	},
	{
		"type": "Feature",
		"properties": { "name": "Jensine" },
		"geometry": {
			"type": "Point",
			"coordinates": [
				12.562328,
				55.777029
			]
		}
	},
]


// export default {
// 	gameArea, players
// };

export const gameArea: any = {
  "type": "Polygon",
  "coordinates": [
    [
      [
        12.52767562866211,
        55.94295165154052
      ],
      [
        12.478923797607422,
        55.938817691492545
      ],
      [
        12.48441696166992,
        55.86481257456698
      ],
      [
        12.520294189453125,
        55.85411876805832
      ],
      [
        12.556171417236328,
        55.8677022872916
      ],
      [
        12.550678253173826,
        55.885806259101386
      ],
      [
        12.540550231933594,
        55.890619724209465
      ],
      [
        12.519092559814453,
        55.91948797953956
      ],
      [
        12.521324157714842,
        55.927278724880985
      ],
      [
        12.527503967285156,
        55.92824043669412
      ],
      [
        12.523040771484375,
        55.93208704528063
      ],
      [
        12.528362274169922,
        55.93526020990205
      ],
      [
        12.531795501708984,
        55.94016368041468
      ],
      [
        12.52767562866211,
        55.94295165154052
      ]
    ]
  ]
}

export const players: any[] = [
  {
    "type": "Feature",
    "properties": {
      "name": "Team1-inside"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        12.567672729492188,
        55.78670903555303
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "name": "Team2-inside"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        12.561578750610352,
        55.779758908094266
      ]
    }
  },
  {
    "type": "Feature",
    "properties": { "name": "Team3-outside" },
    "geometry": {
      "type": "Point",
      "coordinates": [
        12.551965713500977,
        55.788349856956444
      ]
    }
  },
  {
    "type": "Feature",
    "properties": { "name": "Team4-outside" },
    "geometry": {
      "type": "Point",
      "coordinates": [
        12.568788528442383,
        55.77396618813479
      ]
    }
  }
]

// module.exports = {gameArea,players}
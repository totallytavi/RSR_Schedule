# Routes
This branch is a list of routes that have been timed and checked against the most recent version of Ro Scale Railway to ensure that the routes are accurate. If you wish to add your own routes, please fork this repository and add your changes. Please also provide proof of timing the route if that is possible. This can be done using a video or screenshots (Showing each stop and your computer's time, the Roblox chat, and the player list).

## Custom Route
If you want to make your own route or edit the existing ones, you should create a JSON file that contains objects with two properties (Which have Arrays inside them). The first property is `stations` which holds all the stations your route calls at. The second is `times` which contains the amount of milliseconds in between stations from the first station. This should increase. An example template has been provided below.
```json
{
  "ROUTE_NAME": {
    "stations": [
      "Station1",
      "Station2",
      "Station3"
    ],
    "times": [
      0,
      120000,
      240000
    ]
  }
}
```
This route contains 3 stations. Station1, Station2, and Station3. The route will start at 0 with Station1. After 2 minutes, you call at Station2. After 4 minutes, you call at Station3. A helpful formula has been provided for calculating the times: `time = (1000 * 60) * minutes`.
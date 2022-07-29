# RSR_Schedule
A simple fan-made website for a SCR-like timetable.

**Table of Contents**
1. [Custom Routes](#custom-routes)
2. [Credits](#credits)

## Custom Routes ##
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

## Credits ##
This project was made possible by the following people:
- [Tavi](https://github.com/Coder-Tavi) - Developer

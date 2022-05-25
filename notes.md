## 📒 Notes for research and development

**Tutorials & Resources**
* Using web workers for timers: [here](https://hackwild.com/article/web-worker-timers/)
* Using web workers with React: [here](https://github.com/facebook/create-react-app/issues/1277)
* Ben Awad React hooks tutorials: [here](https://www.youtube.com/playlist?list=PLN3n1USn4xlmyw3ebYuZmGp60mcENitdM)
* Minutes and seconds from ms in JS: [here](https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript)
* Clearinterval in worker (React): [here](https://stackoverflow.com/questions/66715904/clearinterval-in-web-worker-not-stopping-timer)
* Package that changes setInterval to use workers by default (backup option): [here](https://github.com/chrisguttandin/worker-timers)
* Emoji Favicons: [here](https://favicon.io/emoji-favicons/)
* Dynamic Favicons: [here](https://reactgo.com/react-change-favicon-dynamically/)

**Ideas**
* Have settings menu in a popup modal
* If timer running display current time remaining in the `document.title` property
* Use sliders (or just text fields / plus minus buttons) in settings menu to adjust times
* Use sliders for volume of sounds & checkboxes for enabling / disabling sounds
* Learn how to use localstorage to store user preferences, (and / or google firebase auth for storing prefs. and stats (time worked etc.))
* Todo functionality (clicking on todos to remove (adding animations on hover etc.))
* Light and dark theme switcher
* Ability to set custom backgrounds with different levels of opacity

**New approach to timer worker**

- In main timer code 
  - tick function that calculates the time and decrements when a message from the worker is received
  - postMessage sends a string that contains the key word(start / stop), followed by seconds to count 
- In worker code
  - if message received is start then setInterval
  - if message recieved is stop then clearInterval


### Structure

Shared context, makes use of a reducer to update timer values using a worker thread

Example state structure:
* workTime: `int` stores the time in minutes for the work session 
* breakTime: `int` stores the time in minutes for the break session
* sessionStart: stores a timestamp using `new Date().getTime()`
* sessionEnd: stores a timestamp which is the `sessionStart + work/break time`
* currentTime: stores the current progress of the timer in seconds
* running: `boolean` timer is running or not
* endSound: `boolean` if the end sound should be played or not
* endVolume: `float (0 -> 1)` stores the volume of the bell sound
* clickSound: `boolean` if the click sound should be played or not when pressing buttons
* clickVolume: `float (0 -> 1)` stores the volume of the click sound 
 
### TODO
- [  ] - finish ben awad series on react hooks
- [  ] - setup state and context 
- [  ] - web worker testing, making sure it runs properly 
- [  ] - setup different modes and the ability to change between them

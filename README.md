<h1 align="center"> 🍅⚛ React JS Pomodoro Timer</h1>

![](https://img.shields.io/badge/cloudflare-deployed-orange)

> 🎉 Version 1.0 Release - [pomodoro.finnlestrange.tech](https://pomodoro.finnlestrange.tech)

## 📒 Project Info

> This React app was created initially as a side project to help me learn more about `react.js` and web technologies like `workers` and `localstorage`. It has now turned into my main project and will continually be developed to support more features and interactions.

## 🗺 Road Map

### ❌ Version `2.0`

- Support for `Google Authentication` to track statistics such as focus time, and total time focused in a given period (i.e. week, month, year etc.)
- Stats menu (modal like the settings) to display firebase stats
- To-Do List support, with sync to `Google Firebase`
- User settings storage with Firebase to sync across devices
- Options to change the sound for the bell chime (either pre-set or custom upload)

### ❌ Version `1.5`

- Major Refactor
  - Separate out settings component from main timer code
  - State management (either `recoil.js` or `React Context`) to help clean up the code
  - Commenting out and cleaning up main time code

### ✅ Version `1.0`

- Basic Timer functionality with multiple modes for breaks and focus
- Web worker to allow the timer to run in the background and keep an accurate clock
- Ability to change duration for each of the timer modes (focus, short break & long break)
- Changing Favicons for different modes (useful for pinned tabs to indicate which mode the timer is currently in)
- Sounds for button presses and a bell chime with customizable volume levels for when the timer ends
- Consistent modern UI - `React MUI`
- Consistent color scheme - `Inspo from Notion's new dark theme`

## 💡 Credits

Some of the projects major insirations are:

- [pomofocus.io](https://pomofocus.io) - used to be my main Pomodoro timer, however I was not a fan of the color scheme, or UI. I do really like the different modes for the timer, the dynamically changing page title, and also how it makes use of a web worker, as when researching for this project, I could never really find a good implementation that worked in the background, allowing you to be on other browser tabs and still keep accurate time.
- [notion.so](https://notion.so) - my absolute favorite productivity app, and it was where I got the inspo for the color scheme, i.e. the button colors, and the timer color.

## 📚 License

> This project is licensed under the [MIT license](https://github.com/71xn/pomodoro/blob/main/LICENSE)

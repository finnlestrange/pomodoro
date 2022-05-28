import React, {useEffect, useState} from "react";

// UI Imports -> https://mui.com/material-ui/
import {
    Button,
    Stack,
    ThemeProvider,
    Modal,
    Box,
    Slider,
    Grid,
    Input,
    Typography,
    FormControlLabel, Checkbox
} from "@mui/material";

import {theme, modalStyle, red, grey} from "../styles/muiStyle";

// Icon finder -> https://mui.com/material-ui/material-icons/
import {
    Coffee,
    CoffeeMaker,
    NotificationsActive,
    Settings,
    SurroundSound,
    Timelapse, VolumeUp
} from "@mui/icons-material";


// For changing favicons
import coffeeIcon from "../icons/coffee.ico";
import booksIcon from "../icons/books.ico";
import tomatoIcon from "../icons/tomato.ico";


import {CircularProgressbar} from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import '../styles/Timer.css';

// Sound Imports
import bellSound from "../audio/bell.mp3";
import clickSound from "../audio/button-press.mp3";

// Worker Imports
import workerScript from "../worker/timer.worker";

const timerWorker = new Worker(workerScript);


// Main Timer code
const Timer = () => {

    // State & Helper Functions //
    const [mode, setMode] = useState("focus"); // focus, shortBreak or longBreak
    const [count, setCount] = useState(0); // used to determine the next mode based on the current number of completed pomodoro
    const [totalSessions, setTotalSessions] = useState(1); // number of current pomodoro session

    const defaultTimes = [25, 5, 15]; // Used to reset to default settings

    // Stores the times for each of the modes
    const [focusTime, setFocusTime] = useState(
        localStorage.getItem("focusTime") === null ? 25 : parseInt(localStorage.getItem("focusTime"))
    );
    const [shortBreakTime, setShortBreakTime] = useState(
        localStorage.getItem("shortBreakTime") === null ? 5 : parseInt(localStorage.getItem("shortBreakTime"))
    );
    const [longBreakTime, setLongBreakTime] = useState(
        localStorage.getItem("longBreakTime") === null ? 15 : parseInt(localStorage.getItem("longBreakTime"))
    );

    const [running, setRunning] = useState(false); // boolean -> if the timer is running or not

    // State for settings menu
    const [showSettings, setShowSettings] = useState(false); // boolean -> whether the settings modal is displayed
    const [focusTimeSettings, setFocusTimeSettings] = useState(focusTime); // value of the slider in the settings menu
    const [shortTimeSettings, setShortTimeSettings] = useState(shortBreakTime); // value of the slider in the settings menu
    const [longTimeSettings, setLongTimeSettings] = useState(longBreakTime); // value of the slider in the settings menu


    // Mode Helper Function(s) //
    // returns the time (in minutes) based on what mode the timer is in
    const modeTime = (mode) => {
        if (mode === "focus") {
            return focusTime;
        }
        if (mode === "shortBreak") {
            return shortBreakTime;
        }
        if (mode === "longBreak") {
            return longBreakTime
        } else {
            return 0;
        }
    }

    // Calculates the timers next mode, based on how many focus sessions have been completed and what mode the timer was in before
    const nextMode = () => {
        if (mode === "focus" && count < 3) {
            setCount(prevState => prevState + 1);
            return "shortBreak";
        }
        if (mode === "focus" && count >= 3) {
            setCount(0);
            return "longBreak";
        }
        if (mode === "shortBreak" || mode === "longBreak") {
            setTotalSessions(prevState => prevState + 1);
            return "focus";
        }
    }

    // Returns string of current mode, used for JSX elements
    const modeString = () => {
        if (mode === "focus") return "Focus";
        if (mode === "shortBreak") return "Break";
        if (mode === "longBreak") return "Break";
    }


    // Time State & Conversion Functions //
    const [timeLeft, setTimeLeft] = useState(modeTime(mode) * 60 * 1000); // 25 minutes in ms, default
    const [progress, setProgress] = useState(1);

    const [minutes, setMinutes] = useState(modeTime(mode));
    const [seconds, setSeconds] = useState(0);

    // These are used to format the minutes & seconds state to add 0's padding
    const min = minutes <= 9 ? `0${minutes.toFixed(0)}` : minutes.toFixed(0);
    const sec = seconds <= 9 ? `0${seconds.toFixed(0)}` : seconds.toFixed(0);

    // Convert minutes into millis
    const minutesToMs = (m) => {
        return m * 60000;
    }

    // Returns the minutes part of a millis value
    const getMinutes = (millis) => {
        return Math.floor(millis / 60000);
    }

    // Returns the seconds part of a millis value
    const getSeconds = (millis) => {
        return ((millis % 60000) / 1000);
    }

    // Sound Functions //
    const [bell, setBell] = useState(
        localStorage.getItem("bell") === null ? true : localStorage.getItem("bell") === true
    );
    const [click, setClick] = useState(
        localStorage.getItem("click") === null ? true : localStorage.getItem("click") === true
    );
    const [bellVolume, setBellVolume] = useState(
        localStorage.getItem("bellVolume") === null ? 0.2 : parseInt(localStorage.getItem("bellVolume"))
    );
    const [clickVolume, setClickVolume] = useState(
        localStorage.getItem("clickVolume") === null ? 0.3 : parseInt(localStorage.getItem("clickVolume"))
    );


    // Plays the bell sound
    const playBell = () => {
        if (bell) {
            const bellAudio = new Audio(bellSound);
            bellAudio.volume = bellVolume;
            bellAudio.play().then();
        }
    };

    // Plays the click sound
    const playClick = () => {
        if (click) {
            const clickAudio = new Audio(clickSound);
            clickAudio.volume = clickVolume;
            clickAudio.play().then();
        }
    }


    // Web Worker Functions //
    timerWorker.onmessage = (e) => {
        let newTime = parseInt(e.data.split(":")[1]);

        // If the timer has ended
        if (newTime < 0) {
            // Avoids negative values if rounding
            setTimeLeft(0); // make sure value is round 0 for minutes and seconds
            setMinutes(0);
            setSeconds(0);

            document.title = modeString(mode) + " Done - " + (mode === "focus" ? "Break Time" : "Time to focus");

            stopTimer();
            playBell();

            // Calculate next mode
            let next = nextMode()
            setMode(next);
            setProgress(1);

            resetTimer(next);

            // If the timer still has time left
        } else {
            setProgress(newTime / minutesToMs(modeTime(mode)));
            let m = getMinutes(newTime);
            let s = getSeconds(newTime);
            setMinutes(m);
            setSeconds(s);
            m = m <= 9 ? `0${m.toFixed(0)}` : m.toFixed(0);
            s = s <= 9 ? `0${s.toFixed(0)}` : s.toFixed(0);
            setTimeLeft(newTime);
            document.title = "[" + modeString(mode) + "] " + m + ":" + s;
        }
    };


    // Timer Control Functions //
    const startTimer = () => {
        if (mode === "focus") {
            document.getElementById("favicon").href = booksIcon;
        } else {
            document.getElementById("favicon").href = coffeeIcon;
        }
        setRunning(true);

        if (timeLeft <= 0) {
            // If timer has finished and start is pressed, will do another timer of the current mode
            const endTime = new Date().getTime() + (minutesToMs(modeTime(mode)));
            const message = "start:" + endTime;

            timerWorker.postMessage(message);
        } else {
            // Reset each time the timer is started and based off of how long there is left on the timer
            const endTime = new Date().getTime() + (timeLeft);
            const message = "start:" + endTime;

            timerWorker.postMessage(message);
        }

    }

    // Pauses the setInterval function in the web worker
    const stopTimer = () => {
        document.title="Paused";
        document.getElementById("favicon").href = tomatoIcon;
        setRunning(false);
        timerWorker.postMessage("stop");
    }

    // Resets the timer to the default values for the current mode -> "m"
    const resetTimer = (m) => {
        stopTimer();
        setMode(m);
        setProgress(1);
        setTimeLeft(minutesToMs(modeTime(m)));
        setMinutes(modeTime(m));
        setSeconds(0);
        document.title="Timer Reset";
    }


    // Changes the mode to the mode -> "m"
    const changeMode = (m) => {
        resetTimer(m);
        setMode(m);
        setTimeLeft(minutesToMs(modeTime(m)));
        setMinutes(modeTime(m));
        setSeconds(0);
        document.title = "Pomodoro";
    }

    // Settings Menu Functions //

    // Updates all settings values, based on if they have been changed or not
    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        setFocusTime(focusTimeSettings);
        if (mode === "focus") {
            setMinutes(focusTimeSettings);
            setTimeLeft(minutesToMs(focusTimeSettings));
        }
        setShortBreakTime(shortTimeSettings);
        if (mode === "shortBreak") {
            setMinutes(shortTimeSettings);
            setTimeLeft(minutesToMs(shortTimeSettings));
        }
        setLongBreakTime(longTimeSettings);
        if (mode === "longBreak") {
            setMinutes(longTimeSettings);
            setTimeLeft(minutesToMs(longTimeSettings));
        }

        // Set values in local Storage
        localStorage.setItem("focusTime", focusTimeSettings.toString());
        localStorage.setItem("shortBreakTime", shortTimeSettings.toString());
        localStorage.setItem("longBreakTime", longTimeSettings.toString());

        setSeconds(0);
        setShowSettings(false);
    }


    // Resets all settings to the default values
    const handleReset = () => {

        // Clear Local Storage
        localStorage.clear();

        // Set main state
        setFocusTime(defaultTimes[0]);
        setShortBreakTime(defaultTimes[1]);
        setLongBreakTime(defaultTimes[2]);

        // Set settings state
        setFocusTimeSettings(defaultTimes[0]);
        setShortTimeSettings(defaultTimes[1]);
        setLongTimeSettings(defaultTimes[2]);

        // Set sounds
        setBell(true);
        setClick(true);
        setBellVolume(0.2);
        setClickVolume(0.3);


        if (mode === "focus") {
            setMinutes(defaultTimes[0]);
            setTimeLeft(minutesToMs(defaultTimes[0]));
        }
        if (mode === "shortBreak") {
            setMinutes(defaultTimes[1]);
            setTimeLeft(minutesToMs(defaultTimes[1]));
        }
        if (mode === "longBreak") {
            setMinutes(defaultTimes[2]);
            setTimeLeft(minutesToMs(defaultTimes[2]));
        }

        setSeconds(0);
        setShowSettings(false);
    }


    return (
        <>
            <ThemeProvider theme={theme}>
                <div className={"timerContainer"}>
                    <Stack justifyContent={"center"} spacing={2} direction={"row"}>
                        <Button color={"primary"} variant={mode === "focus" ? "contained" : "outlined"} onClick={() => {
                            changeMode("focus");
                            playClick()
                        }}>Focus
                            Mode</Button>
                        <Button color={"primary"} variant={mode === "shortBreak" ? "contained" : "outlined"}
                                onClick={() => {
                                    changeMode("shortBreak");
                                    playClick()
                                }}>Short Break</Button>
                        <Button color={"primary"} variant={mode === "longBreak" ? "contained" : "outlined"}
                                onClick={() => {
                                    changeMode("longBreak");
                                    playClick()
                                }}>Long Break</Button>
                    </Stack>

                    <div style={{
                        height: "20%",
                        paddingTop: "30px",
                        paddingLeft: "30px",
                        paddingRight: "30px",
                        paddingBottom: "15px"
                    }}>
                        <CircularProgressbar styles={{
                            text: {fill: "white", fontSize: "20px", fontFamily: "monospace"},
                            path: {stroke: (progress < 0.15 ? red : grey), strokeLinecap: "butt"}
                        }} value={progress} maxValue={1} text={min + ":" + sec}/>
                    </div>

                    <p style={{fontSize: "17px", fontFamily: "monospace", paddingBottom: "10px"}}>Focus Session
                        #{totalSessions}</p>

                    <Stack justifyContent={"center"} spacing={1} direction={"row"}>
                        {running ?
                            <Button color={"error"} variant={"contained"} onClick={() => {
                                stopTimer();
                                playClick()
                            }}>Stop Timer</Button>
                            :
                            <Button color={"success"} variant={"contained"} onClick={() => {
                                startTimer();
                                playClick()
                            }}>Start Timer</Button>
                        }
                        <Button color={"error"} variant={"outlined"} onClick={() => {
                            resetTimer(mode);
                            playClick()
                        }}>Reset Timer</Button>
                    </Stack>
                    <Stack justifyContent={"center"} paddingTop={"20px"} spacing={1} direction={"row"}>
                        <Button disabled={running} variant={"outlined"}
                                onClick={() => {
                                    setShowSettings(true);
                                    playClick()
                                }} startIcon={<Settings/>}>Settings</Button>
                    </Stack>
                </div>


                {/* Code for the pop-up settings menu */}
                <Modal open={showSettings} onClose={() => {
                    setShowSettings(false);
                    setFocusTimeSettings(focusTime);
                    setShortTimeSettings(shortBreakTime);
                    setLongTimeSettings(longBreakTime);
                }}>
                    <Box sx={modalStyle}>
                        <form onSubmit={handleSettingsSubmit}>
                            <Box sx={{width: "250"}}>
                                <h2>Time Settings</h2>
                                {/* Focus Time Set */}
                                <Typography gutterBottom>
                                    Focus Time
                                </Typography>
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item>
                                        <Timelapse/>
                                    </Grid>
                                    <Grid item xs>
                                        <Slider max={60} min={2} valueLabelFormat={(x) => x + " minutes"}
                                                value={focusTimeSettings} valueLabelDisplay={"auto"}
                                                aria-label={"Default"}
                                                onChange={(e) => setFocusTimeSettings(e.target.value)}/>
                                    </Grid>
                                    <Grid item>
                                        <Input style={{color: "white"}}
                                               inputProps={{step: 1, min: 2, max: 60, type: 'number'}}
                                               value={focusTimeSettings} size={"small"}
                                               onChange={(e) => setFocusTimeSettings(parseInt(e.target.value))}/>
                                    </Grid>
                                </Grid>
                                <br/>

                                {/* Short Break Time Set */}
                                <Typography gutterBottom>
                                    Short Break Time
                                </Typography>
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item>
                                        <Coffee/>
                                    </Grid>
                                    <Grid item xs>
                                        <Slider min={1} max={15} valueLabelFormat={(x) => x + " minutes"}
                                                value={shortTimeSettings} valueLabelDisplay={"auto"}
                                                aria-label={"Default"}
                                                onChange={(e) => setShortTimeSettings(e.target.value)}/>
                                    </Grid>
                                    <Grid item>
                                        <Input style={{color: "white"}}
                                               inputProps={{step: 1, min: 1, max: 60, type: 'number'}}
                                               value={shortTimeSettings} size={"small"}
                                               onChange={(e) => setShortTimeSettings(parseInt(e.target.value))}/>
                                    </Grid>
                                </Grid>
                                <br/>

                                {/* Long Break Time Set */}
                                <Typography gutterBottom>
                                    Long Break Time
                                </Typography>
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item>
                                        <CoffeeMaker/>
                                    </Grid>
                                    <Grid item xs>
                                        <Slider min={15} max={30} valueLabelFormat={(x) => x + " minutes"}
                                                value={longTimeSettings} valueLabelDisplay={"auto"}
                                                aria-label={"Default"}
                                                onChange={(e) => setLongTimeSettings(e.target.value)}/>
                                    </Grid>
                                    <Grid item>
                                        <Input style={{color: "white"}}
                                               inputProps={{step: 1, min: 2, max: 60, type: 'number'}}
                                               value={longTimeSettings} size={"small"}
                                               onChange={(e) => setLongTimeSettings(parseInt(e.target.value))}/>
                                    </Grid>
                                </Grid>
                                <br/>

                                <h2>Sound Settings</h2>

                                {/* Sounds */}
                                <Typography gutterBottom>
                                    Enable Sounds
                                </Typography>
                                <FormControlLabel
                                    label={"Bell"}
                                    control={<Checkbox inputProps={{'aria-label': 'controlled'}} checked={bell}
                                                       onChange={(e) => {
                                                           setBell(e.target.checked);
                                                           localStorage.setItem("bell", e.target.checked.toString())
                                                       }}/>}
                                />
                                <FormControlLabel
                                    label={"Click"}
                                    control={<Checkbox inputProps={{'aria-label': 'controlled'}} checked={click}
                                                       onChange={(e) => {
                                                           setClick(e.target.checked);
                                                           localStorage.setItem("click", e.target.checked.toString())
                                                       }}/>}
                                />

                                <Typography paddingTop={"15px"} gutterBottom>
                                    Bell Volume
                                </Typography>
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item>
                                        <NotificationsActive/>
                                    </Grid>
                                    <Grid item xs>
                                        <Slider min={0} max={1} step={0.1} valueLabelFormat={(x) => x * 100 + "%"}
                                                value={bellVolume} valueLabelDisplay={"auto"}
                                                aria-label={"Default"}
                                                onChange={(e) => {
                                                    setBellVolume(e.target.value);
                                                    localStorage.setItem("bellVolume", e.target.value.toString())
                                                }}/>
                                    </Grid>
                                </Grid>

                                <Typography gutterBottom>
                                    Click Volume
                                </Typography>
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item>
                                        <SurroundSound/>
                                    </Grid>
                                    <Grid item xs>
                                        <Slider min={0} max={1} step={0.1} valueLabelFormat={(x) => x * 100 + "%"}
                                                value={clickVolume} valueLabelDisplay={"auto"}
                                                aria-label={"Default"}
                                                onChange={(e) => {
                                                    setClickVolume(e.target.value);
                                                    localStorage.setItem("clickVolume", e.target.value.toString());
                                                }}/>
                                    </Grid>
                                </Grid>

                            </Box>
                            <Stack spacing={3} direction={"row"} justifyContent={"center"}>
                                <Button variant={"outlined"} onClick={playBell} startIcon={<VolumeUp/>}>Test
                                    Bell</Button>
                                <Button variant={"outlined"} onClick={playClick} startIcon={<VolumeUp/>}>Test
                                    Click</Button>
                            </Stack>
                            <br/>
                            <Stack spacing={2} direction={"row"}>
                                <Button color={"success"} variant={"contained"} type={"submit"} onClick={playClick}>Save
                                    Settings</Button>
                                <Button color={"warning"} variant={"contained"} onClick={() => {
                                    handleReset();
                                    playClick()
                                }}>Reset
                                    Settings</Button>
                                <Button color={"error"} variant={"contained"}
                                        onClick={() => {
                                            setShowSettings(false);
                                            playClick()
                                        }}>Exit</Button>
                            </Stack>
                        </form>
                    </Box>
                </Modal>


            </ThemeProvider>
        </>
    );

};

export default Timer;
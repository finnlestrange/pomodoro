import React, {useState} from "react";

// UI Imports -> https://mui.com/material-ui/
import {
    Button,
    Stack,
    createTheme,
    ThemeProvider,
    Modal,
    Box,
    Slider,
    Grid,
    Input,
    Typography,
    FormControlLabel, Checkbox
} from "@mui/material";

// Icon finder -> https://mui.com/material-ui/material-icons/
import {
    Coffee,
    CoffeeMaker,
    NotificationsActive,
    Settings,
    SurroundSound,
    Timelapse
} from "@mui/icons-material";

import {CircularProgressbar} from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import '../styles/Timer.css';

// Sound Imports
import bellSound from "../audio/bell.mp3";
import clickSound from "../audio/button-press.mp3";


// Worker Imports
import workerScript from "../worker/timer.worker";
import Credits from "./Credits";

const timerWorker = new Worker(workerScript);

// MUI Theme & Styles
const theme = createTheme({
    palette: {
        primary: {
            main: "#0b6e99",
        },
        secondary: {
            main: "#d9730d",
        },
        error: {
            main: "#e03e3e",
        },
        success: {
            main: "#0f7b6c",
        }
    }
});

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    background: '#282c34',
    color: 'white',
    border: '2px solid #000',
    borderRadius: "15px",
    boxShadow: 24,
    p: 4,
};

// Main Timer code
const Timer = () => {

    // Colors -> used for the circular timer component
    const main = "#9b9a97";
    const red = "#e03e3e";

    // State & Helper Functions //
    const [mode, setMode] = useState("focus"); // focus, shortBreak or longBreak
    const [count, setCount] = useState(0); // used to determine the next mode based on the current number of completed pomodoro
    const [totalSessions, setTotalSessions] = useState(1); // number of current pomodoro session

    const defaultTimes = [25, 5, 15]; // Used to reset to default settings

    // Stores the times for each of the modes
    const [focusTime, setFocusTime] = useState(25);
    const [shortBreakTime, setShortBreakTime] = useState(5);
    const [longBreakTime, setLongBreakTime] = useState(10);

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
    const [bell, setBell] = useState(true);
    const [click, setClick] = useState(true);
    const [bellVolume, setBellVolume] = useState(0.2);
    const [clickVolume, setClickVolume] = useState(0.3);


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
        // console.log(newTime);
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
    }


    // Changes the mode to the mode -> "m"
    const changeMode = (m) => {
        resetTimer(m);
        if (m === "focus") {
            setMode("focus");
            setTimeLeft(minutesToMs(focusTime));
            setMinutes(focusTime);
            setSeconds(0);
            document.title = "Pomodoro"
        }
        if (m === "shortBreak") {
            setMode("shortBreak");
            setTimeLeft(minutesToMs(shortBreakTime));
            setMinutes(shortBreakTime);
            setSeconds(0);
            document.title = "Pomodoro"
        }
        if (m === "longBreak") {
            setMode("longBreak");
            setTimeLeft(minutesToMs(longBreakTime));
            setMinutes(longBreakTime);
            setSeconds(0);
            document.title = "Pomodoro"
        }
    }


    // Settings Menu Functions //

    // Updates all settings values, based on if they have been changed or not
    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        if (focusTimeSettings !== focusTime) {
            setFocusTime(focusTimeSettings);
        } else if (shortTimeSettings !== shortBreakTime) {
            setShortBreakTime(shortTimeSettings);
        } else if (longTimeSettings !== longBreakTime) {
            setLongBreakTime(longTimeSettings);
        }

        // Ensures correct and updated time for current mode when settings are updated
        if (mode === "focus") {
            setMinutes(focusTimeSettings);
            setSeconds(0);
            setTimeLeft(minutesToMs(focusTimeSettings));
        }
        if (mode === "shortBreak") {
            setMinutes(shortTimeSettings);
            setSeconds(0);
            setTimeLeft(minutesToMs(shortTimeSettings));
        }
        if (mode === "longBreak") {
            setMinutes(longTimeSettings);
            setSeconds(0);
            setTimeLeft(minutesToMs(longTimeSettings));
        }

        setShowSettings(false);
    }


    // Resets all settings to the default values
    const handleReset = () => {
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
                            path: {stroke: (progress < 0.15 ? red : main), strokeLinecap: "butt"}
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
                                onClick={() => {setShowSettings(true); playClick()}} startIcon={<Settings/>}>Settings</Button>
                    </Stack>
                </div>


                {/* Credits */}
                <br />
                <Box sx={{width:"100%", alignContent:"center"}} >
                    <Credits/>
                </Box>


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
                                                       onChange={(e) => setBell(e.target.checked)}/>}
                                />
                                <FormControlLabel
                                    label={"Click"}
                                    control={<Checkbox inputProps={{'aria-label': 'controlled'}} checked={click}
                                                       onChange={(e) => setClick(e.target.checked)}/>}
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
                                                    playBell();
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
                                                    playClick();
                                                }}/>
                                    </Grid>
                                </Grid>

                            </Box>
                            <br/>
                            <Stack spacing={2} direction={"row"}>
                                <Button color={"success"} variant={"contained"} type={"submit"} onClick={playClick}>Save Settings</Button>
                                <Button color={"warning"} variant={"contained"} onClick={() => {handleReset(); playClick()}}>Reset
                                    Settings</Button>
                                <Button color={"error"} variant={"contained"}
                                        onClick={() => {setShowSettings(false); playClick()}}>Exit</Button>
                            </Stack>
                        </form>
                    </Box>
                </Modal>


            </ThemeProvider>
        </>
    );

};

export default Timer;
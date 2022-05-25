import React, {useState} from "react";

// UI Imports
import {Button, Stack, createTheme, ThemeProvider, Modal, Box} from "@mui/material";

import {CircularProgressbar} from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import '../styles/Timer.css';

// Sound Imports
import bellSound from "../audio/bell.mp3";
import clickSound from "../audio/button-press.mp3";


// Worker Imports
import workerScript from "../worker/timer.worker";

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

const Timer = () => {

    // Colors
    const main = "#9b9a97";
    const red = "#e03e3e";

    // State & Helper Functions //
    const [mode, setMode] = useState("focus"); // focus, shortBreak or longBreak
    const [count, setCount] = useState(0); // used to determine the next mode based on the current number of completed pomodoro
    const [totalSessions, setTotalSessions] = useState(1); // number of current pomodoro session

    // Boolean to show settings modal
    const [showSettings, setShowSettings] = useState(false);

    const [focusTime, setFocusTime] = useState(25);
    const [shortBreakTime, setShortBreakTime] = useState(5);
    const [longBreakTime, setLongBreakTime] = useState(10);

    const [running, setRunning] = useState(false); // if the timer is running or not

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

    // Calculates the timers next mode
    const nextMode = () => {
        if (mode === "focus" & count < 3) {
            setCount(prevState => prevState + 1);
            return "shortBreak";
        }
        if (mode === "focus" & count >= 3) {
            setCount(0);
            return "longBreak";
        }
        if (mode === "shortBreak" || mode === "longBreak") {
            setTotalSessions(prevState => prevState + 1);
            return "focus";
        }
    }

    // Returns string of current mode
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

    const min = minutes <= 9 ? `0${minutes.toFixed(0)}` : minutes.toFixed(0);
    const sec = seconds <= 9 ? `0${seconds.toFixed(0)}` : seconds.toFixed(0);

    const minutesToMs = (m) => {
        return m * 60000;
    }

    const getMinutes = (millis) => {
        return Math.floor(millis / 60000);
    }

    const getSeconds = (millis) => {
        return ((millis % 60000) / 1000);
    }

    // Sound Functions //
    const playBell = () => {
        const bell = new Audio(bellSound);
        bell.volume = 0.2;
        bell.play().then();
    };

    const playClick = () => {
        const click = new Audio(clickSound);
        click.volume = 0.3;
        click.play().then();
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

            return;
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

    const stopTimer = () => {
        setRunning(false);
        timerWorker.postMessage("stop");
    }

    const resetTimer = (m) => {
        stopTimer();
        setMode(m);
        setProgress(1);
        setTimeLeft(minutesToMs(modeTime(m)));
        setMinutes(modeTime(m));
        setSeconds(0);
    }


    const changeMode = (m) => {
        resetTimer(m);
        if (m === "focus") {
            setMode("focus");
            setTimeLeft(minutesToMs(focusTime));
            setMinutes(focusTime);
            setSeconds(0);
            document.title = "Pomodoro"
            // document.title = "[Focus] " + focusTime + ":00"
        }
        if (m === "shortBreak") {
            setMode("shortBreak");
            setTimeLeft(minutesToMs(shortBreakTime));
            setMinutes(shortBreakTime);
            setSeconds(0);
            document.title = "Pomodoro"
            // document.title = "[Break] " + shortBreakTime + ":00"
        }
        if (m === "longBreak") {
            setMode("longBreak");
            setTimeLeft(minutesToMs(longBreakTime));
            setMinutes(longBreakTime);
            setSeconds(0);
            document.title = "Pomodoro"
            // document.title = "[Break] " + longBreakTime + ":00"
        }
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <div className={"timerContainer"}>
                    <Stack justifyContent={"center"} spacing={2} direction={"row"}>
                        <Button color={"primary"} variant={mode === "focus" ? "contained" : "outlined"} onClick={() => {changeMode("focus"); playClick()}}>Focus
                            Mode</Button>
                        <Button color={"primary"} variant={mode === "shortBreak" ? "contained" : "outlined"}
                                onClick={() => {changeMode("shortBreak"); playClick()}}>Short Break</Button>
                        <Button color={"primary"} variant={mode === "longBreak" ? "contained" : "outlined"}
                                onClick={() => {changeMode("longBreak"); playClick()}}>Long Break</Button>
                    </Stack>

                    <div style={{height:"20%", paddingTop:"30px", paddingLeft:"30px", paddingRight:"30px", paddingBottom:"15px"}}>
                        <CircularProgressbar styles={{text:{fill:"white", fontSize:"20px", fontFamily:"monospace"}, path:{stroke:(progress < 0.15 ? red : main), strokeLinecap:"butt"}}} value={progress} maxValue={1} text={min + ":" + sec}/>
                    </div>

                    <p style={{fontSize:"17px", fontFamily:"monospace", paddingBottom:"10px"}}>Focus Session #{totalSessions}</p>

                    <Stack justifyContent={"center"} spacing={1} direction={"row"}>
                        {running ?
                            <Button color={"error"} variant={"contained"} onClick={() => {stopTimer(); playClick()}}>Stop Timer</Button>
                            :
                            <Button color={"success"} variant={"contained"} onClick={() => {startTimer(); playClick()}}>Start Timer</Button>
                        }
                        <Button color={"error"} variant={"outlined"} onClick={() => {resetTimer(mode); playClick()}}>Reset Timer</Button>
                    </Stack>
                </div>

                <Button onClick={() => setShowSettings(true)}>Test</Button>

                <Modal open={showSettings} onClose={() => {setShowSettings(false)}}>
                    <Box sx={modalStyle}>
                        <p>Test</p>
                    </Box>
                </Modal>

            </ThemeProvider>
        </>
    );

};

export default Timer;
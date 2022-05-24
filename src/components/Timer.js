import React, {useState} from "react";


// UI Imports
import {Button, TextField} from "@mui/material";


// Worker Imports
import workerScript from "../worker/timer.worker";

const timerWorker = new Worker(workerScript);


const Timer = () => {

    const [workTime, setWorkTime] = useState(25);
    const [timeLeft, setTimeLeft] = useState(workTime * 60 * 1000); // 25 minutes in ms

    // Time conversion functions
    const [minutes, setMinutes] = useState(25);
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

    // Worker functions
    timerWorker.onmessage = (e) => {
        let newTime = parseInt(e.data.split("-")[1]);
        let m = getMinutes(newTime);
        let s = getSeconds(newTime);
        setMinutes(m);
        setSeconds(s);
        // console.log(e.data);
        if (newTime < 0) {
            setTimeLeft(0); // make sure value is round 0 for minutes and seconds
            document.title = "timer done";
            return;
        } else {
            setTimeLeft(newTime);
            document.title = m + " : " + s.toFixed(0);
        }
    };


    // Timer control functions
    const startTimer = () => {
        // this is reset each time the timer is started and is based off of how long there is left on the timer
        const endTime = new Date().getTime() + (timeLeft);

        const message = "start-" + endTime;
        timerWorker.postMessage(message);
    }

    const stopTimer = () => {
        timerWorker.postMessage("stop");
    }

    const resetTimer = () => {
        stopTimer();
        setTimeLeft(minutesToMs(workTime));
        setMinutes(workTime);
        setSeconds(0);
    }

    return (
        <>
            <p>{min} : {sec}</p>
            <Button variant={"outlined"} onClick={startTimer}>Start Timer</Button>
            <Button variant={"outlined"} onClick={stopTimer}>Stop Timer</Button>
            <Button variant={"outlined"} onClick={resetTimer}>Reset Timer</Button>
            <TextField onChange={(e) => setWorkTime(parseInt(e.target.value))} variant={"outlined"}></TextField>
        </>
    );

};

export default Timer;
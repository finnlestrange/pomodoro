// Test Timer functionality with a web worker

import React, {useEffect, useRef, useState} from "react";


// MUI Components
import {Button} from "@mui/material";
import {CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Sound
import bell from '../audio/bell.mp3';
import buttonPress from '../audio/button-press.mp3'; // https://github.com/tplai/kbsim/blob/master/src/assets/audio/turquoise/press/GENERIC_R0.mp3

// Web worker imports
import worker_script from "../worker/timer.worker";

// this needs to be outside the main component function otherwise a new worker is made each time the component re-renders
let worker = new Worker(worker_script);

const Timer = () => {

    const [workTime, setWorkTime] = useState(1);
    const [breakTime, setBreakTime] = useState(25);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [running, setRunning] = useState(false);

    // State for formatting and display
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const min = minutes <= 9 ? `0${minutes.toFixed(0)}` : minutes.toFixed(0);
    const sec = seconds <= 9 ? `0${seconds.toFixed(0)}` : seconds.toFixed(0);


    // Worker functions
    worker.onmessage = (e) => {
        console.log(e.data);
        setTimeLeft(e.data);
        if (e.data < 0) {
            setSeconds(0);
            setMinutes(0);
            document.title = "[Work] Completed";
            return;
        }

        // https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
        let a = Math.floor(e.data / 60000);
        let b = ((e.data % 60000) / 1000);
        setMinutes(a);
        setSeconds(b);

        a = a <= 9 ? `0${a.toFixed(0)}` : a.toFixed(0);
        b = b <= 9 ? `0${b.toFixed(0)}` : b.toFixed(0);

        // Sets the webpage title to the current time left on the clock
        document.title = "[Work] " + a + ":" + b +" left";
    }

    const startTimer = () => {
        const now = new Date().getTime();
        const e = now + (workTime * 60000);
        setEnd(e);
        worker.postMessage(e);
    }

    const stopTimer = () => {
    }
    
    const resetTimer = () => {
        
    }

    return (
        <>
            <p>time left: {min} : {sec}</p>
            <Button variant={"outlined"} onClick={startTimer}>Start Timer</Button>
            <Button variant={"outlined"} onClick={stopTimer}>Stop Timer</Button>
        </>
    );
}

export default Timer;
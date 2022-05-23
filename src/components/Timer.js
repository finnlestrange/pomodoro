// Test Timer functionality with a web worker

import React, {useEffect, useState, useReducer} from "react";

import worker_script from "../worker/timer.worker";

// MUI Components
import {Button, CircularProgress} from "@mui/material";
import {CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Sound
import bell from '../audio/bell.mp3';
import buttonPress from '../audio/button-press.mp3'; // https://github.com/tplai/kbsim/blob/master/src/assets/audio/turquoise/press/GENERIC_R0.mp3


const Timer = () => {

    const[start, setStart] = useState(null);
    const[end, setEnd] = useState(null);
    const[timeLeft, setTimeLeft] = useState(0);

    let worker = new Worker(worker_script);

    worker.onmessage = (e) => {
        setTimeLeft(e.data);
        console.log("Time left is: " + e.data + " seconds.")
    };

    useEffect(() => {
        let s = new Date().getTime();
        let e = s + (1 * 60 * 1000);
        setStart(s);
        setEnd(e);
        worker.postMessage([s, e]);
    }, [])

    useEffect(() => {

    })

    return (
        <>
            <p>time left: {timeLeft} seconds.</p>
        </>
    );
}

export default Timer;
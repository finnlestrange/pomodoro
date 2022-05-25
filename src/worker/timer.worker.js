
const worker = () => {
    let timerInterval;
    let startTime;

    // calculates the time difference between the end of the timer and now
    const calcTimeDiff = (time) => {
        let now = new Date().getTime();
        // console.log("from worker: " + (time - now));
        return time - now;
    }

    onmessage = (e) => {
        const message = e.data;
        const command = message.split(":")[0];
        const time = parseInt(message.split(":")[1]); // end time for the timer

        if (command === "start") {
            startTime = new Date().getTime();
            timerInterval = setInterval(() => {
                postMessage("timeLeft:" + calcTimeDiff(time));
            }, 1000)
        }

        if (command === "stop") {
            clearInterval(timerInterval);
        }
    }
}


// Generating the web-worker script
let code = worker.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const workerScript = URL.createObjectURL(blob);

module.exports = workerScript;

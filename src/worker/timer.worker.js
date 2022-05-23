// Holds the code that will eventually run the timer functionality

const workerCode = () => {
    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (message) => {
        let end = message.data[1];
        setInterval(() => {
            let now = new Date().getTime();
            let diff = end - now;
            postMessage(diff.toFixed(0));
        }, 1000);
    }
};

let code = workerCode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const worker_script = URL.createObjectURL(blob);

module.exports = worker_script;
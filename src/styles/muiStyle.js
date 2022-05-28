import {createTheme} from "@mui/material";

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

// Colors -> used for the circular timer component
const grey = "#9b9a97";
const red = "#e03e3e";

export {
    theme,
    modalStyle,
    grey,
    red
};
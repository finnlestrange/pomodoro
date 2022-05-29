import React from "react";
import {Typography} from "@mui/material";

const Credits = () => {
    return (
      <>
          <Typography variant={"subtitle2"} paddingTop={"10px"} >
              Created with ❤️ by <a href={"https://finnlestrange.tech"} target={"_blank"} rel={"noreferrer"} style={{color:"#0b6e99"}}>Finn Lestrange</a>. <br /> Source code: <a href={"https://github.com/71xn/pomodoro"} style={{color:"#dfab01"}} target={"_blank"} rel={"noreferrer"}>71xn/pomodoro</a>
          </Typography>
      </>
    );
}

export default Credits;
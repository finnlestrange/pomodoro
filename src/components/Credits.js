import React from "react";
import {Typography} from "@mui/material";

const Credits = () => {
    return (
      <>
          <Typography variant={"subtitle2"} paddingTop={"10px"} >
              Created with ❤️ by <a href={"https://github.com/71xn"} target={"_blank"} style={{color:"#0b6e99"}}>Finn Lestrange</a>.
          </Typography>
      </>
    );
}

export default Credits;
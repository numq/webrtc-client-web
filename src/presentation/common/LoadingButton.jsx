import React from 'react';
import {Button, CircularProgress, Typography} from "@mui/material";

export const LoadingButton = ({trigger, start, cancel}) => {
    return (<>
        {
            trigger ? <CircularProgress onClick={cancel}/> : (
                <Button variant={"contained"} onClick={start}>
                    <Typography variant="h3">next stranger</Typography>
                </Button>
            )
        }
    </>)
}
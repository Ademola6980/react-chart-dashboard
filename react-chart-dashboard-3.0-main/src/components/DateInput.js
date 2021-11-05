import React from "react"
import { transformReactDateInput } from "../helper/dateHelper";
export const DateInput =  ({onChangeHandler,date}) => {
    const handleOnChange = (e) => {
        // let value = e.target.value;
        if (onChangeHandler) {
            onChangeHandler(e)
        }
    }
    return (
        <input type="date" value={ transformReactDateInput(new Date(date))} onKeyDown={(e) => e.preventDefault()} onChange={handleOnChange} />
    )
}
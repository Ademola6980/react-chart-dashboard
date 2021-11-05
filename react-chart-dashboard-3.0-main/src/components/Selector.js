import React from "react"
import { useState } from "react/cjs/react.development";
import Select from 'react-select';
const Selector = ({ options = [], selectedOption, handleOnChange }) => {
    const handleChange = (optionSelected) => {
        if(handleOnChange) {
            handleOnChange(optionSelected);
        }
    }
    return (
        <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
        />
    )
}
export default Selector;
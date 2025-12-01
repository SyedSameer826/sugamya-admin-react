import React, { useState, useEffect } from "react";
import { useAppContext } from '../context/AppContext'

const getCurrency = JSON.parse(localStorage.getItem("currencySet")) ? JSON.parse(localStorage.getItem("currencySet")) : { value: '1', text: 'AED', label: 'AED' };

const Currency = ({ price }) => {
    return (
        <>{getCurrency.text}{" "}{(price * parseFloat(getCurrency.value)).toFixed(2)}</>
    )
}

export const currency = (price) => {
    const getCurrency = JSON.parse(localStorage.getItem("currencySet")) ? JSON.parse(localStorage.getItem("currencySet")) : { value: '1', text: 'AED', label: 'AED' };
    return (`${getCurrency.text}  ${(price * parseFloat(getCurrency.value)).toFixed(2)}`)
}

export const CurrencyWithOutLabel = (price) => {
    const getCurrency = JSON.parse(localStorage.getItem("currencySet")) ? JSON.parse(localStorage.getItem("currencySet")) : { value: '1', text: 'AED', label: 'AED' };
    return (`${(price * parseFloat(getCurrency.value)).toFixed(2)}`)
}

export default (Currency);
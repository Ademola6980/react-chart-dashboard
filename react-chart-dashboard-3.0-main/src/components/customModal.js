import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2';
import Modal from 'react-modal'
import { calculateFrequencyBarChart, calculateFrequencyBarChartAmount } from '../helper/dataHelper';
import PDFButton from './pdfButton';
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
let first = true;
const returnHoursFormat = (time) => {
    let num = Number(time);
    if (num === 0) {
        return `12:00 AM`
    } else if (num === 12) {
        return `12:00 PM`
    } else if (num <= 9) {
        return `0${num}:00 AM`
    } else if (num <= 11) {
        return `${num}:00 AM`
    } else {
        return `${num - 12 < 10 ? `0${num - 12}` : `${num - 12}`}:00 PM`
    }
}
const totalCount = (modalData, key) => {
    let count = 0;
    Object.keys(modalData).map((eachKey) => {
        let time = returnHoursFormat(eachKey);
        if (time.includes(key)) {
            count += modalData[eachKey];
        } else if(!key) {
            count += modalData[eachKey];

        }
    })
    return count;
}
const createLabels = () => {
    let labels = [];
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    arr.map((each) => {
        labels.push(returnHoursFormat(each))
    })
    return labels;
}
const CustomModal = ({ isVisible, afterOpenModal, closeModal, modalData, tellerSelected, startDate, endDate, notSelected = [], handleItemClick }) => {
    const [barChartData, setBarChartData] = useState([]);
    const [mode, setMode] = useState(true);
    useEffect(() => {
        if (mode) {
            setBarChartData(calculateFrequencyBarChart(tellerSelected, startDate, endDate, notSelected))
        } else {
            setBarChartData(calculateFrequencyBarChartAmount(tellerSelected, startDate, endDate, notSelected))
        }
    }, [tellerSelected.value, startDate, endDate, notSelected.length, mode])
    useEffect(() => {
        if (!first) {
            handleItemClick(mode)
        } else {
            first = false;
        }
    }, [mode])
    return (
        <Modal
            ariaHideApp={false}
            isOpen={isVisible}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"

        >
            <div style={{ width: 1200, height: 600 }} id={'modal-id'}>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <h4 style={{ fontWeight: 'bold', textAlign: 'center' }}>Time Series Analysis</h4>
                    <div style={{ right: 60, position: 'absolute' }}>
                        <PDFButton id={'modal-id'} />

                        <button class={`btn active`} style={{ marginLeft: 20 }} onClick={() => {
                            setMode(!mode)
                        }}> {mode ? 'Time Series (Frequency)' : 'Time Series (Amount)'}</button>
                    </div>

                    <img style={{ right: 10, top: 10, position: 'absolute', cursor: 'pointer', color: 'blue', width: 15, height: 15 }} onClick={() => {
                        closeModal()
                    }} source={require("../assets/img/cross.png")}></img>
                </div>
                <div style={{ flexDirection: 'row', display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ width: '23%', height: 500, padding: 5, marginTop: 20 }}>
                        {/* <hr></hr> */}
                        <div style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', marginTop: 5 }}>
                            <h6 style={{ fontWeight: 'bold' }}>Time</h6>
                            <h6 style={{ fontWeight: 'bold' }}>Count</h6>
                        </div>
                        <hr></hr>
                        {
                            Object.keys(modalData).map((eachKey) => {
                                return (
                                    returnHoursFormat(eachKey).includes("AM") ?
                                        <div style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', marginTop: 4 }}>
                                            <h8 style={{}}>{returnHoursFormat(eachKey)}</h8>
                                            <h8 style={{}}>{modalData[eachKey]}</h8>
                                        </div> : <></>
                                )
                            })
                        }
                        <hr></hr>
                        <div style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', marginTop: 10 }}>
                            <h6 style={{ fontWeight: 'bold' }}>AM Total</h6>
                            <h6 style={{ fontWeight: 'bold' }}>{totalCount(modalData, 'AM')}</h6>
                        </div>
                        <b> <hr></hr> </b>
                    </div>
                    <div style={{ width: '50%', height: 500, justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>

                        <Bar data={{
                            labels: createLabels(),
                            datasets: [{
                                label: mode ? 'Frequency' : 'Amount',
                                backgroundColor: 'rgba(75,192,192,1)',
                                borderColor: 'rgba(0,0,0,1)',
                                borderWidth: 2,
                                data: barChartData
                            }]
                        }} height={150} options={{
                            legend: { display: false },
                            plugins: {
                                datalabels: {
                                    display: false,
                                    color: "black",
                                    align: "end",
                                    anchor: "end",
                                    font: { size: 10 }
                                }
                            },
                            scales: {
                                x: {
                                    grid: {
                                        display: true
                                    }
                                },
                                y: {
                                    min: 0,
                                    grid: {
                                        display: true
                                    }
                                }
                            }
                        }} />
                        <div style={{ flexDirection: 'row', justifyContent: 'space-around', display: 'flex',width : '60%',marginTop :60 }}>
                            <div>
                                <h6 style={{ fontWeight: 'bold' }}>Grand Total</h6>
                            </div>
                            <div>
                                <h6 style={{ fontWeight: 'bold' }}>{totalCount(modalData)}</h6>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '23%', height: 500, padding: 5, marginTop: 20 }}>
                        {/* <hr></hr> */}
                        <div style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', marginTop: 5 }}>
                            <h6 style={{ fontWeight: 'bold' }}>Time</h6>
                            <h6 style={{ fontWeight: 'bold' }}>Count</h6>
                        </div>
                        <hr></hr>
                        {
                            Object.keys(modalData).map((eachKey) => {
                                return (
                                    returnHoursFormat(eachKey).includes("PM") ?
                                        <div style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', marginTop: 4 }}>
                                            <h8 style={{}}>{returnHoursFormat(eachKey)}</h8>
                                            <h8 style={{}}>{modalData[eachKey]}</h8>
                                        </div> : <></>
                                )
                            })
                        }
                        <hr></hr>
                        <div style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', marginTop: 10 }}>
                            <h6 style={{ fontWeight: 'bold' }}>PM Total</h6>
                            <h6 style={{ fontWeight: 'bold' }}>{totalCount(modalData, 'PM')}</h6>
                        </div>
                        <b> <hr></hr> </b>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CustomModal

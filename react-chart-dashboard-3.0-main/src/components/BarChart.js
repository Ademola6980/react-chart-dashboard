import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { calculateDataForCellDBranch, calculateDataForCellDBranchDetail, calculateDataForCellDTeller, calculateDataForCellDTellerDetails } from "../helper/dataHelper";
const barChartData = {
    labels: ['Branch # 1', 'Branch # 2', 'Branch # 3', 'Branch # 4', 'Branch # 5', 'Branch # 6'],
    datasets: [
        {
            label: 'Testing',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
        },
    ],
};
const BarChart = ({ analyticalMode, tellerSelected, startDate, endDate, notSelected, notSelectedLabels, handleItemClick }) => {
    const [currentMode, setCurrentMode] = useState(true);
    useEffect(() => {
        console.log(analyticalMode, "analyticalMode")
        if (!notSelectedLabels.length && analyticalMode) {
            if (currentMode) {
                setData(calculateDataForCellDBranch(tellerSelected, startDate, endDate, notSelected.concat(notSelectedLabels)))
            } else {
                setData(calculateDataForCellDBranchDetail(tellerSelected, startDate, endDate, notSelected.concat(notSelectedLabels)))
            }
        } else {
            if (currentMode) {
                setData(calculateDataForCellDTeller(tellerSelected, startDate, endDate, notSelected.concat(notSelectedLabels)))
            } else {
                let data = calculateDataForCellDTellerDetails(tellerSelected, startDate, endDate, notSelected.concat(notSelectedLabels));
                setData(data)
            }
        }
    }, [notSelected.length, notSelectedLabels.length, currentMode, analyticalMode])
    const [data, setData] = useState({
        labels: [],
        datasets: []
    })
    const toggleClick = () => {
        setCurrentMode(!currentMode);
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                <div style={{ padding: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ marginBottom: "5px", display: 'flex', flex: 1, justifyContent: 'space-around' }}>
                        {!notSelectedLabels.length && analyticalMode ?
                            <button class={`btn active`} onClick={() => {
                                toggleClick()
                            }}> Branch Mode {currentMode ? '(Summary)' : '(Details)'}</button> :
                            <button class={`btn active`} onClick={() => {
                                toggleClick()
                            }}> Teller Mode {currentMode ? '(Transaction Type)' : '(Transaction Amounts Range)'}</button>
                        }
                        <button class={`btn active`} style={{ right: 30, position: 'absolute' }} onClick={() => {
                            handleItemClick()
                        }}> Time Series</button>
                    </div>
                </div>
            </div>
            <Bar data={data} height={70} options={{
                legend: { display: true },
                plugins: {
                    datalabels: {
                        display: true,
                        color: "black",
                        align: "end",
                        anchor: "end",
                        font: { size: 10 }
                    },
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems) {
                                if (tooltipItems.length > 0) {
                                    const item = tooltipItems[0];
                                  
                                    const data2 = item.chart.data.datasets[0].data2;
                                    const labels = item.chart.data.labels;
                                    const labelCount = labels ? labels.length : 0;
                                    if(data2 && Array.isArray(data2)) {
                                        return `Total : ${data2[item.dataIndex]}` ;
                                    }else {
                                        if (this && this.options && this.options.mode === 'dataset') {
                                            return item.dataset.label || '';
                                        } else if (item.label) {
                                            return item.label;
                                        } else if (labelCount > 0 && item.dataIndex < labelCount) {
                                           
                                            return labels[item.dataIndex];
                                        }
                                    }
                                }
                                return '';
                            }
                        }
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
        </>
    )
}
export default BarChart;
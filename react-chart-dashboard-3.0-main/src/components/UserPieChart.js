import React, { useRef, useState, useEffect } from "react";
import { getDataForCellC } from "../helper/dataHelper";
import { Doughnut } from "react-chartjs-2";
import "../App.css";
let count = -1;
const UserPieChart = ({ setAnalyticalMode,tellerSelected,notSelected, setNotSelectedLabels, startDate, endDate, handleItemClick }) => {
    const [data, setData] = useState({
        labels: [],
        datasets: [{
            backgroundColor: [],
            data: []
        }]
    });
    const myChart = useRef();
    useEffect(() => {
        setData(getDataForCellC(tellerSelected,startDate, endDate, notSelected));
    }, [notSelected, startDate, endDate,tellerSelected.value])
    const getOrCreateLegendList = (chart, id) => {
        const legendContainer = document.getElementById(id);
        let listContainer = legendContainer.querySelector("ul");
        if (!listContainer) {
            listContainer = document.createElement("ul");
            listContainer.style.display = "flex";
            listContainer.style.flexDirection = "column";
            listContainer.style.margin = 0;
            listContainer.style.padding = 0;
            legendContainer.appendChild(listContainer);
        }
        return listContainer;
    };
    const calculateTotal = () => {
        return data.datasets[0].data.reduce((a, b) => a + b, 0);
    }
    const labelUpdateCallback = (legendItems, item, firstTime) => {
        let notSelected = [];
        legendItems.map((eachLabel, index) => {
            if (firstTime) {
                if (index !== item.index) {
                    notSelected.push(legendItems[index].text);
                }
            }  else {
                if (index === item.index) {
                    if (!eachLabel.hidden) {
                        notSelected.push(legendItems[index].text);
                    }
                } else if (eachLabel.hidden) {
                    notSelected.push(legendItems[index].text);
                }
            }
            if(legendItems.length === 1) {
                if (index === item.index) {
                    if (!eachLabel.hidden) {
                        notSelected.push(legendItems[index].text);
                    }
                }
            }
            return eachLabel;
        })
        if (legendItems.length === notSelected.length && legendItems.length !== 1) {
            notSelected = []
        }
        setNotSelectedLabels(notSelected)
    }
    if (!data.datasets[0].data.length) {
        return (<></>)
    }
    return (
        <React.Fragment>
            <div style={{ width: "45%" }}>
                <Doughnut
                    ref={myChart}
                    data={data}
                    plugins={[
                        {
                            id: "htmlLegend",
                            afterUpdate: (chart, args, options) => {
                                // chart = myChart.current;
                                const ul = getOrCreateLegendList(chart, options.containerID);
                                while (ul.firstChild) {
                                    ul.firstChild.remove();
                                }
                                // Reuse the built-in legendItems generator
                                const items = chart.options.plugins.legend.labels.generateLabels(chart);
                                let totalCalculate = calculateTotal()
                                if (count === -1) {
                                    count = localStorage.getItem("myArr")?.length || 0;
                                }
                                let legendItems = chart.legend.legendItems;
                                let forceReset = localStorage.getItem("forceReset");
                        
                                if(forceReset === 'true') {
                                    localStorage.setItem("forceReset",false)
                                    legendItems = legendItems.map((eachData, index) => {
                                        let currentStatus = chart.getDataVisibility(index);
                                        if (!currentStatus) {
                                            chart.toggleDataVisibility(index);
                                            eachData.hidden = true
                                        }
                                        return eachData;

                                    })
                                }
                                if ((count !== localStorage.getItem("myArr")?.length && localStorage.getItem("myArr")?.length !== undefined) ) {
                                    
                                    count = localStorage.getItem("myArr")?.length;
                                    legendItems = legendItems.map((eachData, index) => {
                                        let currentStatus = chart.getDataVisibility(index);
                                        if (!currentStatus) {
                                            chart.toggleDataVisibility(index);
                                            eachData.hidden = true
                                        }
                                        return eachData;

                                    })

                                }
                                items.forEach((item) => {
                                    const li = document.createElement("li");
                                    li.style.alignItems = "center";
                                    li.style.cursor = "pointer";
                                    li.style.display = "flex";
                                    li.style.flexDirection = "row";

                                    li.style.marginBottom = "5px";

                                    let count = 0;
                                    let iValue = -1;
                                    for (let i = 0; i < legendItems.length; i++) {
                                        if (!legendItems[i].hidden) {
                                            count = count + 1;
                                            iValue = i;
                                        }
                                    }
                                    let firstTime = count === legendItems.length ? true : false;
                                    li.onclick = () => {
                                        setAnalyticalMode(false);
                                        
                                        if(legendItems?.length ===  1) {
                                            return;
                                        }
                                        labelUpdateCallback(legendItems, item, firstTime)

                                        const { type } = chart.config;
                                        if (type === "pie" || type === "doughnut") {
                                            for (let i = 0; i < legendItems.length; i++) {
                                                if (firstTime) {
                                                    if (i !== item.index) {
                                                        chart.toggleDataVisibility(i);
                                                    }
                                                }
                                            }
                                            if (!firstTime) {
                                                chart.toggleDataVisibility(item.index);
                                            }
                                            if (count === 1 && iValue === item.index) {
                                                for (let i = 0; i < legendItems.length; i++) {
                                                    chart.toggleDataVisibility(i);
                                                }
                                            }

                                        }
                                        chart.update();
                                    };
                                    // Color box
                                    const boxSpan = document.createElement("span");
                                    boxSpan.style.background = item.fillStyle;
                                    boxSpan.style.borderColor = item.strokeStyle;
                                    boxSpan.style.borderWidth = item.lineWidth + "px";
                                    boxSpan.style.display = "inline-block";
                                    boxSpan.style.height = "20px";
                                    boxSpan.style.marginRight = "10px";
                                    boxSpan.style.width = "20px";
                                    // Text
                                    let chartData = chart._metasets[0]._parsed;
                                    const textContainer = document.createElement("p");
                                    textContainer.style.color = item.fontColor;
                                    textContainer.style.margin = 0;
                                    textContainer.style.padding = 0;
                                    // textContainer.style.flex
                                    textContainer.style.backgroundColor = firstTime ? item.hidden ? "red" : "" : item.hidden ? "" : "blue";
                                    textContainer.id = `label-${item.index}-user`
                                    let text = ``;
                                    let legends = chart.legend.legendItems;
                                    let totalCount = 0;
                                    for (let i = 0; i < legends.length; i++) {
                                        if (!legends[i].hidden) {
                                            totalCount += chartData[i];
                                        } else {
                                            let element = document.getElementById(`label-${i}-user`);
                                            if (element) {
                                                element.innerText = `${legends[i].text}: ${chartData[i].toLocaleString()} (0%)`;
                                            }
                                        }
                                    }
                                    let percentage = totalCount === 0 ?
                                        ((100 * (chartData[item.index] || 0)) / totalCalculate).toFixed(2) :
                                        ((100 * (chartData[item.index] || 0)) / totalCount).toFixed(2)
                                    text = document.createTextNode(`${item.text}: ${chartData[item.index].toLocaleString()} (${percentage})%`)
                                    textContainer.appendChild(text);
                                    li.appendChild(boxSpan);
                                    li.appendChild(textContainer);
                                    ul.appendChild(li);
                                });
                            },
                        }, {
                            beforeDraw(chart) {
                                var width = chart.width,
                                    height = chart.height,
                                    ctx = chart.ctx;
                                ctx.restore();
                                var fontSize = (height / 160).toFixed(2);
                                ctx.font = fontSize + "em sans-serif";
                                ctx.textBaseline = "top";
                                if (!myChart.current) {
                                    return;
                                }
                                let chartData = myChart.current._metasets[0]._parsed;
                                let legends = myChart.current.legend.legendItems;
                                let entryCount = 0;
                                let totalCount = 0;
                                let check = true;
                                for (let i = 0; i < legends.length; i++) {
                                    if (!legends[i].hidden) {
                                        totalCount += chartData[i];
                                        check = false;
                                    } else {
                                        entryCount +=1;
                                        let element = document.getElementById(`label-${i}-user`);
                                        if (element) {
                                            element.innerText = `${legends[i].text}: ${chartData[i].toLocaleString()} (0%)`;
                                        }
                                    }
                                }
                                var text = (totalCount === 0 && check ? calculateTotal() : totalCount).toLocaleString();
                                text = entryCount === legends.length ? 0 : text;
                                var textX = Math.round((width - ctx.measureText(text).width) / 2);
                                var textY = height / 2;
                                var text2 = 'Total';
                                var text2X = Math.round((width - ctx.measureText(text2).width) / 2);
                                var text2Y = height / 3;
                                ctx.fillText(text, textX, textY);
                                ctx.fillText(text2, text2X, text2Y);
                                ctx.save();
                            }
                        }]}
                    options={{
                        onClick: function name(firstParam, secondParam, third) {
                            handleItemClick(firstParam)
                        },
                        plugins: {
                            htmlLegend: {
                                // ID of the container to put the legend in
                                containerID: "js-legend-user",
                            },

                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        let legends = myChart.current.legend.legendItems;
                                        let chartData = myChart.current._metasets[0]._parsed;
                                        let count = 0;
                                        for (let i = 0; i < legends.length; i++) {
                                            if (!legends[i].hidden) {
                                                count += chartData[i];
                                            }
                                        }
                                        let label = context.label || "";
                                        let percentage = count === 0 ?
                                            ((100 * (context.parsed || 0)) / calculateTotal()).toFixed(2) :
                                            ((100 * (context.parsed || 0)) / count).toFixed(2)

                                        label += `: ${context.parsed.toLocaleString()} (${percentage}%)`
                                        return label;
                                    },
                                },
                            },
                        },
                    }}
                />
            </div>
            <div id="js-legend-user" style={{ width: "50%" }} className="chart-legend"></div>

        </React.Fragment>
    )
}
export default UserPieChart;
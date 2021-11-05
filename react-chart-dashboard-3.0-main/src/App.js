import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { DateInput } from "./components/DateInput";
import { calculateDataForCellB, calculateDataForTimeSeries, calculateDataForTimeSeriesAmount, getCounts, getDataForPieChartA, getTheHighestDate, getTheLowestDate, getUniqueTellerName } from "./helper/dataHelper";
import { transformReactDate } from "./helper/dateHelper";
import { Bar, Doughnut } from "react-chartjs-2";
import Selector from "./components/Selector";
import UserPieChart from "./components/UserPieChart";
import DataTable from "./dataTable/DataTable";
import BarChart from "./components/BarChart";
import CustomModal from "./components/customModal";
import PDFButton from "./components/pdfButton";

const cellBColumn = [{
  dataField: 'metric',
  text: 'Metric',
  sort: true
}, {
  dataField: 'totalAmount',
  text: 'Total Amount',
  sort: true
}, {
  dataField: 'notCallOver',
  text: 'Not Callover',
  sort: true
}, {
  dataField: 'callOver',
  text: 'Callover',
  sort: true
}, {
  dataField: 'callOverPercentage',
  text: 'Callover %',
  sort: true
}];
let defualtTeller = { label: 'All Teller', value: -1 };
let data = getDataForPieChartA(defualtTeller)
let localStartDate = null;
let localEndDate = null;
localStorage.setItem("startDate", null)
localStorage.setItem("endDate", null)
localStorage.setItem("tellerUpdate", false);
localStorage.removeItem("myArr");
function App() {
  const [notSelectedLabels, setNotSelectedLabels] = useState([]);
  const [notSelectedLabelsUser, setNotSelectedLabelsUser] = useState([]);
  const [startDate, setStartDate] = useState(transformReactDate(getTheLowestDate()));
  const [endDate, setEndDate] = useState(transformReactDate(getTheHighestDate()));
  const [tellerSelected, setTellerSelected] = useState(defualtTeller);
  const [cellBData, setCellBData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [modalData, setModalData] = useState({})
  const [analyticalMode, setAnalyticalMode] = useState(true);
  const myChart = useRef();
  useEffect(() => {
    setCellBData(calculateDataForCellB(tellerSelected, startDate, endDate, notSelectedLabels.concat(notSelectedLabelsUser)));
  }, [startDate, endDate, tellerSelected.value, notSelectedLabelsUser.length, notSelectedLabels.length])
  useEffect(() => {
    setNotSelectedLabels([])
    setNotSelectedLabelsUser([])
    data = getDataForPieChartA(tellerSelected, startDate, endDate)
  }, [startDate, endDate, tellerSelected.value])
  let countData = getCounts(tellerSelected, startDate, endDate, notSelectedLabels.concat(notSelectedLabelsUser), notSelectedLabels);
  const handleOnChangeStartDate = (e) => {
    if (endDate) {
      if (transformReactDate(endDate).getTime() < transformReactDate(e.target.value).getTime()) {
        setStartDate(endDate);
        localStorage.setItem("startDate", endDate)
        localStorage.setItem("endDate", e.target.value)
        setEndDate(e.target.value);
        return;
      }
    }
    setStartDate(e.target.value);
    localStorage.setItem("startDate", e.target.value)
  }
  const handleOnChangeEndDate = (e) => {
    if (startDate) {
      if (transformReactDate(startDate).getTime() > transformReactDate(e.target.value).getTime()) {
        setEndDate(startDate);
        localStorage.setItem("startDate", e.target.value)
        localStorage.setItem("endDate", startDate)
        setStartDate(e.target.value);
        return;
      }
    }
    setEndDate(e.target.value);
    localStorage.setItem("endDate", e.target.value)
  }
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
    setAnalyticalMode(true)
    legendItems.map((eachLabel, index) => {
      if (firstTime) {
        if (index !== item.index) {
          notSelected.push(legendItems[index].text);
        }
      } else {
        if (index === item.index) {
          if (!eachLabel.hidden) {
            notSelected.push(legendItems[index].text);
          }
        } else if (eachLabel.hidden) {
          notSelected.push(legendItems[index].text);
        }
      }
      if (legendItems.length === 1) {
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
    localStorage.setItem("myArr", JSON.stringify(notSelected))
    setNotSelectedLabels(notSelected)
    setNotSelectedLabelsUser([])

  }
  const openModal = () => {
    setIsVisible(true)
  }
  const closeModal = () => {
    setIsVisible(false)
  }

  const handleItemClick = (flag = true) => {
    openModal()
    if (flag) {
      setModalData(calculateDataForTimeSeries(tellerSelected, startDate, endDate, notSelectedLabels.concat(notSelectedLabelsUser)))
    } else {
      setModalData(calculateDataForTimeSeriesAmount(tellerSelected, startDate, endDate, notSelectedLabels.concat(notSelectedLabelsUser)))
    }
  }
  return (
    <div >
      <div >
        <CustomModal closeModal={closeModal} handleItemClick={handleItemClick} modalData={modalData} isVisible={isVisible} closeModal={closeModal} tellerSelected={tellerSelected} startDate={startDate} endDate={endDate} notSelected={notSelectedLabels.concat(notSelectedLabelsUser)} />
        <div style={{ marginBottom: 15, flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ marginLeft: 10 }}>
            <p>Date range :</p>
          </div>
          <div style={{ marginLeft: 10 }}>
            <DateInput onChangeHandler={handleOnChangeStartDate} date={startDate} />
          </div>
          <div style={{ marginLeft: 10 }}>
            <p>-</p>
          </div>
          <div style={{ marginLeft: 10 }}>
            <DateInput onChangeHandler={handleOnChangeEndDate} date={endDate} />
          </div>
          <div style={{ marginLeft: 10 }}>
            <Selector handleOnChange={(data) => { localStorage.setItem("tellerUpdate", true); setTellerSelected(data) }} selectedOption={tellerSelected} options={getUniqueTellerName()} />
          </div>
          <div style={{ marginLeft: 10, marginRight: 40 }}>
            <PDFButton />
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: 'space-between' }}>
          <div style={{ boxShadow: "1px 1px 1px 1px grey", padding: "5px", width: "42%" }}>
            <h3 style={{ marginBottom: 20, textAlign: 'center', fontWeight: 'bold' }}>Branch Related</h3>
            <div style={{ display: "flex", flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
              <div style={{ width: "45%" }}>
                <Doughnut
                  ref={myChart}
                  data={data}
                  plugins={[
                    {
                      id: "htmlLegend",
                      afterUpdate: (chart, args, options) => {
                        const ul = getOrCreateLegendList(chart, options.containerID);
                        while (ul.firstChild) {
                          ul.firstChild.remove();
                        }
                        // Reuse the built-in legendItems generator
                        const items = chart.options.plugins.legend.labels.generateLabels(chart);
                        let totalCalculate = calculateTotal()
                        let legendItems = chart.legend.legendItems;
                        let storageStartDate = localStorage.getItem("startDate")
                        let storageEndDate = localStorage.getItem("endDate")
                        let teller = localStorage.getItem("tellerUpdate");
                        if (storageEndDate !== localEndDate || storageStartDate !== localStartDate || teller === 'true') {
                          localStorage.setItem("forceReset", true);
                          localStorage.setItem("tellerUpdate", false);
                          localEndDate = storageEndDate;
                          localStartDate = storageStartDate;
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
                          // let legendItems = chart.legend.legendItems;
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
                            if (legendItems?.length === 1) {
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
                          textContainer.style.backgroundColor = firstTime ? item.hidden ? "red" : "" : item.hidden ? "" : "red";
                          textContainer.id = `label-${item.index}`
                          let text = ``;
                          let legends = chart.legend.legendItems;
                          let totalCount = 0;
                          for (let i = 0; i < legends.length; i++) {
                            if (!legends[i].hidden) {
                              totalCount += chartData[i];
                            } else {
                              let element = document.getElementById(`label-${i}`);
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
                        let totalCount = 0;
                        let entryCount = 0;
                        for (let i = 0; i < legends.length; i++) {
                          if (!legends[i].hidden) {
                            totalCount += chartData[i];
                          } else {
                            entryCount += 1;
                            let element = document.getElementById(`label-${i}`);
                            if (element) {
                              element.innerText = `${legends[i].text}: ${chartData[i].toLocaleString()} (0%)`;
                            }
                          }
                        }
                        var text = (totalCount === 0 ? calculateTotal() : totalCount).toLocaleString();
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
                    }, {
                      datalabels: {
                        display: false
                      }
                    }]}
                  options={{
                    onClick: function name(firstParam, secondParam, third) {
                      if (secondParam && secondParam.length) {
                        let key = firstParam?.chart?.legend?.legendItems[secondParam[0].index]?.text;
                        if (key) {
                          // handleItemClick(key)
                        }
                      }
                    },
                    plugins: {

                      htmlLegend: {
                        // ID of the container to put the legend in
                        containerID: "js-legend",
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
              <div id="js-legend" style={{ width: "50%" }} className="chart-legend"></div>
            </div>
          </div>
          <div style={{ width: '54%', display: 'flex', flexDirection: 'column', boxShadow: "1px 1px 1px 1px grey", marginRight: 10 }}>
            <DataTable data={cellBData} columns={cellBColumn} />
            <div style={{ flexDirection: 'row', display: 'flex' }}>
              <div style={{ marginLeft: 20, marginRight: 10, flexDirection: 'row', display: 'flex',textAlign :'center' }}>
                <p style={{ fontSize: 16, fontWeight: 'bold' }}>Analytical Mode : </p>
                <p style={{ fontSize: 16, fontWeight: 'bold', backgroundColor: notSelectedLabelsUser.length || !analyticalMode ? 'blue' : 'red',marginLeft : 5 }}>{notSelectedLabelsUser.length || !analyticalMode ? 'Teller' : 'Branch'}</p>
              </div>
              <div style={{ marginLeft: 20, marginRight: 10 }}>
                <p style={{ fontSize: 16, fontWeight: 'bold' }}>Current Selection :</p>
              </div>
              <div style={{ flexDirection: 'row', display: 'flex', width: '45%', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 16, fontWeight: 'bold' }}>Branch: {countData.branchCount - notSelectedLabels.length} of {countData.branchCount} </p>
                <p style={{ fontSize: 16, fontWeight: 'bold' }}>Teller: {countData.tellerCount} of {countData.tellerDataAll} </p>
              </div>
            </div>
            <div style={{ flexDirection: 'row', display: 'flex', marginLeft: 20 }}>

              <div style={{ marginLeft: 10 }}>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ boxShadow: "1px 1px 1px 1px grey", padding: "5px", width: "42%", marginTop: "20px" }}>
            <h3 style={{ marginBottom: 20, textAlign: 'center', fontWeight: 'bold' }}>Teller Related</h3>
            <div style={{ display: "flex", flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
              <UserPieChart tellerSelected={tellerSelected} handleItemClick={() => { }} startDate={startDate} endDate={endDate} notSelected={notSelectedLabels} notSelectedLabels={notSelectedLabelsUser} setAnalyticalMode={setAnalyticalMode} setNotSelectedLabels={(arr) => {
                setNotSelectedLabelsUser(arr)

              }} />
            </div>
          </div>
          <div style={{ width: '54%', display: 'flex', flexDirection: 'column', boxShadow: "1px 1px 1px 1px grey", marginRight: 10, marginTop: "20px" }}>
            <BarChart analyticalMode={analyticalMode} handleItemClick={handleItemClick} tellerSelected={tellerSelected} startDate={startDate} endDate={endDate} notSelected={notSelectedLabels} notSelectedLabels={notSelectedLabelsUser} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

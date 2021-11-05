import data from "../data/data.json";
import { transformDate, transformReactDate } from "./dateHelper";
const colorData = {};
const createDynamicColors = function () {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ")";
};

const filterDataWithTeller = (selectedTeller) => {
  let rawData = data.callover.filter((eachData) => {
    if (selectedTeller?.value === -1) {
      return true;
    } else {
      if (eachData.IC4PROINPUTTER === selectedTeller?.value) {
        return true;
      }
      return false;
    }
  })
  return rawData;
}
const filterDataWithDateFilter = (data, startDate, endDate) => {
  let rawData = data.filter((eachData) => {
    let recordData = transformDate(eachData.IC4PROENTRYDATE);
    if (startDate) {
      if (recordData.getTime() < transformReactDate(startDate).getTime()) {
        return false;
      }
    }
    if (endDate) {
      if (recordData.getTime() > transformReactDate(endDate).getTime()) {
        return false;
      }
    }
    return true;
  })
  return rawData;
}
const groupRecordInSelectedBranches = (data, notSelected = []) => {
  let branchObj = {};
  data.map((eachData) => {
    let objKey = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}`
    if (branchObj.hasOwnProperty(objKey)) {
      branchObj[objKey].push(eachData);
    } else {
      branchObj[objKey] = [eachData];
    }
    return eachData;
  })
  return branchObj;
}
const groupRecordInSelectedBranchesTeller = (data, notSelected = []) => {
  let branchObj = {};
  data.map((eachData) => {
    let objKey = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}-${eachData.IC4PROINPUTTER}`
    if (branchObj.hasOwnProperty(objKey)) {
      branchObj[objKey].push(eachData);
    } else {
      branchObj[objKey] = [eachData];
    }
    return eachData;
  })
  return branchObj;
}
const calculateCreditTransition = (dataObject) => {
  let calculatedArray = {};
  Object.keys(dataObject).map((each) => {
    let eachBranchRecords = dataObject[each];
    calculatedArray[each] = 0;
    eachBranchRecords.map((eachData) => {
      if (eachData.IC4PROTRANSCODE === 'C') {
        calculatedArray[each] = Number(calculatedArray[each]) + Number(eachData.IC4PROLCYAMOUNT);
      }
      return eachData;
    })
    return each;
  })
  return calculatedArray;
}
const filterNotSelectedBranch = (data, notSelected) => {
  let rawData = data.filter((eachData) => {
    let objKey = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}`
    if (notSelected.includes(objKey)) {
      return false;
    }
    return true;
  })
  return rawData;
}
export const getTheLowestDate = () => {
  let date = null;
  data.callover.map((eachData) => {
    let recordData = transformDate(eachData.IC4PROENTRYDATE);
    if (!date) {
      date = recordData;
    } else {
      if (date.getTime() > recordData.getTime()) {
        date = recordData;
      }
    }
    return eachData;
  });
  return date;
};
export const getTheHighestDate = () => {
  let date = null;
  data.callover.map((eachData) => {
    let recordData = transformDate(eachData.IC4PROENTRYDATE);
    if (!date) {
      date = recordData;
    } else {
      if (date.getTime() <= recordData.getTime()) {
        date = recordData;
      }
    }
    return eachData;
  });
  return date;
};
export const getUniqueTellerName = () => {
  let tellerNames = [{ label: 'All Teller', value: -1 }];
  let tellerNameVisited = {};
  data.callover.map((eachData) => {
    if (tellerNameVisited.hasOwnProperty(eachData.IC4PROINPUTTER)) {
      return eachData;
    }
    tellerNames.push({ label: eachData.IC4PROINPUTTER, value: eachData.IC4PROINPUTTER });
    tellerNameVisited[eachData.IC4PROINPUTTER] = true;
    return eachData;
  });
  return tellerNames;
}

export const getDataForPieChartA = (selectedTeller, startDate, endDate) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = groupRecordInSelectedBranches(dataFilterData);
  let calculateSumObject = calculateCreditTransition(dataFilterData);
  console.log(calculateSumObject, "calculateSumObject")
  let labels = [];
  let dataSet = [];
  let dynamicColors = [];
  Object.keys(calculateSumObject).map((eachKey) => {
    labels.push(eachKey);
    dataSet.push(calculateSumObject[eachKey]);
    if (!colorData.hasOwnProperty(eachKey)) {
      colorData[eachKey] = createDynamicColors();
    }
    dynamicColors.push(colorData[eachKey])
    return eachKey;
  })
  return {
    labels,
    datasets: [{
      backgroundColor: dynamicColors,
      data: dataSet
    }]
  }
}
export const getDataForCellC = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = groupRecordInSelectedBranchesTeller(dataFilterData, startDate, endDate)
  let calculateSumObject = calculateCreditTransition(dataFilterData); // CALCULATION OF RECORD UNDER USER ([{USER # 1 : 10},{USER # 2 : 20}...])
  //BELOW LINES WILL TRANSFORM DATA ACCORDING TO CHART REQUEST DATA.  ( JUST DATA TRANSFORMATION NO CALCULATION)
  let labels = [];
  let dataSet = [];
  let dynamicColors = [];
  Object.keys(calculateSumObject).map((eachKey) => {
    if (notSelected.includes(eachKey.split(' ')[0])) {
      return eachKey;
    }
    labels.push(eachKey);
    dataSet.push(calculateSumObject[eachKey]);
    if (!colorData.hasOwnProperty(eachKey)) {
      colorData[eachKey] = createDynamicColors();
    }
    dynamicColors.push(colorData[eachKey])
    return eachKey;
  })
  return {
    labels,
    datasets: [{
      backgroundColor: dynamicColors,
      data: dataSet
    }]
  }
}
const filterDataWithTellers = (data, notSelected) => {
  let rawData = data.filter((eachData) => {
    let objKey = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}-${eachData.IC4PROINPUTTER}`
    if (notSelected.includes(objKey)) {
      return false;
    }
    return true;
  })
  return rawData;
}
export const getCounts = (selectedTeller, startDate, endDate, notSelected, notSelectedBranch) => {
  let branchData = getDataForPieChartA(selectedTeller, startDate, endDate);
  let tellerData = getDataForCellC(selectedTeller, startDate, endDate, notSelected);
  let tellerDataAll = getDataForCellC(selectedTeller, startDate, endDate, notSelectedBranch);
  return { branchCount: branchData.datasets[0].data.length, tellerCount: tellerData.datasets[0].data.length, tellerDataAll: tellerDataAll.datasets[0].data.length }
}
export const calculateDataForCellB = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  console.log(dataFilterData, " aosidnasiod")
  let totalCredit = { metric: "Total Credit", notCallOver: 0, callOver: 0, totalAmount: 0, callOverPercentage: 0 };
  let totalDebit = { metric: "Total Debit", notCallOver: 0, callOver: 0, totalAmount: 0, callOverPercentage: 0 };
  let Difference = { metric: "Difference", notCallOver: 0, callOver: 0, totalAmount: 0, callOverPercentage: 0 };
  let noOfCreditVocher = { metric: "No Cr Voucher", notCallOver: 0, callOver: 0, totalAmount: 0, callOverPercentage: 0 };
  let noOfDebitVocher = { metric: "No Dr Voucher", notCallOver: 0, callOver: 0, totalAmount: 0, callOverPercentage: 0 };
  let totalVocher = { metric: "Total Voucher", notCallOver: 0, callOver: 0, totalAmount: 0, callOverPercentage: 0 };
  // debugger 
  dataFilterData.map((eachData) => {
    if (eachData.IC4PROTRANSCODE === 'C') {
      if (eachData.IC4PROCALLOFFICER?.length) {
        totalCredit = { ...totalCredit, callOver: totalCredit.callOver + Number(eachData.IC4PROLCYAMOUNT) }
        noOfCreditVocher = { ...noOfCreditVocher, callOver: noOfCreditVocher.callOver + 1 }
      } else {
        totalCredit = { ...totalCredit, notCallOver: totalCredit.notCallOver + Number(eachData.IC4PROLCYAMOUNT) }
        noOfCreditVocher = { ...noOfCreditVocher, notCallOver: noOfCreditVocher.notCallOver + 1 }
      }
    } else {
      if (eachData.IC4PROCALLOFFICER?.length) {
        totalDebit = { ...totalDebit, callOver: totalDebit.callOver + Number(Math.abs(eachData.IC4PROLCYAMOUNT)) }
        noOfDebitVocher = { ...noOfDebitVocher, callOver: noOfDebitVocher.callOver + 1 }
      } else {
        totalDebit = { ...totalDebit, notCallOver: totalDebit.notCallOver + Number(Math.abs(eachData.IC4PROLCYAMOUNT)) }
        noOfDebitVocher = { ...noOfDebitVocher, notCallOver: noOfDebitVocher.notCallOver + 1 }
      }
    }
  })
  totalCredit.totalAmount = totalCredit.notCallOver + totalCredit.callOver;
  totalCredit.callOverPercentage = totalCredit.notCallOver + totalCredit.callOver === 0 ? `100.00 %` : `${((((totalCredit.callOver) / (totalCredit.notCallOver + totalCredit.callOver)) * 100).toFixed(2))} %`

  totalDebit.totalAmount = totalDebit.notCallOver + totalDebit.callOver;
  totalDebit.callOverPercentage = totalDebit.notCallOver + totalDebit.callOver === 0 ? `100.00 %` : `${((((totalDebit.callOver) / (totalDebit.notCallOver + totalDebit.callOver)) * 100).toFixed(2))} %`

  noOfCreditVocher.totalAmount = noOfCreditVocher.notCallOver + noOfCreditVocher.callOver;
  noOfCreditVocher.callOverPercentage = noOfCreditVocher.notCallOver + noOfCreditVocher.callOver === 0 ? `100.00 %` : `${((((noOfCreditVocher.callOver) / (noOfCreditVocher.notCallOver + noOfCreditVocher.callOver)) * 100).toFixed(2))} %`

  noOfDebitVocher.totalAmount = noOfDebitVocher.notCallOver + noOfDebitVocher.callOver;
  noOfDebitVocher.callOverPercentage = noOfDebitVocher.notCallOver + noOfDebitVocher.callOver === 0 ? `100.00 %` : `${((((noOfDebitVocher.callOver) / (noOfDebitVocher.notCallOver + noOfDebitVocher.callOver)) * 100).toFixed(2))} %`

  Difference.notCallOver = (totalCredit.notCallOver) - (totalDebit.notCallOver);
  Difference.callOver = (totalCredit.callOver) - (totalDebit.callOver);
  Difference.totalAmount = Difference.notCallOver + Difference.callOver;
  Difference.callOverPercentage = Difference.notCallOver + Difference.callOver === 0 ? `100.00 %` : `${((((Difference.callOver) / (Difference.notCallOver + Difference.callOver)) * 100).toFixed(2))} %`

  totalVocher.callOver = noOfCreditVocher.callOver + noOfDebitVocher.callOver;
  totalVocher.notCallOver = noOfCreditVocher.notCallOver + noOfDebitVocher.notCallOver;
  totalVocher.totalAmount = totalVocher.notCallOver + totalVocher.callOver;
  totalVocher.callOverPercentage = totalVocher.notCallOver + totalVocher.callOver === 0 ? `100.00 %` : `${((((totalVocher.callOver) / (totalVocher.notCallOver + totalVocher.callOver)) * 100).toFixed(2))} %`
  return [totalCredit, totalDebit, Difference, noOfCreditVocher, noOfDebitVocher, totalVocher]
}
export const calculateDataForCellDBranch = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  let resultObj = {}
  dataFilterData.map((eachData) => {
    let key = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}`;
    if (resultObj.hasOwnProperty(key)) {
      resultObj[key][0] += eachData.IC4PROTRANSCODE === 'C' ? Number(eachData.IC4PROLCYAMOUNT) : 0;
      resultObj[key][1] += eachData.IC4PROTRANSCODE === 'D' ? Number(Math.abs(eachData.IC4PROLCYAMOUNT)) : 0;
    } else {
      resultObj[key] = []
      resultObj[key][0] = eachData.IC4PROTRANSCODE === 'C' ? Number(eachData.IC4PROLCYAMOUNT) : 0;
      resultObj[key][1] = eachData.IC4PROTRANSCODE === 'D' ? Number(Math.abs(eachData.IC4PROLCYAMOUNT)) : 0;
    }
    return eachData;
  })
  let labels = [];
  let creditArray = [];
  let debitArray = [];
  Object.keys(resultObj).map((eachKey) => {
    labels.push(eachKey);
    creditArray.push(resultObj[eachKey][0]);
    debitArray.push(resultObj[eachKey][1]);
    return eachKey

  })
  return {
    labels: labels,
    datasets: [{
      label: 'Credit',
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: creditArray
    }, {
      label: 'Debit',
      backgroundColor: 'red',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: debitArray
    }]
  };
}
export const calculateDataForCellDBranchDetail = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  let resultObj = {}
  dataFilterData.map((eachData) => {
    let key = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}-${eachData.IC4PROINPUTTER}`;
    if (resultObj.hasOwnProperty(key)) {
      resultObj[key][0] += eachData.IC4PROTRANSCODE === 'C' ? Number(eachData.IC4PROLCYAMOUNT) : 0;
      resultObj[key][1] += eachData.IC4PROTRANSCODE === 'D' ? Number(Math.abs(eachData.IC4PROLCYAMOUNT)) : 0;
    } else {
      resultObj[key] = []
      resultObj[key][0] = eachData.IC4PROTRANSCODE === 'C' ? Number(eachData.IC4PROLCYAMOUNT) : 0;
      resultObj[key][1] = eachData.IC4PROTRANSCODE === 'D' ? Number(Math.abs(eachData.IC4PROLCYAMOUNT)) : 0;
    }
    return eachData;
  })
  let labels = [];
  let creditArray = [];
  let debitArray = [];
  Object.keys(resultObj).map((eachKey) => {
    labels.push(eachKey);
    creditArray.push(resultObj[eachKey][0]);
    debitArray.push(resultObj[eachKey][1]);
    return eachKey

  })
  return {
    labels: labels,
    datasets: [{
      label: 'Credit',
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: creditArray
    }, {
      label: 'Debit',
      backgroundColor: 'red',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: debitArray
    }]
  };
}
export const calculateDataForCellDTeller = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  let resultObj = {};
  let distinctType = {};
  let count = 0;
  dataFilterData.map((eachData) => {
    if (!distinctType.hasOwnProperty(eachData.IC4PROTRANSTYPE)) {
      distinctType[eachData.IC4PROTRANSTYPE] = count;
      count += 1;
    }
  })
  dataFilterData.map((eachData) => {
    if (eachData.IC4PROTRANSCODE !== 'C') {
      return;
    }
    let key = `${eachData.IC4PROBRANCHCODE}-${eachData.IC4PROENTRYDATE}-${eachData.IC4PROINPUTTER}`;
    if (!resultObj.hasOwnProperty(key)) {
      resultObj[key] = []
      for (let i = 0; i < count; i++) {
        resultObj[key][i] = 0;
      }
    }
    let index = distinctType[eachData.IC4PROTRANSTYPE];
    resultObj[key][index] += Number(eachData.IC4PROLCYAMOUNT);
    return eachData;
  })
  let datasetArray = [];
  let finalDataSet = [];
  let labels = []
  for (let i = 0; i < count; i++) {
    datasetArray.push([]);
  }
  Object.keys(resultObj).map((eachKey) => {
    labels.push(eachKey);
    // creditArray.push(resultObj[eachKey][0]);
    // debitArray.push(resultObj[eachKey][1]);
    let arrayData = resultObj[eachKey];
    for (let i = 0; i < arrayData.length; i++) {
      datasetArray[i].push(arrayData[i]);
    }
    return eachKey
  })
  datasetArray.map((eachData, index) => {
    let label = '';
    Object.keys(distinctType).map((eachKey) => {
      let keyIndex = distinctType[eachKey];
      if (keyIndex === index) {
        label = eachKey;
      }
    })
    finalDataSet.push({
      label: label,
      backgroundColor: createDynamicColors(),
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: eachData
    })
  })
  // let labels = [];
  // let creditArray = [];
  // let debitArray = [];

  return {
    labels: labels,
    datasets: finalDataSet
    // datasets: [{
    //   label: 'Credit',
    //   backgroundColor: 'rgba(75,192,192,1)',
    //   borderColor: 'rgba(0,0,0,1)',
    //   borderWidth: 2,
    //   data: creditArray
    // }, {
    //   label: 'Debit',
    //   backgroundColor: 'red',
    //   borderColor: 'rgba(0,0,0,1)',
    //   borderWidth: 2,
    //   data: debitArray
    // }]
    // datasets:
  };
}
export const calculateDataForTimeSeries = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  let count = 0;
  let defaultTime = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0 }
  dataFilterData.map((eachData) => {
    if (eachData.IC4PROTRANSCODE !== 'C') {
      return;
    }

    if (eachData.IC4PROENTRYTIME.length === 3) {
      if (!defaultTime.hasOwnProperty(`${eachData.IC4PROENTRYTIME[0]}`)) {
        defaultTime[`${eachData.IC4PROENTRYTIME[0]}`] = 0;
      }
      defaultTime[`${eachData.IC4PROENTRYTIME[0]}`] += 1;
    } else {
      if (!defaultTime.hasOwnProperty(`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`)) {
        defaultTime[`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`] = 0;
      }
      defaultTime[`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`] += 1;
    }
  })
  return defaultTime;
}
export const calculateDataForTimeSeriesAmount = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  let defaultTime = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0 }
  dataFilterData.map((eachData) => {
    if (eachData.IC4PROTRANSCODE !== 'C') {
      return;
    }
    if (eachData.IC4PROENTRYTIME.length === 3) {
      if (!defaultTime.hasOwnProperty(`${eachData.IC4PROENTRYTIME[0]}`)) {
        defaultTime[`${eachData.IC4PROENTRYTIME[0]}`] = 0;
      }
      defaultTime[`${eachData.IC4PROENTRYTIME[0]}`] += Number(eachData.IC4PROLCYAMOUNT);
    } else {
      if (!defaultTime.hasOwnProperty(`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`)) {
        defaultTime[`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`] = 0;
      }
      defaultTime[`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`] += Number(eachData.IC4PROLCYAMOUNT);
    }
  })
  // // debugger
  // let filterData = [];
  // let branchCode = '';
  // let time = '';
  // let teller = '';
  // let defaultTime = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0 }
  // keySelected = keySelected.split('-');
  // if (keySelected.length === 2) {
  //   branchCode = keySelected[0];
  //   time = keySelected[1];
  //   filterData = data.callover.map((eachData) => {
  //     if (eachData.IC4PROBRANCHCODE !== branchCode || eachData.IC4PROENTRYDATE !== time) {
  //       return;
  //     }
  //     if (eachData.IC4PROENTRYTIME.length === 3) {
  //       defaultTime[`${eachData.IC4PROENTRYTIME[0]}`] += 1;
  //     } else {
  //       defaultTime[`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`] += 1;
  //     }
  //   })
  // } else {
  //   branchCode = keySelected[0];
  //   time = keySelected[1];
  //   teller = keySelected[2];
  //   for (let i = 3; i < keySelected.length; i++) {
  //     teller += '-' + keySelected[i];
  //   }
  //   filterData = data.callover.map((eachData) => {
  //     if (eachData.IC4PROBRANCHCODE !== branchCode || eachData.IC4PROENTRYDATE !== time || eachData.IC4PROINPUTTER === teller) {
  //       return;
  //     }
  //     if (eachData.IC4PROENTRYTIME.length === 3) {
  //       defaultTime[`${eachData.IC4PROENTRYTIME[0]}`] += 1;
  //     } else {
  //       defaultTime[`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`] += 1;
  //     }
  //   })

  // }
  // console.log(defaultTime, " defaultTime")
  return defaultTime;
}
export const calculateDataForCellDTellerDetails = (selectedTeller, startDate, endDate, notSelected = []) => {
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  let resultObj = {
    "0 - 999,999.99": 0, "1,000,000 - 1,999,999.99": 0, "2,000,000 - 2,999,999.99": 0,
    "3,000,000 - 3,999,999.99": 0, "4,000,000 - 4,999,999.99": 0, "5,000,000 - 5,999,999.99": 0, "6,000,000 - 6,999,999.99": 0,
    "7,000,000 - 7,999,999.99": 0, "8,000,000 - 8,999,999.99": 0, "9,000,000 - 9,999,999.99": 0, "10,000,000 above": 0
  }
  let resultObj2 = {
    "0 - 999,999.99": 0, "1,000,000 - 1,999,999.99": 0, "2,000,000 - 2,999,999.99": 0,
    "3,000,000 - 3,999,999.99": 0, "4,000,000 - 4,999,999.99": 0, "5,000,000 - 5,999,999.99": 0, "6,000,000 - 6,999,999.99": 0,
    "7,000,000 - 7,999,999.99": 0, "8,000,000 - 8,999,999.99": 0, "9,000,000 - 9,999,999.99": 0, "10,000,000 above": 0
  }
  dataFilterData.map((eachData) => {
    if (eachData.IC4PROTRANSCODE !== 'C') {
      return;
    }
    let amount = Number(eachData.IC4PROLCYAMOUNT);
    if (amount >= 0 && amount <= 999999.99) {
      resultObj["0 - 999,999.99"] += 1;
      resultObj2["0 - 999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 1000000 && amount <= 1999999.99) {
      resultObj["1,000,000 - 1,999,999.99"] += 1;
      resultObj2["1,000,000 - 1,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 2000000 && amount <= 2999999.99) {
      resultObj["2,000,000 - 2,999,999.99"] += 1;
      resultObj2["2,000,000 - 2,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 3000000 && amount <= 3999999.99) {
      resultObj["3,000,000 - 3,999,999.99"] += 1;
      resultObj2["3,000,000 - 3,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 4000000 && amount <= 4999999.99) {
      resultObj["4,000,000 - 4,999,999.99"] += 1;
      resultObj2["4,000,000 - 4,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 5000000 && amount <= 5999999.99) {
      resultObj["5,000,000 - 4,999,999.99"] += 1;
      resultObj2["5,000,000 - 4,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 6000000 && amount <= 6999999.99) {
      resultObj["6,000,000 - 4,999,999.99"] += 1;
      resultObj2["6,000,000 - 4,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 7000000 && amount <= 7999999.99) {
      resultObj["7,000,000 - 4,999,999.99"] += 1;
      resultObj2["7,000,000 - 4,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 8000000 && amount <= 8999999.99) {
      resultObj["8,000,000 - 4,999,999.99"] += 1;
      resultObj2["8,000,000 - 4,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else if (amount >= 9000000 && amount <= 9999999.99) {
      resultObj["9,000,000 - 4,999,999.99"] += 1;
      resultObj2["9,000,000 - 4,999,999.99"] += Number(eachData.IC4PROLCYAMOUNT);
    } else {
      resultObj["10,000,000 above"] += 1;
      resultObj2["10,000,000 above"] += Number(eachData.IC4PROLCYAMOUNT);
    }
    return eachData;
  })
  let labels = [];
  let frequencyArray = [];
  let dataTwoArray = [];
  Object.keys(resultObj).map((eachKey) => {
    labels.push(eachKey);
    frequencyArray.push(resultObj[eachKey]);
    dataTwoArray.push(resultObj2[eachKey]);
    return eachKey
  })
  return {
    labels: labels,
    datasets: [{
      label: 'Frequency',
      backgroundColor: 'rgba(75,192,192,1)',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 2,
      data: frequencyArray,
      data2:dataTwoArray
    }]
  };
}
export const calculateFrequencyBarChart = (selectedTeller, startDate, endDate, notSelected = []) => {
  let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  dataFilterData.map((eachData) => {
    if(eachData.IC4PROTRANSCODE !== 'C') {
      return;
    }
    let num;
    if (eachData.IC4PROENTRYTIME.length === 3) {
      num = Number(`${eachData.IC4PROENTRYTIME[0]}`);
    } else {
      num = Number(`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`);
    }
    arr[num] += 1;
  })
  return arr;
}
export const calculateFrequencyBarChartAmount = (selectedTeller, startDate, endDate, notSelected = []) => {
  let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let dataFilterData = filterDataWithTeller(selectedTeller);
  dataFilterData = filterDataWithDateFilter(dataFilterData, startDate, endDate)
  dataFilterData = filterNotSelectedBranch(dataFilterData, notSelected);
  dataFilterData = filterDataWithTellers(dataFilterData, notSelected);
  dataFilterData.map((eachData) => {
    if (eachData.IC4PROTRANSCODE !== 'C') {
      return;
    }
    let num;
    if (eachData.IC4PROENTRYTIME.length === 3) {
      num = Number(`${eachData.IC4PROENTRYTIME[0]}`);
    } else {
      num = Number(`${eachData.IC4PROENTRYTIME[0]}${eachData.IC4PROENTRYTIME[1]}`);
    }
    arr[num] += Number(eachData.IC4PROLCYAMOUNT);
  })
  return arr;
}
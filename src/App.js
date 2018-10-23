import React, { Component } from 'react';
import Sidebar from './components/Layout/Sidebar/Sidebar';
import Header from './components/Layout/Header/Header';
import * as d3 from 'd3-fetch'
import produce from 'immer'
import Moment from 'moment'
import { extendMoment } from 'moment-range'

import './App.scss';

import MapParent from './containers/MapParent'
import EbolaChartComponent from './containers/Chart/EbolaChartComponent'

const moment = extendMoment(Moment)
const csvLocationPath = 'csv/'
const csvExtension = '.csv'


const COUNTRIES = ['Guinea', 'Liberia', 'Sierra Leone']

const INITIAL_DATE_RANGE = {
  dateRange: {
    from: new Date(2014, 4, 14),
    to: new Date(2016, 0, 20)
  }
}

const sevenDaysInSeconds = 60 * 60 * 24 * 7 * 1000

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dataLoading: true,
      ebolaData: null,
      ebolaDataCombined: null,
      filters: {
        country: 'Guinea',
        projection: false,
        rightColumnWidth: `${window.innerWidth - 230}px`,
        ...INITIAL_DATE_RANGE
      },
      modal: {
        show: false,
        text: '',
        title: ''
      },
      chartObject: {}
    }
  }

  componentWillMount () {
    this._importDataFromCsv()
  }

  _importDataFromCsv = async () => {
    // const filePath = csvLocationPath + 'ebola_epicurve_data' + csvExtension
    const filePath = csvLocationPath + 'healthmap_projections_updated_10_August_2018' + csvExtension
    const data = await d3.csv(filePath)
    let newState = {}
    newState['ebolaData'] = this._prepareEbolaData(data)
    newState['ebolaDataCombined'] = await d3.csv(csvLocationPath + 'healthmap_projections' + csvExtension)

    this.setState({
      dataLoading: false,
      ...newState
    })
    console.log('[App.js][_importDataFromCsv] The ebolaData is: ', this.state.ebolaData)
    console.log('[App.js][_importDataFromCsv] The ebolaDataCombined is: ', this.state.ebolaDataCombined)
  }

  _eventCallback = (Chart, event) => {
    if (this.state.filters.projection) {
      Chart.chart.setVisibleChartRange(this.state.filters.dateRange.from, this.state.filters.dateRange.to)
    }
    if (event.end - event.start < sevenDaysInSeconds) {
      let minDate = moment(event.start).add(7, 'days')
      if (Chart.chart.hN.max > minDate) {
        Chart.chart.setVisibleChartRange(event.start, minDate.toDate())
      } else {
        minDate = moment(event.end).subtract(7, 'days')
        Chart.chart.setVisibleChartRange(minDate.toDate(), event.end)
      }
    }
    this.setState((prevState) => {
      return {
        ...prevState,
        filters: {
          ...prevState.filters,
          dateRange: {
            from: event.start,
            to: event.end
          }
        }
      }
    })
  }

  _eventReadyCallback = (Chart, event) => {
    this.setState({
      chartObject: Chart
    })
  }

  _prepareDataForCharts = () => {
    const {ebolaData, ebolaDataCombined, filters: {country, projection, dateRange}} = this.state
    let rows = []
    let projectionsData = {}
    let nextProjections
    const columns = [
      {
        type: 'date',
        label: 'Date',
      },
      {
        type: 'number',
        label: 'Ebola Cases',
      },
    ]
    if (projection) {
      columns.push({
        type: 'number',
        label: 'Projection',
      })
      columns.push({
        type: 'number',
        label: 'Projection error max',
      })
      columns.push({
        type: 'number',
        label: 'Projection error min',
      })
    }
    if (country === 'All') {
      ebolaDataCombined.forEach(function (row) {
        let projectionDate = new Date(row.projection_from)
        if (projection) {
          if (moment(projectionDate).isBetween(moment(dateRange.from), moment(dateRange.to))) {
            rows.push([projectionDate, parseFloat(row.aggregated)])
            rows[rows.length - 1].push(null, null, null)
            nextProjections = {
              oneWeek: {
                y: Number(row['y1.aggregated']),
                ymin: Number(row['ymin1.aggregated']),
                ymax: Number(row['ymax1.aggregated']),
              },
              twoWeeks: {
                y: Number(row['y2.aggregated']),
                ymin: Number(row['ymin2.aggregated']),
                ymax: Number(row['ymax2.aggregated']),
              },
              month: {
                y: Number(row['y4.aggregated']),
                ymin: Number(row['ymin4.aggregated']),
                ymax: Number(row['ymax4.aggregated']),
              }
            }
          }
        } else {
          rows.push([projectionDate, parseFloat(row.aggregated)])
        }

      })
    } else {
      const filteredData = ebolaData[country]
      Object.keys(filteredData).forEach(function (key) {
        let ebolaDailyData = filteredData[key]

        if (projection) {
          if (moment(key).isBetween(moment(dateRange.from), moment(dateRange.to))) {
            rows.push([new Date(key), parseFloat(ebolaDailyData.value)])
            rows[rows.length - 1].push(null, null, null)
            nextProjections = ebolaDailyData.projections
          }
        } else {
          rows.push([new Date(key), parseFloat(ebolaDailyData.value)])
        }

      })
    }

    if (projection) {
      const {oneWeek, twoWeeks, month} = nextProjections
      let oneWeekData, twoWeeksData, monthData
      oneWeekData = [moment(rows[rows.length - 1][0]).add(7, 'days').toDate(), null, oneWeek.y, oneWeek.ymax, oneWeek.ymin]
      twoWeeksData = [moment(rows[rows.length - 1][0]).add(2, 'weeks').toDate(), null, twoWeeks.y, twoWeeks.ymax, twoWeeks.ymin]
      monthData = [moment(rows[rows.length - 1][0]).add(1, 'month').toDate(), null, month.y, month.ymax, month.ymin]
      rows[rows.length - 1][2] = rows[rows.length - 1][1]
      rows[rows.length - 1][3] = rows[rows.length - 1][1]
      rows[rows.length - 1][4] = rows[rows.length - 1][1]
      rows = [...rows, oneWeekData, twoWeeksData, monthData]
    }
    return {
      columns,
      rows,
      projectionsData
    }
  }

  _prepareDataForMap = () => {
    const {ebolaData, filters: {dateRange}} = this.state
    const momentDateRange = moment().range(dateRange.from, dateRange.to)
    let mapData = {}
    COUNTRIES.map((country) => {
      mapData[country] = 0
      let filteredData = ebolaData[country]
      Object.keys(filteredData).forEach(function (key) {
        let ebolaDailyData = filteredData[key]
        if (momentDateRange.contains(moment(key))) {
          mapData[country] += parseInt(ebolaDailyData.value)
        }
      })
    })

    console.log('[App.js][_prepareDataForMap] The mapData is: ', mapData)
    return mapData
  }

  _prepareEbolaData = (inputData) => {
    const keys = ['y', 'ymin', 'ymax']
    const projections = ['oneWeek', 'twoWeeks', 'month']
    const projectionsMapping = {
      oneWeek: 1,
      twoWeeks: 2,
      month: 4
    }

    let newData = {
      'Guinea': {}, 'Liberia': {}, 'Sierra Leone': {}
    }

    COUNTRIES.forEach((country) => {
      inputData.forEach((item) => {
        // console.log("[_prepareEbolaData] Each item is: ", item)
        newData[country][item.projection_from] = {}
        newData[country][item.projection_from]['projections'] = {}
        projections.forEach((projection) => {
          newData[country][item.projection_from]['projections'][projection] = {}
          newData[country][item.projection_from]['projections']['originalValue'] = parseFloat(item[country])
          keys.forEach((key) => {
            newData[country][item.projection_from]['projections'][projection][key] = parseFloat(item[`${key}${projectionsMapping[projection]}.${country}`])
          })
        })
        newData[country][item.projection_from]['value'] = item[country]
      })
    })
    // console.log("[MapParent.js][_prepareEbolaData] The ebola data is: ", newData)
    return newData
  }

  _prepareEbolaDataOld = (inputData) => {
    const keys = ['y', 'ymin', 'ymax']
    const projections = ['oneWeek', 'twoWeeks', 'month']
    const projectionsMapping = {
      oneWeek: 1,
      twoWeeks: 2,
      month: 4
    }

    const a = COUNTRIES.map((country) => {
      const data = inputData.map((item) => {
        const dateProjections = projections.map((projection) => {
          const projectionData = keys.map((key) => {
            return {
              [key]: item[`${key}${projectionsMapping[projection]}.${country}`]
            }
          })
          return {aaa: projectionData}
        })
        return {
          [item.Projections_from]: {
            value: [item[country]],
            projections: dateProjections
          }
        }
      })
      return {
        [country]: data
      }
    })
    return a
  }

  _handleCountryChange = (country) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        filters: {
          ...prevState.filters,
          country: country
        }
      }
    })
  }

  _handleProjectionChange = (projection) => {
    this.setState((prevState) => {
        return {
          ...prevState,
          filters: {
            ...prevState.filters,
            projection: projection
          }
        }
    }, () => {
      this.state.chartObject.chart.setVisibleChartRange(
        this.state.filters.dateRange.from,
        moment(this.state.filters.dateRange.to).add(1, 'month').toDate()
      )
    })
  }

  _changeDateRange = (by, period, method, field) => () => {
    this.setState(
      produce(draft => {
          const date = moment(draft.filters.dateRange[field])

          if (method === 'add') {
            let newDate = date.clone().add(by, period)
            if (field === 'from') {
              if (newDate.isAfter(moment(draft.filters.dateRange.to).clone().subtract(by, period)) || newDate.isSame(moment(draft.filters.dateRange.to).clone().subtract(by, period))) {
                newDate = moment(draft.filters.dateRange.from)
              }
            }
            draft.filters.dateRange[field] = newDate.toDate()
          } else {
            let newDate = date.clone().subtract(by, period)
            if (field === 'to') {
              if (newDate.clone().subtract(by, period).isSame(moment(draft.filters.dateRange.from)) || newDate.clone().subtract(by, period).isBefore(moment(draft.filters.dateRange.from))) {
                newDate = moment(draft.filters.dateRange.to)
              }
            }
            draft.filters.dateRange[field] = newDate.toDate()
          }
      }
    ), () => {
      this.state.chartObject.chart.setVisibleChartRange(this.state.filters.dateRange.from, moment(this.state.filters.dateRange.to).add(1, 'month').toDate())
    })
  }

  render() {
    return (
      <div className="app">
        <Sidebar />
        <Header />
        <MapParent stateDataFromApp={this.state} />
        <EbolaChartComponent />
      </div>
    );
  }
}

export default App;

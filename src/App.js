import React, { useReducer, useRef, useLayoutEffect, useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import axios from 'axios';
import usStates from "./usStates";
import {  AppBar, 
          Toolbar, 
          IconButton,
          Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
am4core.options.autoDispose = true;

const useStyles = makeStyles({
  root: {
    background: 'linear-gradient(45deg, #0066FF 30%, #0000CC 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(10, 10, 255, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },
  navDisplayFlex: {
    display: `flex`,
    justifyContent: `space-between`
  },
  linkText: {
    textDecoration: `none`,
    textTransform: `uppercase`,
    color: `white`
  },
  drawer: {
    width: "180px"
  },
  content: {
    marginLeft: "240px"
  }
});

function PositivityChart(props) {
  const chart = useRef(null);
  
  //let [data, setData] = useState([]);
  console.log('PositivityChart running...')
  if(props && props.props && chart && chart.current) {
    console.log('ok..');
    let x = am4core.create("chartdiv", am4charts.XYChart);
    x.data = props.props;
    x.paddingRight = 40;

    let dateAxis = x.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;

    let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minWidth = 35;

    let series = x.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "value";

    series.tooltipText = "{valueY.value}";
    x.cursor = new am4charts.XYCursor();

    let scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(series);
    x.scrollbarX = scrollbarX;

    chart.current = x;
  }
  //console.log(`props: ${JSON.stringify(props)}`);
  
  useEffect(() => {
    let x = am4core.create("chartdiv", am4charts.XYChart);
    
    if(props && props.props ) {
      x.data = props.props;
      x.paddingRight = 40;

      //console.log(`xData: ${x.data}`);
      let dateAxis = x.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;

      let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;

      let series = x.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";

      series.tooltipText = "{valueY.value}";
      x.cursor = new am4charts.XYCursor();

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      x.scrollbarX = scrollbarX;

      chart.current = x;
    }
    return () => {
      chart.current && chart.current.dispose();
      x.dispose();
    };
  }, []);


  return (
    <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
  );
}

function App() {
  const classes = useStyles();
  const reducer = (state, action) => {
    switch (action.type) {
      case "init":
        return { ...state };
      default:
        return { ...state };
    }
  };
  let [state, dispatch] = useReducer(reducer, { left: false, req: false, data: [], chartData: [], notes: "", link: "Home", currentState: "" });

  if(!state.req) {
    state.req = true;
    axios.get('https://api.covidtracking.com/v1/states/info.json')
      .then(data => {
        state.data = data.data;
        //console.log(`axios: ${JSON.stringify(data.data, null, 2)}`);
        dispatch(state, { type: "init" });
      });
  }
  
  const toggleDrawer = (anchor, open) => (event) => {
    console.log(`EVENT: ${event}`);
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    dispatch(state);
  };

  {/* renderData will extract ignore the event, but use the USA - state - to make changes to the Base UI component */}
  const renderData = (unitedState) => (event) => {
    let chartData = [];
    state.chartData = [];
    //console.log(`onClick: ${usStates[unitedState]}`);
    //let d = state.data;
    state.link = unitedState;
    let NotesObj = state.data.filter(e => e.state === usStates[unitedState])[0];
    state.currentState = NotesObj.state;
    //console.log(state);
    //state.chart = <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    state.notes = NotesObj.notes;
    axios.get(`https://api.covidtracking.com/v1/states/${usStates[unitedState]}/daily.json`)
      .then(USStateData => {
        for(let i = 0; i < USStateData.data.length; i++) {
          chartData.push({ date: USStateData.data[i].dateChecked, name: `name-${i}`, value: USStateData.data[i].positive })
        }
        //state.chartData = USStateData.data.map((e, i) => { return { date: e.dateChecked, name: `name-${i}`, value: e.positive }; })
        state.chartData = chartData.filter(e => e.date !== null);
        //console.log(`${usStates[unitedState]}: ${JSON.stringify(USStateData,null,2)}`);
        //console.log(`state: ${JSON.stringify(state.chartData,null,2)}`);
        dispatch(state);
      })
    
  }
  const homePage = () => () => {
    state.link = "Home";
    dispatch(state);
  }
  
  const list = (anchor) => (
    <div
      className={clsx(classes.list)}
      role="presentation"
    >
      <List>
        {['Home'].map((text) => (
          <ListItem button dense key={text} onClick={homePage(text)}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>

        {/* This is the list of states on the left drawer */}
          {Object.keys(usStates).map((text, index) => (
            <ListItem button dense 
                key={text} 
                onClick={renderData(text)}
            >
              <ListItemIcon>
                <LocationSearchingIcon />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
      </List>
    </div>
  );

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <React.Fragment key="left">
              <MenuIcon onClick={toggleDrawer("left", true)} />
              <div className={classes.drawer}>
                <Drawer variant="permanent" anchor="left" open={state["left"]} onClose={toggleDrawer("left", false)}>
                  {list("left")}
                </Drawer>
              </div>
            </React.Fragment> 
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            United States Covid API
          </Typography>
          {/* <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>

      {( (state.req)? console.log(`BLERP: ${state.currentState}`) : '' )}

      <div className={classes.content}>
        {/* { Object.keys(usStates).join(" ") } */}
      </div>

      {/* Render the home page until click dispatch */}
      {
        (state.link === "Home")?
        <div className={classes.content}>
          <h1>
            Home
          </h1>
        </div>
        :
        (state.currentState)?
          <div className={ classes.content }>
            <h1>
            { state.link }
            </h1>
              <h2>
                Positivity Rate:
              </h2>
              <PositivityChart props={ state.chartData }/>
            <h2>
              Notes:
            </h2>
              <ReactMarkdown>{ state.notes }</ReactMarkdown>
          </div>
          :
          ""
      }
      
    </div>
  );
}

export default App;

'use strict';
import React from 'react';
import Year from './year';
import styler from 'react-styling/flat';
import ReactDOM from 'react-dom';
import spacetime from '../../builds/spacetime';
import { scaleLinear } from 'd3-scale';
import Radium from 'radium';

const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
const dates = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 37
];
const timezones = [
  'Canada/Pacific',
  'Canada/Eastern',
  'Etc/UCT',
  'Europe/Istanbul',
  'Australia/Brisbane',
  'Australia/Canberra',
];
const years = [
  1922,
  1969,
  2008,
  2015,
  2015,
  2017,
  2018,
  2019,
  2020,
  2065,
];

const times = [
  [0, 6, '#5C456A', ''], //early morning
  [6, 11, '#5C909A', '6am'], //morning
  [11, 17, '#4486DB', '11am'], //afternoon
  [17, 20, '#AA81C4', '5pm'], //dinner
  [20, 24, '#5C456A', '8pm'], //evening
];

const style = styler`
container
  position:relative
day:
  position:relative
  display:block
  height:100
  paddingLeft:150
controls:
  color:silver
  padding:20
  border:1px solid silver
margin:
  padding:20
  display:inline-block
format:
  color:darkgrey
  font-size:50
key:
  color:grey
  width:100
  display:inline-block
value:
  color:steelblue
  display:inline-block
  width:100
  text-align:left
  font-size:20
tr
  // width:50%
  padding:20px 0px 60px 60px
  `;

class App extends React.Component {
  constructor() {
    super();
    this.css = style;
    this.width = 600;
    this.scale = scaleLinear().domain([0, 24]).range([0, this.width]);
    this.state = {
      s: spacetime(Date.now())
    };
    this.drawDay = this.drawDay.bind(this);
    this.controls = this.controls.bind(this);
    this.change = this.change.bind(this);
    this.showOff = this.showOff.bind(this);
    this.setEpoch = this.setEpoch.bind(this);
  }

  showOff() {
    let {state, css} = this;
    let s = state.s;
    const methods = [
      'timeOfDay',
      'dayName',
      'dayOfYear',
      'week',
      'quarter',
      'season',
    // 'timezone',
    ];
    return methods.map((str, i) => {
      return (
        <div key={i}>
          <span style={css.key}>{str + ': '}</span>
          <span style={css.value}>{s[str]()}</span>
        </div>
        );
    });
  }
  drawDay(s, key) {
    let {scale, css} = this;
    let h = s.hour();
    let paths = times.map((a, i) => {
      let x = scale(a[0]);
      let width = scale(a[1] - a[0]);
      return (
        <g height={50} y={50} key={i}>
          <text x={x} y={50} fontSize={10} fill={a[2]}>{a[3]}</text>
          <rect x={x} y={25} width={width} height={8} fill={a[2]} />
        </g>
        );
    });
    let nowPlace = scale(h);
    let remainder = this.width - nowPlace;
    let bar = <rect x={nowPlace} y={25} width={remainder} height={8} fill={'white'} opacity={0.8}/>;
    let time = <text x={nowPlace - 15} y={15} fontSize={20} fill={'darkgrey'}>{s.format().time.h12}</text>;
    return (
      <div key={key}>
        <div style={{
        marginLeft: 500,
        marginTop: 80
      }}>
          <Year width={this.width / 3} s={s}/>
        </div>
        <span>{s.tz}</span>
        <div>{s.monthName() + ' ' + s.date()}</div>
        <svg style={css.day} width={this.width} height={25}>
          {paths}
          {bar}
          {time}
        </svg>
      </div>
      );
  }
  setEpoch(e) {
    let epoch = e.target.value;
    this.setState({
      s: spacetime(epoch)
    });
  }
  change(num, unit) {
    let s = this.state.s;
    s.add(num, unit);
    this.setState({
      s: s
    });
  }
  set(val, unit) {
    let s = this.state.s;
    s[unit](val);
    this.setState({
      s: s
    });
  }
  controls() {
    let {state, css} = this;
    let s = state.s;
    return (
      <div style={css.controls}>
        <div>
          {'epoch: ' + s.epoch}
        </div>
        <span style={css.margin}>
          <select onChange={(e) => this.set(e.target.value, 'month')}>
            {months.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
        </span>
        <span style={css.margin}>
          <select onChange={(e) => this.set(e.target.value, 'date')}>
            {dates.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
        </span>
        <span style={css.margin}>
          <select onChange={(e) => this.set(e.target.value, 'year')}>
            {years.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
        </span>
        <br/>
        <span style={css.margin}>
          hour
          <input type='button' value={'-'} onClick={() => this.change(-1, 'hour')}/>
          <input type='button' value={'+'} onClick={() => this.change(1, 'hour')}/>
        </span>
        <span style={css.margin}>
          day
          <input type='button' value={'-'} onClick={() => this.change(-1, 'day')}/>
          <input type='button' value={'+'} onClick={() => this.change(1, 'day')}/>
        </span>
        <span style={css.margin}>
          week
          <input type='button' value={'-'} onClick={() => this.change(-1, 'week')}/>
          <input type='button' value={'+'} onClick={() => this.change(1, 'week')}/>
        </span>
        <span style={css.margin}>
          month
          <input type='button' value={'-'} onClick={() => this.change(-1, 'month')}/>
          <input type='button' value={'+'} onClick={() => this.change(1, 'month')}/>
        </span>
        <span style={css.margin}>
          quarter
          <input type='button' value={'-'} onClick={() => this.change(-1, 'quarter')}/>
          <input type='button' value={'+'} onClick={() => this.change(1, 'quarter')}/>
        </span>

      </div>
      );
  }

  render() {
    let {state, css} = this;
    let s = state.s;
    let places = timezones.map((tz, i) => {
      let d = s.clone();
      d.goto(tz);
      return this.drawDay(d, i);
    });
    return (
      <div>
        spacetime demo
        <table>
          <tbody>
            <tr>
              <td style={css.tr}>
                <b style={css.format}>{`${s.monthName()} ${s.date()}, ${s.year()}`}</b>
                <div style={css.format}>{`${s.format().time.h12}`}</div>
                {this.showOff()}
              </td>
              <td style={css.tr}>
                {this.controls()}
              </td>
            </tr>
          </tbody>
        </table>
        <Year width={this.width / 2} s={s}/>
        {places}
      </div>
      );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
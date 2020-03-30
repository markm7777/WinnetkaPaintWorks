import React from 'react';
import './App.css';

let colorMap = {
  '#000000': 'Black',
  '#ff0000': 'Red',
  '#00ff00': 'Green',
  '#0000ff': 'Blue',
  '#ffffff': 'None'
}

let lineMap = {
  '1': '1',
  '3': '2',
  '7': '3',
  '12': '4'
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lineWeight: 1,
      color: '#000000',
      fillColor: '#ffffff',
      bFill: false,
      mode: 'pencil',
      bugMode: false
    };
    let ctx = '';
    let canvasTop = 0;
    let canvasLeft = 0;
    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let prevWidth = 0;
    let prevHeight = 0;
  }  

  componentDidMount() {
    let dpr = window.devicePixelRatio || 2;
    let canvas = this.refs.canvas;
    let rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.canvasTop = rect.top;
    this.canvasLeft = rect.left;
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
  }

  getCurrentMousePos(e) {
    return {
        x: e.clientX - this.canvasLeft,
        y: e.clientY - this.canvasTop
    };
  }

  onMouseDown = (e) => {
    this.isDrawing = true;
    let pos = this.getCurrentMousePos(e);
    this.startX = pos.x;
    this.startY = pos.y;
  }

  mouseUp = (e) => {
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.prevWidth = 0;
    this.prevHeight = 0;
  }

  draw = (e) => {
    if (this.state.mode === 'pencil') {
      if (this.isDrawing === true) {
        // mouse left button must be pressed
        if (e.buttons !== 1) { 
          return;
        }

        this.ctx.beginPath(); // begin
        this.ctx.lineWidth = this.state.lineWeight;
        this.ctx.strokeStyle  = this.state.color;
        this.ctx.moveTo(this.startX, this.startY); // from
        let pos = this.getCurrentMousePos(e);
        this.ctx.lineTo(pos.x, pos.y); // to
        this.ctx.closePath();
        this.ctx.stroke();

        this.startX = pos.x;
        this.startY = pos.y;
      }
    }
    else if (this.state.mode === 'rectangle') {
      if (this.isDrawing === true) {
        if (e.buttons !== 1) { 
          return;
        }

        let pos = this.getCurrentMousePos(e);

        //clear the whole canvas, or just what we've previously drawn
        if (this.state.bugMode) {                                                            //clear partial canvas
          // this is a brute force-ish approach that has bugs - especially with larger line widths 
          // there must be better way...
          if ((pos.x > this.startX) && (pos.y < this.startY)) {
            //Quadrant 
            this.ctx.clearRect(this.startX - ((this.state.lineWeight / 2) + .2), 
                               this.startY + ((this.state.lineWeight / 2) + .2),
                               this.prevWidth + (this.state.lineWeight * 1.32),
                               this.prevHeight - (this.state.lineWeight * 1.32)); 
          }
          else if ((pos.x > this.startX) && (pos.y > this.startY)) {
            //Quadrant 4
            this.ctx.clearRect(this.startX - ((this.state.lineWeight / 2) + .3), 
                               this.startY - ((this.state.lineWeight / 2) + .3),
                               this.prevWidth + (this.state.lineWeight * 1.63),
                               this.prevHeight + (this.state.lineWeight * 1.63)); 
          }
          else if ((pos.x < this.startX) && (pos.y < this.startY)) {
            //Quadrant 2
            this.ctx.clearRect(this.startX + ((this.state.lineWeight / 2) + .3), 
                               this.startY + ((this.state.lineWeight / 2) + .3),
                               this.prevWidth - (this.state.lineWeight * 1.63),
                               this.prevHeight - (this.state.lineWeight * 1.63)); 
          }
          else if ((pos.x < this.startX) && (pos.y > this.startY)) {
            //Quadrant 3
            this.ctx.clearRect(this.startX + ((this.state.lineWeight / 2) + .3), 
                               this.startY - ((this.state.lineWeight / 2) + .3),
                               this.prevWidth - (this.state.lineWeight * 1.63),
                               this.prevHeight + (this.state.lineWeight * 1.63)); 
          }
        }
        else {                                                                              //clear full canvas
          this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); 
        }

        this.ctx.beginPath();
        if (this.state.bFill) {
          this.ctx.fillStyle = this.state.fillColor;
          this.ctx.fillRect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
        }
        else {
          this.ctx.rect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
          this.ctx.strokeStyle = this.state.color;
          this.ctx.lineWidth = this.state.lineWeight;
          this.ctx.stroke();
        }
        this.prevWidth = pos.x - this.startX
        this.prevHeight = pos.y - this.startY
      }
    }
    else if (this.state.mode === 'erase') {
      if (e.buttons !== 1) { 
        return;
      }
      let pos = this.getCurrentMousePos(e);
      this.ctx.clearRect(pos.x - 15, pos.y - 15, 30, 30);
    }
  }

  onLineSelect = (line) => {
    this.setState({lineWeight: line})
  }

  onColorSelect = (color) => {
    let colorHex;
    if (color === 'red') {
      colorHex = '#ff0000';
    }
    else if (color === 'green') {
      colorHex = '#00ff00';
    }
    else if (color === 'blue') {
      colorHex = '#0000ff';
    }
    else {
      colorHex = '#000000';
    }
    this.setState({color: colorHex})
  }

  onFillSelect = (color) => {
    let colorHex;
    let bFill = false;
    if (color === 'red') {
      colorHex = '#ff0000';
      bFill = true;
    }
    else if (color === 'green') {
      colorHex = '#00ff00';
      bFill = true;
    }
    else if (color === 'blue') {
      colorHex = '#0000ff';
      bFill = true;
    }
    else {
      colorHex = '#ffffff';
    }
    this.setState({fillColor: colorHex, bFill: bFill})
  }

  onPencilMode = () => {
    this.setState({mode: 'pencil'})
  }

  onRectangleMode = () => {
    if (!this.state.bugMode) {
      this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); //clear canvas
    }
    this.setState({mode: 'rectangle'})
  }

  onEraseMode = () => {
    this.setState({mode: 'erase'})
  }

  onClear = () => {
    this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height); //clear canvas
  }

  onBugMode = (e) => {
    this.setState({bugMode: !this.state.bugMode});
  }

  render() {
    return (
      <div className="App">
     
        <span id='titleSpan'><img style={{marginTop: '10px', paddingRight: '30px'}} src={process.env.PUBLIC_URL + '/paintpallet4.png'} alt='oops'></img><h2 style={{display: 'inline'}} id='titleDiv'>Winnetka Paint Works!</h2></span>
        <div id='mainDiv'>
          <canvas ref='canvas' onMouseDown={this.onMouseDown} onMouseMove={this.draw} onMouseUp={this.mouseUp} className={this.state.mode === 'erase' ? 'eraseCursor' : 'defaultCursor'}></canvas> 
          <div id='controlsDiv'>

            <div id='modeDiv'>
              <ul id='modeList'>
                <li>
                  <button className={'modeButton ' + (this.state.mode === 'pencil' ? 'modeSelected' : '')} onClick={this.onPencilMode}>Pencil</button>
                </li>
                <li>
                  <button className={'modeButton ' + (this.state.mode === 'rectangle' ? 'modeSelected' : '')} onClick={this.onRectangleMode}>Rectangle</button>
                </li>
                <li>
                  <button className={'modeButton ' + (this.state.mode === 'erase' ? 'modeSelected' : '')} onClick={this.onEraseMode}>Erase</button>
                </li>
                <li>
                  <button className='modeButton' onClick={this.onClear} style={{marginTop: '20px'}}>Clear</button>
                </li>
              </ul>
            </div>

            <div id='lineWeightDiv'>
              <div style={{marginBottom: '5px', marginLeft: '65px', textAlign: 'left'}}>Line width: {lineMap[this.state.lineWeight]}</div>
              <ul style={{display: 'inline', paddingLeft: '5px'}}>
                <li style={{display: 'inline'}}>
                  <button className={'lineButton ' +  (this.state.lineWeight === 1 ? 'lineSelected' : '')}  onClick={() => this.onLineSelect(1)}>1</button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className={'lineButton ' +  (this.state.lineWeight === 3 ? 'lineSelected' : '')}   onClick={() => this.onLineSelect(3)}>2</button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className={'lineButton ' +  (this.state.lineWeight === 7 ? 'lineSelected' : '')}   onClick={() => this.onLineSelect(7)}>3</button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className={'lineButton ' +  (this.state.lineWeight === 12 ? 'lineSelected' : '')}  onClick={() => this.onLineSelect(12)}>4</button>
                </li>
              </ul>
            </div>

            {/* {this.state.color} */}
            <div id='colorDiv'>
              <div style={{marginBottom: '5px', marginLeft: '65px', textAlign: 'left'}}>Line color: {colorMap[this.state.color]}</div>
              <ul style={{display: 'inline'}}>
                <li style={{display: 'inline'}}>
                  <button className='colorButton' id='colorBlack' onClick={() => this.onColorSelect('black')}></button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className='colorButton' id='colorGreen' onClick={() => this.onColorSelect('green')}></button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className='colorButton' id='colorBlue' onClick={() => this.onColorSelect('blue')}></button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className='colorButton' id='colorRed' onClick={() => this.onColorSelect('red')}></button>
                </li>
              </ul>
            </div>

            <div id='fillDiv'>
              <div style={{marginBottom: '5px', marginLeft: '65px', textAlign: 'left'}}>Fill color: {colorMap[this.state.fillColor]}</div>
              <ul style={{display: 'inline'}}>
                <li style={{display: 'inline'}}>
                  <button className='colorButton' id='colorWhite' onClick={() => this.onFillSelect('white')}></button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className='colorButton'  id='colorGreen' onClick={() => this.onFillSelect('green')}></button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className='colorButton'  id='colorBlue' onClick={() => this.onFillSelect('blue')}></button>
                </li>
                <li style={{display: 'inline'}}>
                  <button className='colorButton'  id='colorRed' onClick={() => this.onFillSelect('red')}></button>
                </li>
              </ul>
            </div>

            <div id='bugModeDiv'>
              <div>Bug Mode:</div>
              <div style={{display: 'inline'}}>
                <input type='checkbox' onChange={this.onBugMode} value={this.state.bugMode} className='largerCheckbox' ></input>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default App;

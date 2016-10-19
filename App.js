import React from "react";
import ReactDOM from "react-dom";
class App extends React.Component {
  constructor(...arg){
    super(...arg);
    this.clearButton = this.clearButton.bind(this);
    this.getMousePos = this.getMousePos.bind(this);
    this.saveData = this.saveData.bind(this);
    this.addMouseMove = this.addMouseMove.bind(this);
    this.state = {
      Path:[[]],
      data: ""
    }
  }
  componentDidMount(){
    let canvas = this.refs.canvas;
    canvas.addEventListener("mousedown",this.addMouseMove);
    canvas.addEventListener("mouseup",this.saveData);
    canvas.addEventListener("mouseout",this.saveData);
  };
  addMouseMove(){
    let canvas = this.refs.canvas,
        context = canvas.getContext("2d");
    context.beginPath(); 
    canvas.addEventListener("mousemove",this.getMousePos);
  }
  //---Save data and remove mouse events
  saveData(){
    let canvas = this.refs.canvas,
        context = canvas.getContext("2d"),
        arr = [],
        data = "";
    context.beginPath();
    this.drawBezierCurve();
    arr = this.state.Path.slice();
    arr.push([]);
    this.setState({Path: arr});
    data = canvas.toDataURL();
    this.setState({data: data});
    console.log(this.state.data);
    canvas.removeEventListener("mousemove",this.getMousePos);
  }
  //---Set current mouse(x,y) position to this.state.Path   
  getMousePos(event){
    let elPos = event.target.getBoundingClientRect(),
        canvas = event.target,
        context = canvas.getContext("2d"),
        x = Math.round((event.clientX - elPos.left)),
        y = Math.round((event.clientY - elPos.top)),
        arr = this.state.Path.slice(),
        l = arr.length;
    context.lineCap="round";
    context.lineWidth = 1;
    context.lineTo(x,y);
    context.stroke();
    arr[l-1].push(x + " " + y);
    this.setState({Path: arr});
  };

  //---Calculate control points[x1,y1,x2,y2]
  getControlPoints(x0,y0,x1,y1,x2,y2,t){
    let a = Math.sqrt(Math.pow(x1 - x0,2)+Math.pow(y1 - y0,2)), 
        b = Math.sqrt(Math.pow(x2 - x1,2)+Math.pow(y2 - y1,2)), 
        fa = t*a/(a + b),   
        fb = t*b/(a + b),  
        p1x = x1 - fa*(x2 - x0), 
        p1y = y1 - fa*(y2 - y0),    
        p2x = x1 + fb*(x2 - x0),
        p2y = y1 + fb*(y2 - y0); 
    return [p1x,p1y,p2x,p2y];
  }

  //---Getting  lineWidth 
  getLineWidth(p1,p2,p3,t,curr){
    let ax = Math.sqrt(Math.pow((p2[0] - p1[0]),2)),
        ay = Math.sqrt(Math.pow((p2[1] - p1[1]),2)),
        bx = Math.sqrt(Math.pow((p3[0] - p2[0]),2)),
        by = Math.sqrt(Math.pow((p3[1] - p2[1]),2)),
        deltaA = (ax + ay)/2,
        deltaB = (bx + by)/2,
        max = 8,min = 1,
        kA = (1 + deltaA/100)*(1 - deltaA/100),
        kB = (1 + deltaB/100)*(1 - deltaB/100),
        widthA = max*kA + min*(1-kA),
        widthB = max*kB + min*(1-kB),
        pointWidth = Math.pow((1-t),3)*curr+3*t*Math.pow((1-t),2)*curr+3*t*t*(1-t)*curr+t*t*t*widthB;  
    return (pointWidth <= 0)? 1 : pointWidth;      
  }

  //---Draw Bezier's curve througth all path
  drawBezierCurve(){
    let canvas = this.refs.canvas,
        context = canvas.getContext("2d"),
        path = this.state.Path.slice(), 
        start = [],end = [],mid = [],ctrl = [],point = [],
        step = 6,lineWidth = 6;   
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(path[0][0] == undefined){
      return false;
    }
    

    //---Beating path into smaller segments
    path.forEach((curr)=>{
      curr.forEach((curr,i,arr)=>{
        if((arr[i+step] == undefined)||(i%step)){ 
          return false;
        }
        start = [+arr[i].split(" ")[0],+arr[i].split(" ")[1]];
        end = [+arr[i+step].split(" ")[0],+arr[i+step].split(" ")[1]];
        mid = [+arr[Math.floor(i+step/2)].split(" ")[0],+arr[Math.floor(i+step/2)].split(" ")[1]];
        
        //--- Manual Bezier's method
        for(let t = 0; t < 1; t+=0.01){
          lineWidth = (this.getLineWidth(start,mid,end,t,lineWidth));
          ctrl = this.getControlPoints(start[0],start[1],mid[0],mid[1],end[0],end[1],0.5);
          point[0] = Math.pow((1-t),3)*start[0]+3*t*Math.pow((1-t),2)*ctrl[0]+3*t*t*(1-t)*ctrl[2]+t*t*t*end[0];
          point[1] = Math.pow((1-t),3)*start[1]+3*t*Math.pow((1-t),2)*ctrl[1]+3*t*t*(1-t)*ctrl[3]+t*t*t*end[1];
          context.beginPath();
          context.lineWidth = lineWidth;
          context.moveTo(point[0],point[1]);  
          context.lineCap="round";
          context.lineTo(point[0],point[1]);
          context.stroke();
        }
      }); 
    });
  };
  //---Reset  all data
  clearButton(){
    let canvas = this.refs.canvas,
        context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.setState({Path:[[]]});
    this.render();
  };
  render(){
    return <div>
              <button className="clearButton" onClick={this.clearButton}>Erase</button>
              <canvas className="canvas" width="800" height="400" ref="canvas">
              </canvas>
            </div>
  }
};
export default App

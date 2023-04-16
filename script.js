const canvas = document.getElementById('tankCanvas');
const ctx = canvas.getContext('2d');
// Array to store undo barrels
const undoStack = [];
// Array to store redo undid barrels
const redoStack = [];

//************* THE UNFUN PART! *************\

const Tank = {
  body: {
    size: 50,
    fillColor: '#66CCFF',
    borderColor: '#6699CC',
    borderWidth: 5
  },
  guns: [
    {
    length: 40,
    width: 15,
    fillColor: '#999999',
    borderColor: '#666666',
    borderWidth: 2,
    x: 0,
    y: 0, // Offset gun position relative to body
    angle: 90, // Angle in degrees for gun rotation
    firedelay: 0,
    shootSettings:'combineStats([g.basic])',
    type:'exports.bullet',
    },
  ],
};


function drawTank(context, x, y) {
  // Draw guns
  Tank.guns.forEach(gun => {
    const gunX = x - gun.x
    const gunY = y - gun.y
    const angleInRadians = gun.angle * Math.PI / 180 * -1;
    context.save();
    context.translate(gunX, gunY);
    context.rotate(angleInRadians);
    context.fillStyle = gun.fillColor;
    context.strokeStyle = gun.borderColor;
    context.lineWidth = gun.borderWidth;
    context.beginPath();
    context.rect(-gun.width / 2, 0, gun.width, gun.length); // Updated gunX calculation
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  });

  // Draw tank body
  const bodyX = x
  const bodyY = y
  context.fillStyle = Tank.body.fillColor;
  context.strokeStyle = Tank.body.borderColor;
  context.lineWidth = Tank.body.borderWidth;
  context.beginPath();
  context.arc(bodyX, bodyY, Tank.body.size / 2, 0, 2 * Math.PI);
  context.closePath();
  context.fill();
  context.stroke();
}




  
  
setInterval(function(){
    drawGrid();
    drawTank(ctx,200,200);
},100)



function drawGrid() {
    // Set background color
    ctx.fillStyle = 'white'; // Adjust the background color as needed
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gridSize = 50; // Adjust the grid size as needed
    ctx.strokeStyle = '#b1adad'; // Grid line color
    ctx.lineWidth = 2; // Grid line width
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
}

//************* Arras Menu! *************\\
function addBarrel() {
  const newBarrel = {
    length: parseInt(exreturn(0,"barrel")),
    width: parseInt(exreturn(1,"barrel")),
    fillColor: '#CCCCCC', /* no change */
    borderColor: '#888888', /* no change */
    borderWidth: 3, /*no change*/
    x: parseInt(exreturn(2,"barrel")),
    y: parseInt(exreturn(3,"barrel")),
    angle: parseInt(exreturn(4,"barrel")),
    firedelay: parseInt(exreturn(5,"barrel")),
  };
  pushBarrel(newBarrel)
}

function pushBarrel(barrel) {
  Tank.guns.push(barrel);
  undoStack.push(() => {
    Tank.guns.pop();
    redoStack.push(barrel);
  });
}


// Function to undo the last barrel push action
function barrelundo() {
  const undoAction = undoStack.pop();
  if (undoAction) {
    undoAction();
  }
}

// Function to redo the last undone barrel push action
function barrelredo() {
  const redoAction = redoStack.pop();
  if (redoAction) {
    redoAction();
  }
}

//DRAGGABLE STUFF
class Draggable {
    constructor(element) {
      this.element = element;
      this.isDragging = false;
      this.offsetX = 0;
      this.offsetY = 0;
      this.button = this.element.querySelector('.obstructdrag'); // Assuming the button has a class of 'button'
      this.buttonIsActive = false; // Flag to track if the button is active
  
      this.element.addEventListener('mousedown', this.startDrag.bind(this));
  
      if (this.button) {
        const buttons = document.querySelectorAll('.obstructdrag');
        buttons.forEach(button => {
            button.addEventListener('mousedown', this.setButtonActive.bind(this));
            button.addEventListener('mouseup', this.setButtonInactive.bind(this));
        });
      }
    }
  
    setButtonActive() {
      this.buttonIsActive = true;
    }
  
    setButtonInactive() {
      this.buttonIsActive = false;
    }
  
    startDrag(event) {
        this.isDragging = true;
        this.offsetX = event.clientX - this.element.getBoundingClientRect().left;
        this.offsetY = event.clientY - this.element.getBoundingClientRect().top;
        this.element.style.position = 'absolute'; // Set CSS position to 'absolute'
      
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        document.addEventListener('mouseup', this.setButtonInactive.bind(this)); // Add this line to ensure setButtonInactive is always called
      }
  
    drag(event) {
      if (this.isDragging && (!this.button || !this.buttonIsActive)) { // Check if the button is not active or doesn't exist
        this.element.style.left = (event.clientX - this.offsetX) + 'px';
        this.element.style.top = (event.clientY - this.offsetY) + 'px';
      }
    }
  
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.drag.bind(this));
      document.removeEventListener('mouseup', this.stopDrag.bind(this));
    }
  }
  
  const draggable = document.querySelectorAll('.draggable');
  draggable.forEach(draggable => {
    new Draggable(draggable);
  });

//export - step1
function exreturn(id,name) {
  cname = name + "-properties"
  return document.getElementsByClassName(cname)[id].value;
}

function exportcode() {
  document.getElementsByClassName("export-properties")[0].value = "";
  document.getElementsByClassName("export-properties")[0].value = exportTankDefinition(exreturn(1,"export"),exreturn(3,"export"),exreturn(2,"export"),Tank.guns);
}

function exportTankDefinition(tankName, parent, label, guns) {
  let recon = [];
  guns.forEach((gun, index) => {
    const angle = gun.angle - 90;
    const gunString = `{
      POSITION: [${gun.length / 2}, ${gun.width / 2}, 1, ${gun.x / 2}, ${gun.y / 2}, ${angle}, ${gun.firedelay}],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.basic]),
        TYPE: ${gun.type},
      }
    }`;
    if (index < guns.length - 1) {
      recon.push(gunString + ',');
    } else {
      recon.push(gunString);
    }
  });

  const gunsString = recon.join('\n');

  const tankDefinition = `exports.${tankName} = {
    PARENT: [exports.${parent}],
    LABEL: '${label}',
    GUNS: [
      ${gunsString}
    ]
  };`;

  return tankDefinition;
}
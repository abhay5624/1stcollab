const button = document.getElementById("button");
var disabled = false;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let cx = ctx.canvas.width / 2;
let cy = ctx.canvas.height / 2;

// add Confetti/Sequince objects to arrays to draw them
let confetti = [];
let sequins = [];

// ammount to add on each button press
const confettiCount = 20;
const sequinCount = 10;

// "physics" variables
const gravityConfetti = 0.3;
const gravitySequins = 0.55;
const dragConfetti = 0.075;
const dragSequins = 0.02;
const terminalVelocity = 3;

// colors, back side is darker for confetti flipping
const colors = [
  { front: "#7b5cff", back: "#6245e0" }, // Purple
  { front: "#b3c7ff", back: "#8fa5e5" }, // Light Blue
  { front: "#5c86ff", back: "#345dd1" }, // Darker Blue
];

// helper function to pick a random number within a range
randomRange = (min, max) => Math.random() * (max - min) + min;

// helper function to get initial velocities for confetti
// this weighted spread helps the confetti look more realistic
initConfettoVelocity = (xRange, yRange) => {
  const x = randomRange(xRange[0], xRange[1]);
  const range = yRange[1] - yRange[0] + 1;
  let y =
    yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
  if (y >= yRange[1] - 1) {
    // Occasional confetto goes higher than the max
    y += Math.random() < 0.25 ? randomRange(1, 3) : 0;
  }
  return { x: x, y: -y };
};

// Confetto Class
function Confetto() {
  this.randomModifier = randomRange(0, 99);
  this.color = colors[Math.floor(randomRange(0, colors.length))];
  this.dimensions = {
    x: randomRange(5, 9),
    y: randomRange(8, 15),
  };
  this.position = {
    x: randomRange(
      canvas.width / 2 - button.offsetWidth / 4,
      canvas.width / 2 + button.offsetWidth / 4
    ),
    y: randomRange(
      canvas.height / 2 + button.offsetHeight / 2 + 8,
      canvas.height / 2 + 1.5 * button.offsetHeight - 8
    ),
  };
  this.rotation = randomRange(0, 2 * Math.PI);
  this.scale = {
    x: 1,
    y: 1,
  };
  this.velocity = initConfettoVelocity([-9, 9], [6, 11]);
}
Confetto.prototype.update = function () {
  // apply forces to velocity
  this.velocity.x -= this.velocity.x * dragConfetti;
  this.velocity.y = Math.min(
    this.velocity.y + gravityConfetti,
    terminalVelocity
  );
  this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

  // set position
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // spin confetto by scaling y and set the color, .09 just slows cosine frequency
  this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
};

// Sequin Class
function Sequin() {
  (this.color = colors[Math.floor(randomRange(0, colors.length))].back),
    (this.radius = randomRange(1, 2)),
    (this.position = {
      x: randomRange(
        canvas.width / 2 - button.offsetWidth / 3,
        canvas.width / 2 + button.offsetWidth / 3
      ),
      y: randomRange(
        canvas.height / 2 + button.offsetHeight / 2 + 8,
        canvas.height / 2 + 1.5 * button.offsetHeight - 8
      ),
    }),
    (this.velocity = {
      x: randomRange(-6, 6),
      y: randomRange(-8, -12),
    });
}
Sequin.prototype.update = function () {
  // apply forces to velocity
  this.velocity.x -= this.velocity.x * dragSequins;
  this.velocity.y = this.velocity.y + gravitySequins;

  // set position
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
};

// add elements to arrays to be drawn
initBurst = () => {
  for (let i = 0; i < confettiCount; i++) {
    confetti.push(new Confetto());
  }
  for (let i = 0; i < sequinCount; i++) {
    sequins.push(new Sequin());
  }
};

// draws the elements on the canvas
render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confetti.forEach((confetto, index) => {
    let width = confetto.dimensions.x * confetto.scale.x;
    let height = confetto.dimensions.y * confetto.scale.y;

    // move canvas to position and rotate
    ctx.translate(confetto.position.x, confetto.position.y);
    ctx.rotate(confetto.rotation);

    // update confetto "physics" values
    confetto.update();

    // get front or back fill color
    ctx.fillStyle =
      confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

    // draw confetto
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // clear rectangle where button cuts off
    if (confetto.velocity.y < 0) {
      ctx.clearRect(
        canvas.width / 2 - button.offsetWidth / 2,
        canvas.height / 2 + button.offsetHeight / 2,
        button.offsetWidth,
        button.offsetHeight
      );
    }
  });

  sequins.forEach((sequin, index) => {
    // move canvas to position
    ctx.translate(sequin.position.x, sequin.position.y);

    // update sequin "physics" values
    sequin.update();

    // set the color
    ctx.fillStyle = sequin.color;

    // draw sequin
    ctx.beginPath();
    ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
    ctx.fill();

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // clear rectangle where button cuts off
    if (sequin.velocity.y < 0) {
      ctx.clearRect(
        canvas.width / 2 - button.offsetWidth / 2,
        canvas.height / 2 + button.offsetHeight / 2,
        button.offsetWidth,
        button.offsetHeight
      );
    }
  });

  // remove confetti and sequins that fall off the screen
  // must be done in seperate loops to avoid noticeable flickering
  confetti.forEach((confetto, index) => {
    if (confetto.position.y >= canvas.height) confetti.splice(index, 1);
  });
  sequins.forEach((sequin, index) => {
    if (sequin.position.y >= canvas.height) sequins.splice(index, 1);
  });

  window.requestAnimationFrame(render);
};

// cycle through button states when clicked
clickButton = () => {
  if (!disabled) {
    disabled = true;
    // Loading stage
    button.classList.add("loading");
    button.classList.remove("ready");
    setTimeout(() => {
      // Completed stage
      button.classList.add("complete");
      button.classList.remove("loading");
      setTimeout(() => {
        window.initBurst();
        setTimeout(() => {
          // Reset button so user can select it again
          disabled = false;
          button.classList.add("ready");
          button.classList.remove("complete");
        }, 4000);
      }, 320);
    }, 1800);
  }
};

// re-init canvas if the window size changes
resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cx = ctx.canvas.width / 2;
  cy = ctx.canvas.height / 2;
};

// resize listenter
window.addEventListener("resize", () => {
  resizeCanvas();
});

// click button on spacebar or return keypress
document.body.onkeyup = (e) => {
  if (e.keyCode == 13 || e.keyCode == 32) {
    clickButton();
  }
};

// Set up button text transition timings on page load
textElements = button.querySelectorAll(".button-text");
textElements.forEach((element) => {
  characters = element.innerText.split("");
  let characterHTML = "";
  characters.forEach((letter, index) => {
    characterHTML += `<span class="char${index}" style="--d:${
      index * 30
    }ms; --dr:${(characters.length - index - 1) * 30}ms;">${letter}</span>`;
  });
  element.innerHTML = characterHTML;
});

// kick off the render loop
render();


// declaring Dom Element


//our partner text
const partner = document.querySelector(".ttt");
//about us 1st line 
const line1 = document.querySelector(".line1");
//about us 2nd line
const line2 = document.querySelector(".line2");
//about us 3rd line
const line3 = document.querySelector(".line3");
//its header of web
const header = document.querySelector("header");
//its image logo
const logo = document.querySelector(".logo");
//its text logo
const txtlogo = document.querySelector(".txtlogo");
//its header child like link of home anout etc
const headerchild = Array.from(header.children[1].children);
//its iteams section means the area where item is declared
const items = document.querySelector(".items");
// its arrary of single item in item section
const item = Array.from(items.children);


// adding animation on scroll

function screenanimation() {

  //this if for checking screen width 


  // adding scroll animation for pc


if (screen.width > 500) {
// Eventlistenener for scroll action



  window.addEventListener("scroll", () => {


    //animation if scroll less  than 400
    if (pageYOffset < 400) {
      partner.style.position = "relative";
      logo.style.animationName = "appear";
      txtlogo.style.color = "white";
      header.style.animationName = "reversebackground";
      txtlogo.style.animationName = "moveright";
      headerchild.forEach((child) => {
        child.style.color = "white";
        child.style.opacity = "1";
      });
    }


    // if scroll more than 400 and less than 1000



     else if (pageYOffset > 400 && pageYOffset < 1000) {
      if (pageYOffset > 500) {
        let delay = 0;
        partner.style.position = "relative";
        item.forEach((product) => {
          console.log("its works");
          product.style.animationName = "rotate";
          product.style.animationDelay = `${delay}s`;
          delay = delay + 0.3;
        });
      }
      if (pageYOffset > 900) {
        console.log(partner);
        partner.style.position = "fixed";
        partner.style.top = "55px";
        partner.style.zindex = "88";
        partner.style.textAlign = "center";
      }
      logo.style.animationName = "disappear";
      header.style.animationName = "backgroundcolorchange";
      txtlogo.style.animationName = "moveleft";
      txtlogo.style.opacity = "1";
      line1.style.animationName = "";
      line2.style.animationName = "";
      line3.style.animationName = "";
      headerchild.forEach((child) => {
        child.style.color = "black";
        child.style.fontFamily = "cursive";
        child.style.opacity = "1";
      });
    }
    
    
    else if (pageYOffset > 1000 && pageYOffset < 1750) {
      item.forEach((product) => {
        console.log("its works");
        product.style.animationName = "rotate";
        product.style.animationDelay = `${delay}s`;
        delay = delay + 0.3;
      });
      partner.style.position = "relative";
      header.style.animationName = "backgroundcolorchange2";
      txtlogo.style.animationName = "";
      txtlogo.style.opacity = "0";
      headerchild.forEach((child) => {
        child.style.opacity = "0";
      });
    } else if (pageYOffset > 1750 && pageYOffset < 2525) {
      if (pageYOffset == 2000) {
        partner.style.position = "relative";
      }
      txtlogo.style.opacity = "1";
      console.log("its works");
      txtlogo.style.color = "white";
      line1.style.animationName = "";
      line2.style.animationName = "";
      line3.style.animationName = "";
    } else if (pageYOffset > 2525) {
      line1.style.animationName = "animateline1";
      line2.style.animationName = "animateline2";
      line3.style.animationName = "animateline3";
    }
  });
}


// for mobile view
else{
  window.addEventListener("scroll", () => {


console.log(pageYOffset);



    //animation if scroll less  than 400
    if (pageYOffset < 400) {
      partner.style.position = "relative";
      logo.style.animationName = "appear";
      txtlogo.style.color = "white";
      header.style.animationName = "reversebackground";
      txtlogo.style.animationName = "moveright";
      headerchild.forEach((child) => {
        child.style.color = "white";
        child.style.opacity = "1";
      });
    }


    // if scroll more than 400 and less than 1000



     else if (pageYOffset > 400 && pageYOffset < 1000) {
      if (pageYOffset > 400) {
        partner.style.position = "relative";
        let delay = 0;
       
        item.forEach((product) => {
          console.log("its works");
          product.style.animationName = "rotate";
          product.style.animationDelay = `${delay}s`;
          delay = delay + 0.3;
        });
      }
     
      logo.style.animationName = "disappear";
      header.style.animationName = "backgroundcolorchange";
      txtlogo.style.animationName = "moveleft";
      txtlogo.style.opacity = "1";
      line1.style.animationName = "";
      line2.style.animationName = "";
      line3.style.animationName = "";
      headerchild.forEach((child) => {
        child.style.color = "black";
        child.style.fontFamily = "cursive";
        child.style.opacity = "1";
      });
    }
// if get scroll more than 2400
else if (pageYOffset > 2400) {
  txtlogo.style.color = `white`
  partner.style.position = "relative";
 }

  })

}

}
screenanimation();
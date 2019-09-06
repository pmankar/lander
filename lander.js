var height = 600, width = 800;
var G = 0.020;
var indeg = Math.PI / 180;
var ship = {
    h: 20,  // height
    w: 20,  // width
    x: width / 2,   // curr pos x
    y: 220,     // curr pos y
    vy: 0,  // vel in y dir
    vx: 0,  // vel in x dir
    color: "blue",  // starting color
    rot: 0,     // rotation
    rotmax: 90,
    thrust: {
        v: 15 * G,   // vertical thrust vel
        r: 5       // rotational thrust
    }
};

// main svg
var svg = d3.select("body")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .style("background", "#6395ec");


var mtxtpos = svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .attr("fill", "brown");

var mtxtvel = svg.append("text")
    .attr("x", 20)
    .attr("y", 50)
    .attr("fill", "brown");

var mtxttd = svg.append("text")
    .attr("x", 20)
    .attr("y", 80)
    .attr("fill", "brown");

var mtxtrot = svg.append("text")
    .attr("x", 20)
    .attr("y", 110)
    .attr("fill", "brown");

// create the ship
var shp = svg.append("g").append("rect")
    .attr("height", ship.h)
    .attr("width", ship.w)
    .attr("x", ship.x)
    .attr("y", ship.y)
    .style("fill", ship.color);

// bounding box function
function bounding() {
    if (ship.y + ship.h >= height) {
        ship['impact'] = ship['impact'] ? ship['impact'] : ship.vy;
        mtxttd.text("Impact at: " + ship['impact'].toFixed(4));
        ship.y = height - ship.h;
        ship.vy = 0;
        ship.vx = 0;
    } else {
        ship['impact'] ? delete ship['impact'] : null;
        mtxttd.text("FLOATING");
    }
    if (ship.x + ship.w > width) {
        ship.x = width - ship.w;
        ship.vx = 0;
    }
    if (ship.x < 0) {
        ship.x = 0;
        ship.vx = 0;
    }
    if (ship.y < 0) {
        ship.y = 0;
        ship.vy = 0;
    }
}
// update lander position
function update() {
    ship.y += ship.vy;
    ship.x += ship.vx;
    ship.vy += G
    cx = ship.x + ship.h / 2
    cy = ship.y + ship.w / 2
    shp.attr("y", ship.y)
        .attr("x", ship.x)
        .attr("transform", "rotate(" + ship.rot + ", " + cx + ", " + cy + ")")
        .style("fill", ship.color);
    bounding();
    var new_color = ship.vy < 0 ? "yellow" : "blue";
    if (ship.color !== new_color) {
        shp.style("fill", new_color);
        ship.color = new_color;
    }
    // bounces
    /*
    if (ship.y + ship.h > height) {
        if(ship.vy < 0.25) {
            ship.vy = 0;
            return; // no more bounces
        };
        console.log(ship.vy)
        ship.y = height - ship.h;
        ship.vy *= -(0.8);
    };
    */
    // write meta info
    mtxtpos.text("x:" + ship.x.toFixed(1) + "   y:" + ship.y.toFixed(1));
    mtxtvel.text("vy:" + ship.vy.toFixed(2) + "   vx:" + ship.vx.toFixed(2));
    mtxtrot.text("Rot:" + ship.rot.toFixed(2));
}

setInterval(update, 1000 / 60); // fps

d3.select("body")
    .on("keydown", function (f, w) {
        move(d3.event.keyCode);
    });

// move in a give dir, with p % of max thrust. default p = 1 = pmax
function move(dircode, p) {
    var hr = { 37: "l", 38: "u", 39: "r" };
    direction = hr[dircode];
    if (p === undefined) p = 1;
    if (p > 1) p = 1;
    if (dircode === 38) {
        let tvx = Math.sin(indeg * ship.rot);
        let tvy = Math.cos(indeg * ship.rot);
        console.log(ship.rot, tvy, tvx);
        ship.y -= ship.thrust.v * p * tvy;
        ship.vy -= ship.thrust.v * p * tvy;
        ship.x += ship.thrust.v * p * tvx;
        ship.vx += ship.thrust.v * p * tvx;
        shp.style("fill", "orange");
    } else {
        // rotation << 37 is -ve and 39 is +ve >>
        if (dircode === 37 || dircode === 39) {
            delta = dircode - 38;
            if (Math.abs(ship.rot + (delta * ship.thrust.r)) > ship.rotmax) return;
            ship.rot = ship.rot + (delta * ship.thrust.r)                    
            shp.style("fill", "orange");
        }
    }
    if (dircode === 13) {
        window.location.reload();
    }
}
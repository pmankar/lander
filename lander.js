var height = 600, width = 800;
var G = 0.020;
var indeg = Math.PI / 180;
var fps = 60;
var timer = { id: null, active: false };
var ship = {
    x: width / 2,   // curr pos x
    y: 0,     // curr pos y
    vy: 0,  // vel in y dir
    vx: 0,  // vel in x dir
    ignited: false, // is engine ignited
    rot: 0,     // rotation
    rotmax: 90,
    thrust: {
        v: 15 * G,   // vertical thrust vel
        r: 5       // rotational thrust
    }
};

var mtxtpos;
var mtxtvel;
var mtxttd;
var mtxtrot;
var txttmr;
var shp;
var flame_thrust;

// initialize scene
(function init() {
    // main svg
    var svg = d3.select("body")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .style("background", "#6395ec");

    var metainfo = svg.append("g");

    mtxtpos = metainfo.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .attr("fill", "brown");

    mtxtvel = metainfo.append("text")
        .attr("x", 20)
        .attr("y", 50)
        .attr("fill", "brown");

    mtxttd = metainfo.append("text")
        .attr("x", 20)
        .attr("y", 80)
        .attr("fill", "brown");

    mtxtrot = metainfo.append("text")
        .attr("x", 20)
        .attr("y", 110)
        .attr("fill", "brown");

    mtxttmr = metainfo.append("text")
        .attr("x", width / 2.1)
        .attr("y", 50)
        .attr("fill", "black");

    // create the ship
    shp = svg.append("g");
    
    d3.xml("models/lm_002.svg").then(function (d) {
        shp.html(d3.select(d).select("#lm_bbox").node().outerHTML);
        ship.h = shp.node().getBoundingClientRect().height;
        ship.w = shp.node().getBoundingClientRect().width;
        toggleTimer();
        flame_thrust = d3.select("#flame_thrust");
    });
})();

// pause / play
function toggleTimer() {
    mtxttmr.text("");
    if (timer["active"]) {
        clearInterval(timer["id"]);
        mtxttmr.text("PAUSED");
    } else {
        timer["id"] = setInterval(update, 1000 / fps); // fps
    }
    timer["active"] = !timer["active"];
}

// bounding box function
function bounding() {
    if (ship.y + ship.h >= height) {
        ship['impact'] = ship['impact'] ? ship['impact'] : ship.vy;
        mtxttd.text("Landing speed : " + ship['impact'].toFixed(4));
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
    ship.a = ship.vy;
    ship.y += ship.vy;
    ship.x += ship.vx;
    ship.vy += G
    shp.attr("transform", "translate( " + ship.x + "," + ship.y + " ) rotate(" + ship.rot + ", " + (ship.h / 2) + ", " + (ship.w / 2) + ")");
    bounding();
    
    // write meta info
    mtxtpos.text("x:" + ship.x.toFixed(1) + "   y:" + ship.y.toFixed(1));
    mtxtvel.text("vy:" + ship.vy.toFixed(2) + "   vx:" + ship.vx.toFixed(2));
    mtxtrot.text("Rot:" + ship.rot.toFixed(2));
}



d3.select("body")
    .on("keydown", function (f, w) {
        move(d3.event.keyCode);
        if (d3.event.keyCode === 83 || d3.event.keyCode === 80 || d3.event.keyCode === 32) // for char S|P|<space> -- toggles the timer
            toggleTimer();
    })
    .on("keyup", function(f, w){
        if (!timer["active"]) return;
        flame_thrust.transition().attr("transform", "scale(3,0)");
    });

// move in a give dir, with p % of max thrust. default p = 1 = pmax
function move(dircode, p) {
    if (!timer["active"]) return;
    var hr = { 37: "l", 38: "u", 39: "r" };
    direction = hr[dircode];
    if (p === undefined) p = 1;
    if (p > 1) p = 1;
    if (dircode === 38) {
        let tvx = Math.sin(indeg * ship.rot);
        let tvy = Math.cos(indeg * ship.rot);
        ship.y -= ship.thrust.v * p * tvy;
        ship.vy -= ship.thrust.v * p * tvy;
        ship.x += ship.thrust.v * p * tvx;
        ship.vx += ship.thrust.v * p * tvx;
        flame_thrust.transition().attr("transform", "scale(3,2.5)");
    } else {
        // rotation << 37 is -ve and 39 is +ve >>
        if (dircode === 37 || dircode === 39) {
            delta = dircode - 38;
            if (Math.abs(ship.rot + (delta * ship.thrust.r)) > ship.rotmax) return;
            ship.rot = ship.rot + (delta * ship.thrust.r)
        }
    }
    if (dircode === 13) {
        window.location.reload();
    }
}

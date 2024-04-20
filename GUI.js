let map;
let components = [];
let draggingIndex = null;
let draggingDirection = null;
let offsetX, offsetY;
let placedComponents = { mainCharacter: 0, targetSun: 0, wall: 0 };
let rightSideBarComponents = [];

function setup() {
    createCanvas(800, 480);
    background(17, 180, 255);
    map = { x: 0, y: 0, width: 640, height: 480 }; // Game map dimensions and position

    // Load images and set their intended display size
    rightSideBarComponents = [
        { type: 'mainCharacter', imgPath: 'GuiMedia/lebron.bmp', img: null, width: 65, height: 65, x: 650, y: 20 },
        { type: 'targetSun', imgPath: 'GuiMedia/sun.bmp', img: null, width: 40, height: 35, x: 650, y: 120 },
        { type: 'wall', imgPath: 'GuiMedia/tree.bmp', img: null, width: 40, height: 35, x: 650, y: 190 }
    ];

    // Load images asynchronously
    rightSideBarComponents.forEach((comp, i) => {
        comp.img = loadImage(comp.imgPath, () => {
            console.log(comp.type + " image loaded successfully");
        });
    });

    resetButton = createButton('Reset Map');
    resetButton.position(660, 490);
    resetButton.mousePressed(resetMap);

    generateButton = createButton('Save Map');
    generateButton.position(660, 540);
    generateButton.mousePressed(generateJSON);
    //due to the title and instruction the buttons are pushed down for some reasons, but does not affect the json.
}


function draw() {
    background(200);
    fill(17, 180, 255);
    rect(map.x, map.y, map.width, map.height);

    // Draw resized images
    rightSideBarComponents.forEach(comp => {
        if (comp.img) {
            image(comp.img, comp.x, comp.y, comp.width, comp.height);
        }
    });

    components.forEach(comp => {
        if (comp.img) {
            image(comp.img, comp.x, comp.y, comp.width, comp.height);
        }
    });

    if (draggingIndex !== null && draggingDirection !== null) {
        if (draggingDirection === 1) {
            image(rightSideBarComponents[draggingIndex].img, mouseX + offsetX, mouseY + offsetY, rightSideBarComponents[draggingIndex].width, rightSideBarComponents[draggingIndex].height);
        } else {
            image(components[draggingIndex].img, mouseX + offsetX, mouseY + offsetY, components[draggingIndex].width, components[draggingIndex].height);
        }
    }
}


function mousePressed() {
    if (mouseX > 640) {
        for (let i = 0; i < rightSideBarComponents.length; i++) {
            let comp = rightSideBarComponents[i];
            if (mouseX > comp.x && mouseX < comp.x + comp.width &&
                mouseY > comp.y && mouseY < comp.y + comp.height) {
                draggingIndex = i;
                draggingDirection = 1;
                offsetX = comp.x - mouseX;
                offsetY = comp.y - mouseY;
                return;
            }
        }
    } else {
        for (let i = 0; i < components.length; i++) {
            let comp = components[i];
            if (mouseX > comp.x && mouseX < comp.x + comp.width &&
                mouseY > comp.y && mouseY < comp.y + comp.height) {
                draggingIndex = i;
                draggingDirection = -1;
                offsetX = comp.x - mouseX;
                offsetY = comp.y - mouseY;
                return;
            }
        }
    }
}

function mouseReleased() {
    if (draggingDirection === 1) {
        if (mouseX < map.width && mouseY < map.height) {
            if (isValidPlacement(rightSideBarComponents[draggingIndex].type)) {
                placedComponents[rightSideBarComponents[draggingIndex].type]++;
                components.push({ ...rightSideBarComponents[draggingIndex], x: mouseX + offsetX, y: mouseY + offsetY });
            }
        }
        draggingDirection = null;
        draggingIndex = null;
        offsetX = 0;
        offsetY = 0;
        return;
    } else if (draggingDirection === -1) {
        if (mouseX > map.width) {
            placedComponents[components[draggingIndex].type] = Math.max(0, placedComponents[components[draggingIndex].type] - 1);
            components.splice(draggingIndex, 1);
        } else {
            components[draggingIndex].x = mouseX + offsetX;
            components[draggingIndex].y = mouseY + offsetY;
        }
        draggingDirection = null;
        draggingIndex = null;
        offsetX = 0;
        offsetY = 0;
    }
}

function isValidPlacement(type) {
    switch (type) {
        case 'mainCharacter':
            return placedComponents.mainCharacter < 1;
        case 'targetSun':
            return placedComponents.targetSun < 1;
        case 'wall':
            return true;
        default:
            return false;
    }
}

function resetMap() {
    placedComponents = { mainCharacter: 0, targetSun: 0, wall: 0 };
    components = components.filter(comp => comp.x >= 650);
}

function generateJSON() {
    let placedComponents = components.filter(comp => {
        return comp.x >= map.x && comp.x + comp.width <= map.x + map.width &&
            comp.y >= map.y && comp.y + comp.height <= map.y + map.height;
    });

    let data = {
        placedComponents: placedComponents.map(comp => ({
            type: comp.type,
            x: comp.x - map.x,
            y: comp.y - map.y
        }))
    };

    let jsonString = JSON.stringify(data, null, 2);
    let blob = new Blob([jsonString], { type: 'application/json' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

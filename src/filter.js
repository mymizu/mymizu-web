// Change State hook of App to change the markers on the map

import axios from "axios";

let buttonValue = {
    Distance: false,
    Rating: false,
    Name: false,
    Partner: false,
    Public: false,
    Spring: false,
    Cold: false,
    Hot: false,
    Filtered: false,
    Tap: false,
    Yourself: false,
    Staff: false,
    WiFi: false,
    Toilet: false,
    Accessible: false,
    Space: false,
}

let position = {};

export function createFilter(map, maps) {
    const bounds = map.getBounds();
    position = {
        c1: bounds.getNorthEast().lat(),
        c2: bounds.getSouthWest().lng(),
        c4: bounds.getSouthWest().lat(),
        c3: bounds.getNorthEast().lng(),
    }
    let clickBool = false;
    let control = document.createElement('div');
    const filterButtonUI = menuButtonUi();
    control.appendChild(filterButtonUI);
    map.controls[maps.ControlPosition.RIGHT_BOTTOM].push(control);


    const filterBoxDiv = document.createElement("div");
    filterBoxDiv.style.visibility = "hidden";

    const filterUI = filterBoxUi(clickBool, filterBoxDiv);
    filterParametersUi(filterUI);

    filterBoxDiv.appendChild(filterUI);
    map.controls[maps.ControlPosition.TOP_LEFT].push(filterBoxDiv);

    filterButtonUI.addEventListener("click", () => {
        if (!clickBool) {
            filterBoxDiv.style.visibility = "visible";
            filterUI.style.visibility = "visible";
            clickBool = !clickBool;
        } else {
            filterBoxDiv.style.visibility = "hidden";
            filterUI.style.visibility = "hidden";
            clickBool = !clickBool;
        }
    });
}

function menuButtonUi() {
    // Button UI
    const divButton = document.createElement("div");
    divButton.id = "filter";
    divButton.style.backgroundColor = "#F2F2F2";
    divButton.style.height = "40px";
    divButton.style.width = "40px";
    divButton.style.borderRadius = "50%";
    divButton.style.marginRight = "10px";
    divButton.style.display = "inline-block";

    // Button Image
    const imgButton = document.createElement("img");
    imgButton.id = "filterText";
    imgButton.style.height = "24px";
    imgButton.style.width = "24px";
    imgButton.style.marginTop = "7px";
    imgButton.style.marginLeft = "8px";
    imgButton.src = "/public/images/Vector.png";
    divButton.appendChild(imgButton);

    return divButton;
}

function filterBoxUi(clickBool, filterBoxDiv) {
    const filterUI = document.createElement("div");
    filterUI.title = "Filter";
    filterUI.style.backgroundColor = "#fff";
    filterUI.style.border = "2px solid #fff";
    filterUI.style.borderRadius = "10px";
    filterUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    filterUI.style.cursor = "pointer";
    filterUI.style.marginTop = "30px";
    filterUI.style.marginLeft = "30px";
    filterUI.style.height = "480px";
    filterUI.style.width = "350px";
    filterUI.style.visibility = "hidden";

    const topMenu = document.createElement("div");
    topMenu.style.display = "flex";
    topMenu.style.justifyContent = "center";

    const filterBoxTitle = filterTitle();
    const crossButton = document.createElement("img");
    crossButton.src = "/public/images/cross.png";
    crossButton.style.height = "24px";
    crossButton.style.width = "24px";

    topMenu.appendChild(filterBoxTitle);
    topMenu.appendChild(crossButton);
    filterUI.appendChild(topMenu);

    crossButton.addEventListener("click", () => {
        if (!clickBool) {
            filterBoxDiv.style.visibility = "visible";
            filterUI.style.visibility = "visible";
            clickBool = !clickBool;
        } else {
            filterBoxDiv.style.visibility = "hidden";
            filterUI.style.visibility = "hidden";
            clickBool = !clickBool;
        }
    });
    return filterUI;
}

function filterTitle() {
    // Title of the Box

    const filterBoxTitle = document.createElement("div");
    filterBoxTitle.innerHTML = "Filters";
    filterBoxTitle.style.color = "rgb(25,25,25)";
    filterBoxTitle.style.fontFamily = "Roboto,Arial,sans-serif";
    filterBoxTitle.style.fontSize = "16px";
    filterBoxTitle.style.lineHeight = "38px";
    filterBoxTitle.style.paddingLeft = "50px";
    filterBoxTitle.style.paddingRight = "50px";
    filterBoxTitle.style.textAlign = "center"
    return filterBoxTitle;
}

function filterParametersUi(filterUI) {
    filterCategory("Sort", ["By Distance", "By Rating", "By Name"], filterUI);
    filterCategory("Type of Refill Spot", ["Refill Partner", "Public", "Natural Spring"], filterUI);
    filterCategory("Type of Water", ["Cold", "Hot", "Filtered", "Tap"], filterUI);
    filterCategory("How to Refill", ["Help Yourself", "Ask Staff"], filterUI);
    filterCategory("Other", ["WiFi", "Toilet", "Wheel-Chair Accessible", "Rest Space"], filterUI);

    const ApplyButton = filterApply("Apply");
    filterUI.appendChild(ApplyButton);
}

function filterCategory(text, values, Ui) {
    const fText = filterText(text);
    const fBox = filterButtonRowUi(values);
    Ui.appendChild(fText);
    Ui.appendChild(fBox);
}

function filterText(text) {
    // Name Category

    const filterText = document.createElement("div");
    filterText.innerHTML = text;
    filterText.style.color = "rgb(25,25,25)";
    filterText.style.fontFamily = "IBM Plex Sans";
    filterText.style.fontStyle = "normal";
    filterText.style.fontWeight = "700";
    filterText.style.fontSize = "16px";
    filterText.style.lineHeight = "21px";
    filterText.style.marginLeft = "25px";
    return filterText;
}

function filterButtonRowUi(buttons) {
    const filterUI = document.createElement("div");
    filterUI.style.display = "flex";
    filterUI.style.justifyContent = "center";
    for (let button of buttons) {
        const fButton = filterButton(button);
        filterUI.appendChild(fButton);
    }
    return filterUI;
}

function filterButton(text) {
    // Button

    const filterButton = document.createElement("div");

    filterButton.innerHTML = text;
    filterButton.style.background = "#F2F2F2";
    filterButton.style.color = "#333333";
    filterButton.style.borderRadius = "100px";
    filterButton.style.width = "80px";
    filterButton.style.height = "32px";
    filterButton.style.marginBottom = "20px";
    filterButton.style.marginTop = "6px";
    filterButton.style.marginLeft = "10px";
    filterButton.style.display = "flex";
    filterButton.style.flexDirection = "row";
    filterButton.style.justifyContent = "center";
    filterButton.style.alignItems = "center";
    filterButton.style.fontFamily = "Futura PT";

    filterButton.addEventListener("click", () => {
        const words = text.split(' ');
        buttonValue[words[words.length - 1]] = !buttonValue[words[words.length - 1]];
        if (buttonValue[words[words.length - 1]]) {
            filterButton.style.background = "#E6F4FD";
            filterButton.style.color = "#2F97D1";
        } else {
            filterButton.style.background = "#F2F2F2";
            filterButton.style.color = "#333333";
        }
    });
    return filterButton;
}


function filterApply(text) {
    const ApplyButton = document.createElement("div");
    ApplyButton.innerHTML = text;
    ApplyButton.style.textAlign = "center";
    ApplyButton.style.backgroundColor = "#FFFFFF";
    ApplyButton.style.border = "1px solid #77CCFF";
    ApplyButton.style.borderRadius = "100px";
    ApplyButton.style.marginTop = "5px";
    ApplyButton.style.marginLeft = "10px";
    ApplyButton.style.fontFamily = "Futura PT";
    ApplyButton.style.fontStyle = "normal";
    ApplyButton.style.color = "#2F97D1";
    ApplyButton.style.width = "100px";
    ApplyButton.style.height = "32px";
    ApplyButton.style.position = "absolute";
    ApplyButton.style.top = "89%";
    ApplyButton.style.left = "38%";

    ApplyButton.addEventListener("click", async () => {
        const keys = Object.keys(buttonValue);
        const values = keys.filter(function (key) {
            return buttonValue[key]
        });
        console.log(values);
        const places = ['Cold', 'Rest Space'];
        const test = await axios.post("/filters-params", {} ,{ params: {position, places}});
    });
    return ApplyButton;
}
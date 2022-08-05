// Add Place Filter

import axios from "axios";

let buttonValue = {
    Spring: false,
    Public: false,
    Partner: false,
    Filtered: false,
    Hot: false,
    Cold: false,
    WiFi: false,
    Accessible: false,
    Tap: false,
    Beauty: false,
    Restaurant: false,
    Accommodation: false,
    Shop: false,
    Yourself: false,
    Staff: false,
}

const buttonTags = {
    Filtered: 1,
    Hot: 2,
    Cold: 3,
    WiFi: 4,
    Accessible: 5,
    Tap: 6,
    Beauty: 7,
    Restaurant: 8,
    Accommodation: 9,
    Shop: 10,
}

const buttonCategories = {
    Spring: 1,
    Public: [0, 2, 3],
    Partner: 4
}


let setPlaces;
let setMap;
let setMaps;
let clickBool = false;
let updateBool = false;

export function createFilter(map, maps, setTaps) {
    setMap = map;
    setMaps = maps;
    setPlaces = setTaps;

    let control = document.createElement('div');
    const filterButtonUI = menuButtonUi();
    control.appendChild(filterButtonUI);
    setMap.controls[maps.ControlPosition.RIGHT_BOTTOM].push(control);
    const filterBoxDiv = document.createElement("div");
    const filterUI = filterBoxUi(filterBoxDiv);
    filterParametersUi(filterUI);

    filterBoxDiv.appendChild(filterUI);

    filterButtonUI.addEventListener("click", () => {
        filteringMenuAction(filterBoxDiv)
    });

    // Update map when dragged
    const updateBoxDiv = document.createElement("div");
    const updateUI = updateBoxUI();
    updateBoxDiv.appendChild(updateUI);
    setMaps.event.addListener(map, 'dragend', async () => {
        if(!updateBool) {
            setMap.controls[setMaps.ControlPosition.TOP_CENTER].push(updateBoxDiv);
            updateBool = !updateBool;
        }
    });
    setMaps.event.addListener(map, 'zoom_changed', async () => {
        if(!updateBool) {
            setMap.controls[setMaps.ControlPosition.TOP_CENTER].push(updateBoxDiv);
            updateBool = !updateBool;
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

function filterBoxUi(filterBoxDiv) {
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
    filterUI.style.width = "300px";


    const topMenu = document.createElement("div");
    topMenu.style.display = "flex";
    topMenu.style.justifyContent = "center";

    const filterBoxTitle = filterTitle();
    const crossButton = document.createElement("img");
    crossButton.src = "/public/images/cross.png";
    crossButton.style.height = "24px";
    crossButton.style.width = "24px";
    crossButton.style.marginRight = "10px";
    crossButton.style.marginTop = "5px";

    topMenu.appendChild(filterBoxTitle);
    topMenu.appendChild(crossButton);
    filterUI.appendChild(topMenu);

    crossButton.addEventListener("click", () => {
        filteringMenuAction(filterBoxDiv);
    });
    return filterUI;
}

function filterTitle() {
    // Title of the Box

    const filterBoxTitle = document.createElement("div");
    filterBoxTitle.innerHTML = "Filters";
    filterBoxTitle.style.color = "rgb(25,25,25)";
    filterBoxTitle.style.fontSize = "18px";
    filterBoxTitle.style.lineHeight = "34px";
    filterBoxTitle.style.paddingLeft = "75px";
    filterBoxTitle.style.paddingRight = "50px";
    filterBoxTitle.style.textAlign = "center";
    filterBoxTitle.style.paddingTop = "2px";
    filterBoxTitle.style.flexGrow = 8;

    return filterBoxTitle;
}

function filterParametersUi(filterUI) {
    filterCategory("Type of Refill Spot", ["Refill Partner", "Public", "Natural Spring"], filterUI);
    filterCategory("Type of Water", ["Cold", "Hot", "Filtered", "Tap"], filterUI);
    filterCategory("How to Refill", ["Help Yourself", "Ask Staff"], filterUI);
    filterCategory("Other", ["WiFi", "Wheel-Chair Accessible"], filterUI);
    filterCategory("Business Type", ["Health/Beauty", "Cafe/Restaurant", "Hotel/Accommodation", "Store/Shop"], filterUI);

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
    filterText.style.fontFamily = "Roboto,Arial,sans-serif";
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
    filterUI.style.flexWrap = "wrap";
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
    filterButton.style.flexBasis = "auto";
    filterButton.style.flexShrink = 0;
    filterButton.style.padding = "15px";
    filterButton.style.height = "32px";
    filterButton.style.marginBottom = "10px";
    filterButton.style.marginTop = "6px";
    filterButton.style.marginLeft = "10px";
    filterButton.style.display = "flex";
    filterButton.style.flexDirection = "row";
    filterButton.style.justifyContent = "center";
    filterButton.style.alignItems = "center";
    filterButton.style.fontFamily = "Roboto,Arial,sans-serif";

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
    ApplyButton.style.fontFamily = "Roboto,Arial,sans-serif";
    ApplyButton.style.fontStyle = "normal";
    ApplyButton.style.fontSize = "16px";
    ApplyButton.style.color = "#2F97D1";
    ApplyButton.style.width = "80%";
    ApplyButton.style.marginLeft = "10%";
    ApplyButton.style.height = "32px";
    ApplyButton.style.paddingTop = "5px";
    ApplyButton.addEventListener("click", async () => {
        await updatePlaces();
        setMap.controls[setMaps.ControlPosition.TOP_LEFT].clear();
        clickBool = !clickBool;
    });
    return ApplyButton;
}

function filteringMenuAction(filterBoxDiv) {
    if (!clickBool) {
        setMap.controls[setMaps.ControlPosition.TOP_LEFT].push(filterBoxDiv);
        clickBool = !clickBool;
    } else {
        setMap.controls[setMaps.ControlPosition.TOP_LEFT].clear();
        clickBool = !clickBool;
    }
}

async function updatePlaces() {
    let places = "";
    let categories = "";
    const values = Object.keys(buttonValue).filter((key) => buttonValue[key]);
    const bounds = setMap.getBounds();
    position = {
        c1: bounds.getNorthEast().lat(),
        c2: bounds.getSouthWest().lng(),
        c3: bounds.getSouthWest().lat(),
        c4: bounds.getNorthEast().lng(),
    }
    for (let tags of values) {
        if (tags.includes('/')) tags = tags.split('/')[1];
        if (buttonTags.hasOwnProperty(tags))
            places += places.length === 0 ? buttonTags[tags] : `, ${buttonTags[tags]}`;
        else if (buttonCategories.hasOwnProperty(tags))
            categories += categories.length === 0 ? buttonCategories[tags] : `, ${buttonCategories[tags]}`;
    }
    let { data } = await axios.post("/filters-params", {}, { params: { position, places, categories } });
    console.log(data);
    if (values.includes('Staff')) {
        data = data.filter((key) => key.refill_instruction && key.refill_instruction.includes('staff'));
    } else if (values.includes('Yourself')) {
        data = data.filter((key) => !key.refill_instruction || !key.refill_instruction.includes('staff'));
    }
    setPlaces(data);
}

function updateBoxUI() {
    const UpdaterButton = document.createElement("div");
    UpdaterButton.innerHTML = "Search in this area";
    UpdaterButton.style.textAlign = "center";
    UpdaterButton.style.backgroundColor = "#FFFFFF";
    UpdaterButton.style.border = "1px solid #77CCFF";
    UpdaterButton.style.borderRadius = "100px";
    UpdaterButton.style.marginTop = "10px";
    UpdaterButton.style.fontFamily = "Roboto,Arial,sans-serif";
    UpdaterButton.style.fontStyle = "normal";
    UpdaterButton.style.fontSize = "16px";
    UpdaterButton.style.color = "#2F97D1";
    UpdaterButton.style.height = "32px";
    UpdaterButton.style.width = "150px";
    UpdaterButton.style.paddingTop = "5px";

    UpdaterButton.addEventListener("click", async () => {
        setMap.controls[setMaps.ControlPosition.TOP_CENTER].clear();
        updateBool = !updateBool;
        await updatePlaces();
    });
    return UpdaterButton;
}
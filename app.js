const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate")
const sliders = document.querySelectorAll(`input[type="range"]`)
const currentHexes = document.querySelectorAll(".color h2")
const popup = document.querySelector(".copy-container")
const adjustBtns = document.querySelectorAll(".adjust")
const lockBtns = document.querySelectorAll(".lock")
const closeBtns = document.querySelectorAll(".close-adjustment")
const sliderContainers = document.querySelectorAll(".sliders")
let initialColors;
let savedPalettes = [];

generateBtn.addEventListener("click",()=>{
    randomColors()
})

lockBtns.forEach((btn, index)=>{
    btn.addEventListener('click', ()=>{
      const div = colorDivs[index];
      div.classList.toggle('locked');
      if(div.classList.contains('locked')){
        btn.children[0].classList = 'fas fa-lock';
      }else{
        btn.children[0].classList = 'fas fa-lock-open';
      }
    })
  })

sliders.forEach(slider => {
    slider.addEventListener("input", hslControls)
})

colorDivs.forEach((div,index)=>{
    
    div.addEventListener("change",()=>{
        updateTextUI(index)
    })
})

currentHexes.forEach((hex) =>{
    hex.addEventListener("click",()=>{
        copyToClipboard(hex);
    })
})

popup.addEventListener("click",()=>{
    const popupBox = popup.children[0];
    popup.classList.remove("active")
    popupBox.classList.remove("active")
})

adjustBtns.forEach((btn,index)=>{
    btn.addEventListener("click",()=>{
        openAdjustmentPanel(index)
    })
})

closeBtns.forEach((btn,index)=>{
    btn.addEventListener("click",()=>{
        closeAdjustmentPanel(index)
    })
})


function generateHex(){
    // const letters = "0123456789ABCDEF"
    // let hash = "#"

    // for(let i = 0; i < 6; i++){
    //     hash += letters[Math.floor(Math.random()*16)]
    // }

    const hash = chroma.random();
    return hash
}

function randomColors(){

    initialColors = []



    colorDivs.forEach((div,index)=>{
        const hexText = div.children[0];
        const randomColor = generateHex()


        if(div.classList.contains("locked")){
            initialColors.push(hexText.innerText)
            return
        }else{
            initialColors.push(chroma(randomColor).hex())
        }


        const icons = div.querySelectorAll(".controls button")

        hexText.innerText = randomColor
        div.style.backgroundColor = randomColor

        checkTextContrast(randomColor,hexText)

        for(let icon of icons){
            checkTextContrast(randomColor,icon)
        }

        const color = chroma(randomColor)

        const sliders = div.querySelectorAll(".sliders input")
  
        const hue = sliders[0]
        const brightness = sliders[1]
        const saturation = sliders[2]
        

        colorizeSliders(color,hue,brightness,saturation)
    })

    resetInputs()

    
}

function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black"
    }else{
        text.style.color = "white"
    }
}

function colorizeSliders(color,hue,brightness,saturation){
    const noSat = color.set("hsl.s", 0)
    const fullSat = color.set("hsl.s", 1)
    const scaleSat = chroma.scale([noSat,color,fullSat])
    
    const midbright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midbright, "white"])


    saturation.style.background = `linear-gradient(to right,${scaleSat(0)}, ${scaleSat(1)})`
    brightness.style.background = `linear-gradient(to right,${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`
    hue.style.background = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`
}


function hslControls(e){
    const index = e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat")

   const sliders = e.target.parentElement.querySelectorAll(`input[type="range"]`)

   const hue = sliders[0]
   const brightness = sliders[1]
   const saturation = sliders[2]

   const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set("hsl.s",saturation.value)
    .set("hsl.h",hue.value)
    .set("hsl.l",brightness.value)
    

    colorDivs[index].style.backgroundColor = color;

    colorizeSliders(color,hue,brightness,saturation)
}

function updateTextUI(index){
   const activeDiv = colorDivs[index]
   const color = chroma(activeDiv.style.backgroundColor)
   const textHex = activeDiv.querySelector("h2")
   const icons = activeDiv.querySelectorAll(".controls button")
   textHex.innerText = color.hex()

   checkTextContrast(color,textHex)

   for(let icon of icons){
    checkTextContrast(color,icon)
   }
}

function resetInputs(){
    const sliders = document.querySelectorAll(".sliders input")
    sliders.forEach((slider,index)=>{
        if(slider.name === "hue"){
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0]
            slider.value = Math.floor(hueValue)
        }
        if(slider.name === "brightness"){
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2]
            slider.value = Math.floor(brightValue*100)/100
        }
        if(slider.name === "saturation"){
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1]
            slider.value = Math.floor(satValue*100)/100
        }
    })
}

function copyToClipboard(hex){
    const el = document.createElement("textarea")
    el.value = hex.innerText;
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el);
    
    const popupBox = popup.children[0]
   
    popup.classList.add("active")
    popupBox.classList.add("active")
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.add("active")
}

function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove("active")
}


//save palette

const saveBtn = document.querySelector(".save")
const submitSave = document.querySelector(".submit-save")
const saveContainer = document.querySelector(".save-container")
const saveInput = document.querySelector(".save-container input")
const savePopup = document.querySelector(".save-popup")
const libraryContainer = document.querySelector(".library-container")
const libraryBtn = document.querySelector(".library")
const libraryPopup = document.querySelector(".library-popup")

saveBtn.addEventListener("click", openPalette)
saveContainer.addEventListener("click", closePalette)
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary)
libraryContainer.addEventListener("click", closeLibrary)


savePopup.addEventListener("click", (e)=>{
    e.stopPropagation();
})
libraryPopup.addEventListener("click", (e)=>{
    e.stopPropagation();
})



function openPalette(e){
    const popup = saveContainer.children[0]
    saveContainer.classList.add("active")
    popup.classList.add("active")
}

function closePalette(e){
    const popup = saveContainer.children[0]
    saveContainer.classList.remove("active")
    popup.classList.remove("active")
}

function savePalette(){
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText)
    })

    let paletteNr;

    const paletteObjects = JSON.parse(localStorage.getItem("palettes"))
    
    if(paletteObjects){
        paletteNr = paletteObjects.length
    }else{
        paletteNr = savedPalettes.length
    }

    const paletteObj = {name,colors, nr: paletteNr}

    savedPalettes.push(paletteObj)

    savetoLocal(paletteObj)
    saveInput.value = ""

    //Generate library

    const palette = document.createElement("div")
    palette.classList.add("custom-palette")
    const title = document.createElement("h4")
    title.innerText = paletteObj.name
    const preview = document.createElement("div")
    preview.classList.add("small-preview")
    paletteObj.colors.forEach((smallColor)=>{
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor
        preview.appendChild(smallDiv);
    })
    const paletteBtn = document.createElement("button")
    paletteBtn.classList.add("pick-palette-btn")
    paletteBtn.classList.add(paletteObj.nr)
    paletteBtn.innerText = "Select"

    paletteBtn.addEventListener("click",(e)=>{
        closeLibrary();
        const paletteIndex = e.target.classList[1]
        initialColors = []
    
        savedPalettes[paletteIndex].colors.forEach((color,index)=>{

            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color,text)
            updateTextUI(index)
        })

        resetInputs()
    })



    //Append to Library

    palette.appendChild(title)
    palette.appendChild(preview)
    palette.appendChild(paletteBtn)
    libraryContainer.children[0].appendChild(palette)

}

function savetoLocal(paletteObj){
    let localPalettes;

    if(localStorage.getItem("palettes") === null){
        localPalettes = [];
    }else{
        localPalettes = JSON.parse(localStorage.getItem("palettes"))
    }

    localPalettes.push(paletteObj)
    localStorage.setItem("palettes", JSON.stringify(localPalettes))
}

function openLibrary(){
    const popup = libraryContainer.children[0]
    libraryContainer.classList.add("active")
    popup.classList.add("active")
}
function closeLibrary(){
    const popup = libraryContainer.children[0]
    libraryContainer.classList.remove("active")
    popup.classList.remove("active")
}
function getLocal(){


    if(localStorage.getItem("palettes") ===null){
        localPalettes = []
    }else{
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"))
    
    savedPalettes = [...paletteObjects]  //fix
    paletteObjects.forEach((obj)=>{
    const palette = document.createElement("div")
    palette.classList.add("custom-palette")
    const title = document.createElement("h4")
    title.innerText = obj.name
    const preview = document.createElement("div")
    preview.classList.add("small-preview")
    obj.colors.forEach((smallColor)=>{
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor
        preview.appendChild(smallDiv);
    })
    const paletteBtn = document.createElement("button")
    paletteBtn.classList.add("pick-palette-btn")
    paletteBtn.classList.add(obj.nr)
    paletteBtn.innerText = "Select"

    paletteBtn.addEventListener("click",(e)=>{
        closeLibrary();
        const paletteIndex = e.target.classList[1]
        initialColors = []
        paletteObjects[paletteIndex].colors.forEach((color,index)=>{

            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color,text)
            updateTextUI(index)
        })

        resetInputs()
        })
        palette.appendChild(title)
        palette.appendChild(preview)
        palette.appendChild(paletteBtn)
        libraryContainer.children[0].appendChild(palette)
    })
    
}
}



getLocal()
randomColors()





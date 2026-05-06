// process-manager.js

import { Application, Assets, Sprite, } from 'pixi.js';

const btnNewGame = document.getElementById('btnNewGame');
const btnLoadGame = document.getElementById('btnLoadGame');
const btnKillAll = document.getElementById('btnBackMainMenu');




function bNewGame(){
    console.log("Work!");
}

function bLoadGame(){ //Functia de afisare a Meniului Load Gane
   console.log("Function Work!");
   const element=document.getElementById("loadGameMenu");
   if(element.style.display==="none" || element.style.display===""){ 
    element.style.display="block";
   }
}
function exit(){
    window.api.navigate("launcher/menu.html","static");
}
const lgmBtnExit=document.getElementById("lgmExit"); //LGM=LoadGameMenu
function lgmExit(){
    const element=document.getElementById("loadGameMenu"); //Functia pt iesire din Meniu de Load Game
    if(element.style.display==="block")
        element.style.display="none";
}
btnNewGame.addEventListener("click",bNewGame);
btnLoadGame.addEventListener("click", bLoadGame);
btnKillAll.addEventListener("click", exit);
lgmBtnExit.addEventListener("click", lgmExit);


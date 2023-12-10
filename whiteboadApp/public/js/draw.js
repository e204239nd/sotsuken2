document.addEventListener("DOMContentLoaded", () => {
  //テキストボックスメニューがドラッグされているとき-
  const imgBox_menu = document.getElementById("imgBox_menu");
  const textBox_menu = document.getElementById("textBox_menu");
  const arrow_menu = document.getElementById("arrow_menu");
  const rect_menu = document.getElementById("rect_menu");
  const circle_menu = document.getElementById("circle_menu");
  imgBox_menu.addEventListener("dragstart", () => (drawMode = "imgbox"));
  imgBox_menu.addEventListener("dragend", displayToImgbox);
  textBox_menu.addEventListener("dragstart", () => (drawMode = "textbox"));
  textBox_menu.addEventListener("dragend", displayToTextbox);
  arrow_menu.addEventListener("click",()=> drawMode="arrow")
  rect_menu.addEventListener("dragstart", () => (drawMode = "rect"));
  rect_menu.addEventListener("dragend", displayToRect);
  circle_menu.addEventListener("dragstart", () => (drawMode = "circle"));
  circle_menu.addEventListener("dragend", displayToCircle);  
  displayToArrow();
  mutationOberver();
  const svg = document.querySelector("#svg");

  svg.addEventListener("click", () => {
    //コンテキストメニューを削除する
    debugFunc(drawMode);
    
    const contextMenu = document.querySelector("#contextMenu");
    if (contextMenu) contextMenu.parentNode.removeChild(contextMenu);
  });
  //クリック状態を初期化
  IsClickArray = [];
});

document.addEventListener('keydown', function(e) {
  if(e.key === 'Escape'){
    drawMode="";
  }
})



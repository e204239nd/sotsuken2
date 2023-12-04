

document.addEventListener("DOMContentLoaded", () => {
  //テキストボックスメニューがドラッグされているとき-
  const imgBox_menu = document.getElementById("imgBox_menu");
  const textBox_menu = document.getElementById("textBox_menu");
  const arrow_menu = document.getElementById("arrow_menu");
  imgBox_menu.addEventListener("dragstart", () => (drawMode = "imgbox"));
  imgBox_menu.addEventListener("dragend", displayToImgbox);
  textBox_menu.addEventListener("dragstart", () => (drawMode = "textbox"));
  textBox_menu.addEventListener("dragend", displayToTextbox);
  arrow_menu.addEventListener("click", () => (drawMode = "arrow"));
  arrow();
});


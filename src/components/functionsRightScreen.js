
  export function MakeDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  export function MakeUnDraggable(elmnt) {
    elmnt.onmousedown = null
  }

  export function MakeZoomable(container,min_scale, max_scale,factor) {
      var target = container
      console.log(target)
      var size = {w:target.width,h:target.height}
      target.setAttribute("style", "transform-origin: 0 0;");

      var pos = {x:0,y:0}
      var zoom_target = {x:0,y:0}
      var zoom_point = {x:0,y:0}
      var scale = 1

      const myitem = document.getElementById('tool-logos')

      if (myitem.addEventListener)
        {
            // IE9, Chrome, Safari, Opera
            window.addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            window.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
        // IE 6/7/8
        else
        {
            window.attachEvent("onmousewheel", MouseWheelHandler);
        }

      function MouseWheelHandler(e) {
          zoom_point.x = e.pageX - e.offsetX
          zoom_point.y = e.pageY - e.offsetY

          e.preventDefault();
          // cross-browser wheel delta
          var e = window.event || e; // old IE support
          var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

          // determine the point on where the slide is zoomed in
          zoom_target.x = (zoom_point.x - pos.x)/scale
          zoom_target.y = (zoom_point.y - pos.y)/scale

          // apply zoom
          scale += delta*factor * scale
          scale = Math.max(min_scale,Math.min(max_scale,scale))

          // calculate x and y based on zoom
          pos.x = -zoom_target.x * scale + zoom_point.x
          pos.y = -zoom_target.y * scale + zoom_point.y


          // Make sure the slide stays in its container area when zooming out
          if(pos.x>0)
              pos.x = 0
          if(pos.x+size.w*scale<size.w)
              pos.x = -size.w*(scale-1)
          if(pos.y>0)
              pos.y = 0
           if(pos.y+size.h*scale<size.h)
              pos.y = -size.h*(scale-1)

          function update(){
            const left = target.style.left
            const top = target.style.top
            target.setAttribute("style", 'transform: scale('+scale+','+scale+'); left:'  + left + '; top: ' + top)
          }

          update()
      }
  }

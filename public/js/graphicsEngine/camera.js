var yaw = -90.0;
var pitch = 0.0;
var lastX;
var lastY;
var xDirection, zDirection;

class Camera{
  constructor(type, canvas){
    this.cameraType = type;
    if(type === "orbital"){
      //*******************drag orbital camera*************
      canvas.addEventListener('wheel', (e) => {
        console.log(eye[2])
        eye[2] += e.deltaY * 0.001

      }, false);
      canvas.onmousedown = function(event) {  //Mouse is pressed
           x = event.clientX;
           y = event.clientY;
           var rect = event.target.getBoundingClientRect();
           if (rect.left <= x && rect.right > x &&
            rect.top <= y && rect.bottom > y) {
            lastX = x;
            lastY = y;
            dragging = true;
        }
         };

       canvas.onmouseup = function(event){ //Mouse is released
         dragging = false;
       }

       canvas.onmousemove = function(event) { //Mouse is moved
         if(dragging) {
           x = event.clientX;
           y = event.clientY;
           dx = (x - lastX)/canvas.width;
           dy = (y - lastY)/canvas.height;
           let scale = 100;
           yaw += scale * dx
           // yaw = Math.max(Math.min(yaw, 90), -90);
           pitch += scale * dy;
           pitch = Math.max(Math.min(pitch, 90), -90);
           at = vec3(Math.sin(yaw), pitch, -Math.cos(yaw));
         }
         lastX = x;
         lastY = y;
       }
    } else {
      //*****************************************************
      // START OF LOCK MOSUSE FPS CAMERA
      canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;
      document.exitPointerLock = document.exitPointerLock ||
                                 document.mozExitPointerLock;
      canvas.onclick = function() {
        canvas.requestPointerLock();
      };

      // pointer lock event listeners
      // Hook pointer lock state change events for different browsers
      document.addEventListener('pointerlockchange', lockChangeAlert, false);
      document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

      function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
              console.log('The pointer lock status is now locked');
              document.addEventListener("mousemove", updatePosition, false);
        } else {
          console.log('The pointer lock status is now unlocked');
          document.removeEventListener("mousemove", updatePosition, false);
        }
      }

      function updatePosition(event){
        let xscale = 0.1;
        let yscale = 0.1;
        yaw += xscale * event.movementX;
        pitch += yscale * event.movementY;
        pitch = Math.max(Math.min(pitch, 89), -89);

        //X and Z directions that stay on the XZ plane for
        //Constant velocity when walking in direction that is not
        //effected by the pitch of the camera when added to the current position
        xDirection = Math.cos((Math.PI/180) *yaw)
        zDirection = Math.sin((Math.PI/180) *yaw)

        //The position the camera is looking for fps movement
        at = vec3(Math.cos((Math.PI/180) *pitch) * Math.cos((Math.PI/180) *yaw),
                  Math.sin((Math.PI/180) *pitch),
                  Math.cos((Math.PI/180) *pitch) * Math.sin((Math.PI/180) *yaw));

        let temp = vec3(0.0, 1.0, 0.0);
        right = cross(temp, at)
        console.log(right)
      }
    }
  }
}

window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);

window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

/*
function to handle the camera movement per game tick independent to frames per second.
Updates applied are from the mouse movements and keyboard input. If orbital camera type is passed in,
keyboard input is not used and only dragging is read
args:
  camera - is the camera object in the scene.
*/
function movementTick(camera){
  //update eye position and what it is looking at from keyboard input such as 'wasd'
  if(camera.type === 'fps'){
    if (keyState[38] || keyState[87]){
      forwardX += xDirection * 0.02; // move in forward in direction camera
      forwardZ += zDirection * 0.02; // move in forward in direction camera
      bobs += 0.2;//for bobbing during walking
    }
    if (keyState[40] || keyState[83]){
      forwardX -= xDirection * 0.02; // move in backwards in direction camera
      forwardZ -= zDirection * 0.02; // move in backwards in direction camera
      bobs -= 0.2;//for bobbing during walking
    }
    if (keyState[65] || keyState[65]){
      //move left to the camera in the right vector direction
      forwardX += right[0]
      forwardZ += right[2]
      bobs += 0.1;//for bobbing during walking
    }
    if (keyState[68] || keyState[68]){
      //move right to the camera in the right camera direction
      forwardX -= right[0]
      forwardZ -= right[2]
      bobs += 0.1;//for bobbing during walking
    }
    //update the eye position from keyboard input. this is used in the lookat function
    eye[0] = Math.sin(dy) * Math.cos(dx) + forwardX;
    eye[1] = 0.01 * Math.cos(bobs) + 1.0; //0.25 for stationary and last constant for camera height
    eye[2] = Math.cos(dy) * Math.cos(dx) + forwardZ;
  }
  //update the camera lookat
  updateLookat(camera);
}

function updateLookat(camera){
  if(camera.cameraType == "orbital"){
    lookat = lookAt(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    let yrotate = rotate(yaw, 0.0, 1.0, 0.0);
    let xrotate = rotate(pitch, 1.0, 0.0, 0.0);
    lookat = mult(lookat, xrotate);
    lookat = mult(lookat, yrotate);
  }else{
    lookat = lookAt(eye, vec3(eye[0] + at[0], eye[1] + (-at[1]), eye[2] + at[2]), vec3(0.0, 1.0, 0.0));
  }
}

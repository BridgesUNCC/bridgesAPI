class Particle{
  // Nothing too exciting going on here, but it’s worth pointing out that the constructor takes an angle
  // (in degrees) and a speed (in pixels per second) and converts these values into a velocity vector.
  // This is intentional, when setting a particle up it’s easier to work with an angle and a speed.
  // But when updating the particle each frame, it’s easier to work with a velocity vector.

  //Much help in physics calculations from: https://burakkanber.com/blog/modeling-physics-javascript-gravity-and-drag/
  constructor(x, y, z, l, angle, speed, color){
    //position/distance of the particle travel for translation in shader
    this.position = {
      x: x,
      y: y,
      z: z
    };
    //the position of the particle stream designated as a relation to the initial position
    //in the canvas instance for calculating collisions
    this.relation = {
      x: x,
      y: y,
      z: z
    }
    var angleInRad = angle * Math.PI/180;
    this.angl = angleInRad; //angle that the particle will be projected
    //the initial velocity of the paritcle
    this.velocity = {
      x: (speed * Math.cos(angleInRad)),
      y: (speed * Math.sin(angleInRad)* Math.cos(angleInRad)),
      z: (speed * Math.sin(angleInRad))
    }
    this.lifeTime = l;
    this.color = color;
    this.mass = 0.1;
    this.restitution = -0.7;
    this.s = speed;
    this.translation = new Mat4();
  }

  update(dt){
    var Cd = 0.47; // Dimensionless ("coefficient of drag")
    // var rho = 1.22; // kg / m^3 density of fluid ball is in (1.22) for air
    var rho = 1.22; // kg / m^3 density of fluid ball is in (1.22) for air
    var A = Math.PI * 4 * 4 / (10000);
    var ag = 9.81;

    // Do physics
    // Drag force: Fd = -1/2 * Cd * A * rho * v *
    /*
    FD, x = -0.5 * CD * A * ρ * vx2
    FD, y = -0.5 * CD * A * ρ * vy2
    CD is the "coefficient of drag", which is influenced by the shape of the object (and a little bit by its material).
        For a ball, this is 0.47, and is a dimensionless quantity.
    A is the frontal area or frontal projection of the object. If you look at a silhouette of the object from the front,
        this is the area of that shape. For a ball, the frontal area is just the area of a circle, or π r2.
    ρ (Greek letter rho) is the density of the fluid the ball is in. If our ball's in air, this value is 1.22 (kg / m3)
    Velocity squared -- since we're looking at this in two directions separately, we use the X velocity and the Y
        velocity respectively.
    Note the -0.5 at the beginning. The negative sign, with the fact that the equation uses velocity,
        indicates that this force pushes in the opposite direction the ball is moving at all times. Because the velocity is squared it'll always be positive, which means the whole equation will always be negative, ie, opposite the velocity.
    */
    var Fx = -0.5 * Cd * A * rho * this.velocity.x * this.velocity.x * this.velocity.x / Math.abs(this.velocity.x);
    var Fy = -0.5 * Cd * A * rho * this.velocity.y * this.velocity.y * this.velocity.y / Math.abs(this.velocity.y);
    var Fz = -0.5 * Cd * A * rho * this.velocity.z * this.velocity.z * this.velocity.z / Math.abs(this.velocity.z);
    //check for non numbers and handle
    Fx = (isNaN(Fx) ? 0 : Fx);
    Fy = (isNaN(Fy) ? 0 : Fy);
    Fz = (isNaN(Fz) ? 0 : Fz);

    // Calculate acceleration ( F = ma )
    var ax = Fx / this.mass;
    var ay = ag + (Fy / this.mass);
    var az = Fz / this.mass;

    // Integrate to get velocity
    this.velocity.x += ax*(1/40);
    this.velocity.y += ay*(1/40);
    this.velocity.z += az*(1/40);

    // Integrate to get position
    //multiply by the framerate to change speed
    this.position.x += this.velocity.x*(1/1000);
    this.position.y += -(this.velocity.y*(1/1000));
    this.position.z += this.velocity.z*(1/1000);

    // this.translation.setTranslate([this.velocity.x*(1/1000), -(this.velocity.y*(1/1000))])
    this.translation.setTranslate([this.position.x,this.position.y, this.position.z])

    this.lifeTime -= dt; //handle the lifetime of the particle by derementing by delta time
    if(this.lifeTime > 0){// if life has expried make the alpha of particle 0.0 for transparency
      this.color[3] = this.lifeTime; //change the alpha channel of the particle by time alive
    }

    // Update variables after particle death for a continuous stream of particles
    if(this.lifeTime <= 0){
      this.position.x = 0.0;
      this.position.y = 10.0;
      this.position.z = 10.0;

      this.velocity = {
        x: (50 * Math.cos(this.angl)),
        y: 0.1 * (50 * Math.sin(this.angl)),
        z: (50 * Math.sin(this.angl))
      }
      this.color[3] = 1.0;
      this.lifeTime = Math.random() * 5;
      this.translation = new Mat4()
    }
  }

  checkCollision(mouseyNDC, mousexNDC){
    if (this.relation.y + this.position.y < 0) { //difference of the stream position and the distance traveled from source
      this.velocity.y *= this.restitution;
      this.position.y = -this.relation.y - 0; //find the distance from bottom of canvas to source to reposition after collision
    }
    if (this.relation.y + this.position.y > 1) {//Sum of the stream position and the distance traveled from source greater than top of canvas
      this.velocity.y *= this.restitution;
      this.position.y = -this.relation.y + 1;//find the distance to top of canvas from source to reposition after collision
    }
    if (this.relation.x + this.position.x > 1) {//Sum of the stream position and the distance traveled from source greater than left of canvas
      this.velocity.x *= this.restitution;
      this.position.x = -this.relation.x + 1;//find the distance from left of canvas to source from reposition after collision
    }
    if (this.relation.x + this.position.x < -1) {//Sum of the stream position and the distance traveled from source greater than right of canvas
      this.velocity.x *= this.restitution;
      this.position.x = -this.relation.x - 1;//find the distance from right of canvas to source from reposition after collision
    }
  }
}

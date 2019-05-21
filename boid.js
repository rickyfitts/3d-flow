class Boid {
  constructor(pos, ms, mf) {
    this.r = 2.0;
    this.maxSpeed = .5// ms;
    this.maxForce = .1// mf;
    this.acceleration = new Babylon.Vector3(0, 0, 0);
    this.velocity = new Babylon.Vector3(
      random(),
      random(),
      0
    );
    this.position = pos.clone();
    this.mesh = Babylon.MeshBuilder.CreateSphere(
      "sphere", { diameter: 0.05 }, scene
    );
  }

  setMeshPosition = flow => {
    const viewPosition = flow.toViewSpace(this.position.x, this.position.y);
    this.mesh.position = new Babylon.Vector3(
      viewPosition.x,
      viewPosition.y,
      0
    );
  }

  run = (flow, others) => {
    this.separate(others);
    this.follow(flow);
    this.update();
    this.setMeshPosition(flow);
  }

  follow = flow => {
    const d = flow.lookup(this.position);
    const desired = new Babylon.Vector3(d.x, d.y, 0);
    desired.scaleInPlace(this.maxSpeed);
    this.applyForce(this.steer(desired));
  }

  // PHYSICS FUNCTIONS
  update = () => {
    this.velocity.addInPlace(this.acceleration);
    this.limitVelocity();
    this.position.addInPlace(this.velocity);
    this.acceleration.scaleInPlace(0);
  }

  applyForce = force => {
    this.acceleration.addInPlace(force);
  }

  distance = other => {
    return this.position.subtract(other.position);
  }

  limit = (vector, maxMag) => {
    if (vector.length() > maxMag) {
      return vector.normalize().scaleInPlace(maxMag);
    }
    return vector;
  }

  limitVelocity = () => {
    if (this.maxSpeed) this.limit(this.velocity, this.maxSpeed);
    return this.velocity;
  }

  limitForce = force => {
    if (this.maxForce) this.limit(force, this.maxForce);
    return force;
  }

  // BOID STEERING BEHAVIOURS
  steer = desired => {
    const steer = desired.subtract(this.velocity);
    return this.limitForce(steer);
  }

  seek = target => {
    const desired = target.subtract(this.position);
    desired.setMag(this.maxSpeed);

    return this.steer(desired);
  }

  separate = (others, callback) => {
    const sum = new Babylon.Vector3(0, 0, 0);
    let count = 0;

    others.forEach(other => {
      const d = this.distance(other);

      if (d > 0 && d < 10) {
        const diff = this.position.subtract(other.position);
        diff.normalize();
        sum.add(diff);
        count++;
      }

      if (callback) callback(d, other);
    })

    if (count > 0) {
      sum.normalize().scaleInPlace(this.maxSpeed);
      this.applyForce(this.steer(sum));
    }
  }

  borders = () => {
    if (this.position.x < -this.r) this.position.x = width + this.r
    if (this.position.y < -this.r) this.position.y = height + this.r
    if (this.position.x > width + this.r) this.position.x = -this.r
    if (this.position.y > height + this.r) this.position.y = -this.r
  }
}

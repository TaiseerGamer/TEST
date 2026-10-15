
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const settings = {
    easy:   {rings:2, gap:.72, speed:1.05, blockers:0},
    normal: {rings:3, gap:.52, speed:1, blockers:1},
    hard:   {rings:4, gap:.38, speed:.94, blockers:3},
    expert: {rings:5, gap:.28, speed:.88, blockers:5}
  };

  let difficulty = 'easy';
  let level = 1;
  let falls = 0;
  let elapsed = 0;
  let last = performance.now();
  let running = true;
  let keys = {};
  let buttons = {};
  let walls = [];
  let blockers = [];
  let mazeGroup, ball, goal;
  let progress = 0;
  let toastTimer;

  const R = 4.2;
  const ballR = .15;
  const ballVel = new THREE.Vector2();
  const ballPos = new THREE.Vector2();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c1425);
  scene.fog = new THREE.Fog(0x0c1425, 10, 24);

  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 7.8, 10.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  $('.canvas-wrap').appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xbfdcff, 0x15203b, 2));

  const light = new THREE.DirectionalLight(0xffffff, 3.2);
  light.position.set(-4, 8, 5);
  light.castShadow = true;
  scene.add(light);

  const rimLight = new THREE.PointLight(0x37dcca, 28, 18);
  rimLight.position.set(4, 3, -4);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(20, 80),
    new THREE.MeshStandardMaterial({
      color:0x0c1425,
      roughness:.85
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  scene.add(floor);

  function mat(color, metalness=.25, roughness=.4, emissive=0) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      emissive,
      emissiveIntensity: emissive ? 1.1 : 0
    });
  }

  const wallMat = mat(0x617bff, .55, .28, 0x182b85);
  const baseMat = mat(0x243755, .4, .5);
  const goldMat = mat(0xffc76a, .45, .25, 0x8e4a05);
  const ballMat = mat(0x4fffe0, .3, .2, 0x087f78);

  function makeMaze() {
    if (mazeGroup) scene.remove(mazeGroup);

    mazeGroup = new THREE.Group();
    scene.add(mazeGroup);

    walls = [];
    blockers = [];

    const cfg = settings[difficulty];
    const rings = cfg.rings +
      (level > 1 ? Math.min(2, Math.floor((level-1)/2)) : 0);

    // Translucent spherical shell.
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(
        R, 64, 40, 0, Math.PI*2, 0, Math.PI*.5
      ),
      new THREE.MeshStandardMaterial({
        color:0x1b3150,
        metalness:.3,
        roughness:.5,
        transparent:true,
        opacity:.18,
        side:THREE.DoubleSide
      })
    );

    shell.scale.y = .8;
    shell.position.y = -.2;
    mazeGroup.add(shell);

    // Maze floor.
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(R, 96),
      baseMat
    );

    disc.rotation.x = -Math.PI/2;
    disc.position.y = -.05;
    mazeGroup.add(disc);

    // Outer rim.
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(R, .14, 10, 100),
      mat(0x3b5478, .6, .3)
    );

    rim.rotation.x = Math.PI/2;
    rim.position.y = .02;
    mazeGroup.add(rim);

    // Create obstacle rings with gaps.
    for (let i = 1; i <= rings; i++) {
      const radius = R * (i/(rings+1));
      const segments = 90;

      const gapCenter =
        (i%2===0 ? Math.PI*.5 : Math.PI*1.5) +
        (level-1)*.19;

      const gapWidth = cfg.gap * (1+(i===1?.18:0));

      for (let j = 0; j < segments; j++) {
        const angle = j/segments * Math.PI*2;

        const diff = Math.atan2(
          Math.sin(angle-gapCenter),
          Math.cos(angle-gapCenter)
        );

        if (Math.abs(diff) < gapWidth/2) continue;

        const x = Math.cos(angle)*radius;
        const z = Math.sin(angle)*radius;

        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(.21, .25, .19),
          wallMat
        );

        wall.position.set(x, .14, z);
        wall.rotation.y = -angle;
        wall.castShadow = true;
        mazeGroup.add(wall);

        walls.push({x, z, r:.17});
      }

      const ringGlow = new THREE.Mesh(
        new THREE.TorusGeometry(radius, .018, 5, 100),
        mat(0x38517a, .2, .5, 0x152b52)
      );

      ringGlow.rotation.x = Math.PI/2;
      ringGlow.position.y = .025;
      mazeGroup.add(ringGlow);
    }

    // Starting point.
    ballPos.set(0, -(R-.45));

    // Exit portal.
    const goalAngle = Math.PI/2 + (level-1)*.16;

    goal = new THREE.Group();

    const hoop = new THREE.Mesh(
      new THREE.TorusGeometry(.28, .065, 12, 36),
      goldMat
    );

    hoop.rotation.x = Math.PI/2;
    hoop.position.y = .2;
    goal.add(hoop);

    const glow = new THREE.PointLight(0xffbd59, 2, 2.5);
    glow.position.y = .5;
    goal.add(glow);

    goal.position.set(
      Math.cos(goalAngle)*(R-.27),
      .08,
      Math.sin(goalAngle)*(R-.27)
    );

    mazeGroup.add(goal);

    // Moving hazards.
    for (
      let i = 0;
      i < cfg.blockers + Math.floor((level-1)/2);
      i++
    ) {
      const radius = R*(.36+(i%3)*.14);
      const angle = i*2.4+.4;
      const pivot = new THREE.Group();

      pivot.position.set(
        Math.cos(angle)*radius,
        .18,
        Math.sin(angle)*radius
      );

      const hazard = new THREE.Mesh(
        new THREE.BoxGeometry(.85, .16, .18),
        mat(0xff637c, .4, .3, 0x68132b)
      );

      hazard.castShadow = true;
      pivot.add(hazard);
      mazeGroup.add(pivot);

      blockers.push({
        pivot,
        radius,
        angle,
        speed:(i%2 ? -.55 : .48)*(1+i*.09)
      });
    }

    if (ball) scene.remove(ball);

    ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballR, 24, 18),
      ballMat
    );

    ball.castShadow = true;
    mazeGroup.add(ball);

    resetBall(false);

    $('#obstacleCount').textContent =
      `${rings} obstacle rings`;

    $('#difficultyBadge').textContent = difficulty.toUpperCase();
    $('#progressText').textContent = '0%';
    $('#progressBar').style.width = '0%';
    $('#levelNum').textContent = String(level).padStart(2, '0');
  }

  function resetBall(count=true) {
    if (count) falls++;

    $('#falls').textContent = falls;

    ballPos.set(0, -(R-.42));
    ballVel.set(0, 0);

    updateBall();

    if (count) showToast('Ball reset — try a different angle');
  }

  function updateBall() {
    ball.position.set(ballPos.x, .2, ballPos.y);
  }

  function showToast(message) {
    $('#toast').textContent = message;
    $('#toast').style.opacity = 1;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      $('#toast').style.opacity = 0;
    }, 1500);
  }

  function resize() {
    const wrap = $('.canvas-wrap');
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }

  // Detect collisions with walls and moving hazards.
  function collide(x, z) {
    for (const wall of walls) {
      const dx = x-wall.x;
      const dz = z-wall.z;

      if (dx*dx + dz*dz < (ballR+wall.r)**2) {
        return true;
      }
    }

    for (const hazard of blockers) {
      const dx = x-hazard.pivot.position.x;
      const dz = z-hazard.pivot.position.z;

      if (Math.abs(dx)<.48 && Math.abs(dz)<.28) {
        return true;
      }
    }

    return Math.hypot(x, z) > R-.18;
  }

  function formatTime(time) {
    const seconds = Math.floor(time);

    return String(Math.floor(seconds/60)).padStart(2,'0') +
      ':' +
      String(seconds%60).padStart(2,'0');
  }

  function frame(now) {
    requestAnimationFrame(frame);

    const dt = Math.min((now-last)/1000, .04);
    last = now;

    if (running) {
      elapsed += dt;

      const x =
        (keys.ArrowRight || keys.d || buttons.right ? 1 : 0) -
        (keys.ArrowLeft || keys.a || buttons.left ? 1 : 0);

      const z =
        (keys.ArrowDown || keys.s || buttons.down ? 1 : 0) -
        (keys.ArrowUp || keys.w || buttons.up ? 1 : 0);

      const cfg = settings[difficulty];

      ballVel.x += x*5.4*cfg.speed*dt;
      ballVel.y += z*5.4*cfg.speed*dt;

      ballVel.multiplyScalar(Math.pow(.985, dt*60));
      ballVel.clampLength(0, 3.2);

      const nx = ballPos.x + ballVel.x*dt;
      const nz = ballPos.y + ballVel.y*dt;

      if (collide(nx, nz)) {
        if (!collide(nx, ballPos.y)) {
          ballPos.x = nx;
          ballVel.y *= -.25;
        } else if (!collide(ballPos.x, nz)) {
          ballPos.y = nz;
          ballVel.x *= -.25;
        } else {
          ballVel.multiplyScalar(-.25);
        }
      } else {
        ballPos.set(nx, nz);
      }

      // Animate hazards.
      for (const hazard of blockers) {
        hazard.angle += hazard.speed*dt;

        hazard.pivot.position.set(
          Math.cos(hazard.angle)*hazard.radius,
          .18,
          Math.sin(hazard.angle)*hazard.radius
        );

        hazard.pivot.rotation.y = -hazard.angle;
      }

      updateBall();

      // Check the exit.
      const distance = Math.hypot(
        ballPos.x-goal.position.x,
        ballPos.y-goal.position.z
      );

      if (distance < .38) {
        running = false;

        $('#overlayTitle').textContent = 'Maze escaped!';
        $('#overlayText').textContent =
          `You cleared level ${level} in ${formatTime(elapsed)}. The next maze will be tougher.`;

        $('#nextBtn').textContent = 'NEXT LEVEL →';
        $('#overlay').classList.add('show');
      }

      progress = Math.max(progress, Math.min(100,
        Math.round(
          (R-Math.hypot(ballPos.x,ballPos.y))/(R*1.6)*100+8
        )
      ));

      $('#progressText').textContent = progress+'%';
      $('#progressBar').style.width = progress+'%';
    }

    $('#timer').textContent = formatTime(elapsed);

    // Tilt the maze in the direction of movement.
    const tiltX =
      (keys.ArrowDown || keys.s || buttons.down ? 1 : 0) -
      (keys.ArrowUp || keys.w || buttons.up ? 1 : 0);

    const tiltZ =
      (keys.ArrowRight || keys.d || buttons.right ? 1 : 0) -
      (keys.ArrowLeft || keys.a || buttons.left ? 1 : 0);

    mazeGroup.rotation.x +=
      (.12+tiltX*.13-mazeGroup.rotation.x)*.08;

    mazeGroup.rotation.z +=
      (tiltZ*.13-mazeGroup.rotation.z)*.08;

    renderer.render(scene, camera);
  }

  // On-screen arrow controls.
  $$('[data-dir]').forEach(button => {
    const direction = button.dataset.dir;

    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      buttons[direction] = true;
      button.setPointerCapture(event.pointerId);
    });

    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
      button.addEventListener(type, () => {
        buttons[direction] = false;
      });
    });
  });

  // Keyboard controls.
  window.addEventListener('keydown', event => {
    if (
      ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']
        .includes(event.key)
    ) {
      event.preventDefault();
    }

    keys[event.key] = true;

    if (event.key === ' ') resetBall();
  });

  window.addEventListener('keyup', event => {
    keys[event.key] = false;
  });

  window.addEventListener('blur', () => {
    keys = {};
    buttons = {};
  });

  $('#resetBtn').addEventListener('click', () => resetBall());

  // Difficulty selection.
  $$('.difficulty').forEach(button => {
    button.addEventListener('click', () => {
      difficulty = button.dataset.diff;

      level = 1;
      falls = 0;
      elapsed = 0;
      progress = 0;
      running = true;

      $('#falls').textContent = '0';
      $('#overlay').classList.remove('show');

      $$('.difficulty').forEach(item => {
        item.classList.toggle('active', item === button);
      });

      makeMaze();
      showToast(difficulty.toUpperCase()+' maze selected');
    });
  });

  // Next level.
  $('#nextBtn').addEventListener('click', () => {
    level++;
    elapsed = 0;
    progress = 0;
    running = true;

    $('#overlay').classList.remove('show');

    makeMaze();
    showToast('Level '+level+' — new obstacles added');
  });

  window.addEventListener('resize', resize);

  makeMaze();
  resize();

  $('#loading').style.display = 'none';

  requestAnimationFrame(frame);
})();

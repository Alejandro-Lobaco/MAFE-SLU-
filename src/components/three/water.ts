import * as THREE from "three";

/**
 * Shader de agua translúcida (versión ligera, sin pasada extra de render):
 * fresnel en el borde + centro transparente + brillo especular + falsa refracción
 * (desplaza el tono según la normal vista). Se usa en la gota (versión "low") y
 * como base de las partículas.
 */
export function createWaterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uDeep: { value: new THREE.Color("#0f5bb5") },
      uShallow: { value: new THREE.Color("#bfe8ff") },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform float uOpacity;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec3 n = normalize(vN);
        float ndv = max(dot(n, vV), 0.0);
        float fres = pow(1.0 - ndv, 2.2);
        // "refracción": el interior toma el tono profundo desplazado por la normal
        vec3 refr = refract(-vV, n, 1.0 / 1.33);
        float caustic = smoothstep(0.2, 0.9, refr.y * 0.5 + 0.5);
        vec3 col = mix(uDeep, uShallow, fres * 0.85 + caustic * 0.25);
        vec3 L = normalize(vec3(-0.35, 0.8, 0.5));
        float spec = pow(max(dot(reflect(-L, n), vV), 0.0), 60.0);
        col += spec * 1.6;
        float alpha = (0.28 + fres * 0.72 + spec) * uOpacity;
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `,
  });
}

/**
 * Chorro de la fuga en GPU: cada partícula calcula su trayectoria balística en el
 * vertex shader (sin coste de CPU por fotograma). uIntensity (0..1) decide cuántas
 * partículas están activas. El fragment dibuja una esfera impostora con fresnel.
 */
export function createSprayMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uOrigin: { value: new THREE.Vector3() },
      uDir: { value: new THREE.Vector3(0, 1, 0) },
      uScale: { value: 400 },
      uSize: { value: 0.034 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uOrigin;
      uniform vec3 uDir;
      uniform float uScale;
      uniform float uSize;
      attribute float aSeed;
      attribute vec3 aRand;
      varying float vAlpha;
      void main() {
        float life = 0.75 + aRand.x * 0.7;
        float t = mod(uTime + aSeed * 11.0, life);
        float age = t / life;
        vec3 helper = abs(uDir.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
        vec3 tx = normalize(cross(uDir, helper));
        vec3 ty = cross(uDir, tx);
        float ang = aRand.y * 6.28318;
        float spread = 0.05 + aRand.z * 0.3;
        vec3 dir = normalize(uDir + (tx * cos(ang) + ty * sin(ang)) * spread);
        float speed = 0.9 + aRand.x * 1.7;
        vec3 pos = uOrigin + dir * speed * t + vec3(0.0, -4.2, 0.0) * t * t;
        float on = step(aSeed, uIntensity);
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = on * uSize * (0.55 + aRand.z * 0.9) * (1.0 - age * 0.45) * uScale / -mv.z;
        vAlpha = on * (1.0 - smoothstep(0.7, 1.0, age)) * smoothstep(0.0, 0.06, age);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        if (r2 > 1.0) discard;
        vec3 n = vec3(uv.x, -uv.y, sqrt(1.0 - r2));
        float fres = pow(1.0 - n.z, 2.0);
        vec3 L = normalize(vec3(-0.4, 0.7, 0.6));
        float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
        vec3 col = mix(vec3(0.35, 0.72, 1.0), vec3(0.85, 0.96, 1.0), fres) + spec * 1.2;
        float a = (0.62 + fres * 0.38) * (1.0 - smoothstep(0.75, 1.0, r2)) * vAlpha;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }
    `,
  });
}

/** Textura de halo radial para brillos aditivos (anillo, pin, gota). */
export function createGlowTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

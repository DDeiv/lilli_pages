'use client'
import { useMemo, useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * "Digital grime" pass - the VHS layer of the Sludge Life look.
 * NTSC-style composite artifacts only (inspired by ntsc-rs):
 * YIQ chroma bleed (sharp luma, smeared color) + per-scanline tracking
 * jitter. The earlier scanline/grain/vignette/RGB-shift layer was removed.
 * Built on three's own EffectComposer (no extra dependencies).
 * Intensities are deliberately subtle; tune the constants in the shader.
 */
const GrimeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;

    // Tuning knobs (ntsc-rs-inspired composite video artifacts only -
    // the old scanline/grain/vignette/RGB-shift layer was removed)
    const float JITTER_STRENGTH = 0.0008;  // per-scanline horizontal tracking wobble
    const float JITTER_LINES = 240.0;      // virtual scanline count for the jitter
    const float CHROMA_BLEED = 0.0025;     // horizontal chroma blur radius (color smear)
    const float CRT_CURVE = 0.055;         // barrel distortion (corner warp) amount
    const float CRT_EDGE_FADE = 0.008;     // soft darkening right at the warped edge

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // RGB <-> YIQ (the NTSC color space: luma + two chroma axes)
    vec3 rgb2yiq(vec3 c) {
      return vec3(
        dot(c, vec3(0.299, 0.587, 0.114)),
        dot(c, vec3(0.596, -0.274, -0.322)),
        dot(c, vec3(0.211, -0.523, 0.312))
      );
    }
    vec3 yiq2rgb(vec3 c) {
      return vec3(
        c.x + 0.956 * c.y + 0.621 * c.z,
        c.x - 0.272 * c.y - 0.647 * c.z,
        c.x - 1.106 * c.y + 1.703 * c.z
      );
    }

    void main() {
      vec2 uv = vUv;

      // CRT barrel distortion: warp the corners like a curved tube screen.
      // Pixels pushed outside [0,1] become the black overscan border.
      vec2 cc = uv - 0.5;
      float r2 = dot(cc, cc);
      uv = 0.5 + cc * (1.0 + CRT_CURVE * r2 + CRT_CURVE * 0.6 * r2 * r2);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
      // Soft fade right at the curved edge so the border isn't a hard cut
      float edge = smoothstep(0.0, CRT_EDGE_FADE, uv.x)
                 * smoothstep(0.0, CRT_EDGE_FADE, 1.0 - uv.x)
                 * smoothstep(0.0, CRT_EDGE_FADE, uv.y)
                 * smoothstep(0.0, CRT_EDGE_FADE, 1.0 - uv.y);

      // Per-scanline horizontal jitter (VHS tracking wobble).
      // Each virtual scanline gets a small time-varying offset.
      float line = floor(uv.y * JITTER_LINES);
      float wobble = (rand(vec2(line, floor(uTime * 15.0))) - 0.5) * 2.0;
      uv.x += wobble * JITTER_STRENGTH;

      // Composite chroma bleed: luma stays sharp, chroma (IQ) is smeared
      // horizontally - the classic color-fringing of composite video.
      vec3 yiq = rgb2yiq(texture2D(tDiffuse, uv).rgb);
      vec3 blur = vec3(0.0);
      blur += rgb2yiq(texture2D(tDiffuse, uv + vec2(-2.0 * CHROMA_BLEED, 0.0)).rgb) * 0.14;
      blur += rgb2yiq(texture2D(tDiffuse, uv + vec2(-CHROMA_BLEED, 0.0)).rgb) * 0.22;
      blur += yiq * 0.28;
      blur += rgb2yiq(texture2D(tDiffuse, uv + vec2(CHROMA_BLEED, 0.0)).rgb) * 0.22;
      blur += rgb2yiq(texture2D(tDiffuse, uv + vec2(2.0 * CHROMA_BLEED, 0.0)).rgb) * 0.14;
      vec3 col = yiq2rgb(vec3(yiq.x, blur.y, blur.z));

      gl_FragColor = vec4(col * edge, 1.0);
    }
  `,
}

export function PostFX() {
  const { gl, scene, camera, size } = useThree()
  const grimePass = useRef(null)

  const composer = useMemo(() => {
    const c = new EffectComposer(gl)
    c.addPass(new RenderPass(scene, camera))
    const pass = new ShaderPass(GrimeShader)
    grimePass.current = pass
    c.addPass(pass)
    return c
  }, [gl, scene, camera])

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio())
    composer.setSize(size.width, size.height)
  }, [composer, gl, size])

  useEffect(() => () => composer.dispose(), [composer])

  // Priority 1: takes over rendering from R3F's default loop
  useFrame((state) => {
    if (grimePass.current) {
      grimePass.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    composer.render()
  }, 1)

  return null
}

import { ContactShadows, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FILM_DURATION, evaluateFilm } from '../../cinematics/timeSnackFilm.js'

const W = 2.18
const D = 1.5
const H = 0.64
const DRAWER_TRAVEL = 1.22

function makeWoodMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#e6d2b4'
  ctx.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 90; i += 1) {
    ctx.strokeStyle = `rgba(112, 72, 38, ${0.035 + Math.random() * 0.07})`
    ctx.lineWidth = 1 + Math.random() * 3.2
    const x = i * 12
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(x + 10, 280, x - 8, 720, x + 6, 1024)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2.4, 2.4)
  tex.anisotropy = 8
  return tex
}

function Face({ position, rotation, size, map, color = '#ffffff', inner = '#ead9c4' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial map={map} color={color} roughness={0.52} metalness={0.06} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.002]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={inner} roughness={0.74} metalness={0} />
      </mesh>
    </group>
  )
}

function Sleeve({ maps }) {
  return (
    <group>
      <Face position={[0, H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} size={[W, D]} map={maps.top} inner="#4a281c" />
      <Face position={[0, -H / 2, 0]} rotation={[Math.PI / 2, 0, 0]} size={[W, D]} color="#3c2218" inner="#3c2218" />
      <Face position={[0, 0, D / 2]} size={[W, H]} map={maps.front} inner="#5a2a20" />
      <Face position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]} size={[W, H]} map={maps.side} inner="#5a2a20" />
      <Face position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} size={[D, H]} map={maps.side} inner="#5a2a20" />
    </group>
  )
}

function Drawer({ maps, drawerRef, locked = false }) {
  const group = useRef()
  const innerW = W - 0.14
  const innerD = D - 0.12
  const innerH = H - 0.1

  useFrame(() => {
    if (locked || !group.current) return
    const d = drawerRef.current?.userData.drawer ?? 0
    group.current.position.x = d * DRAWER_TRAVEL
  })

  return (
    <group ref={group} position={[0, -0.01, 0]}>
      <mesh castShadow position={[0.04, 0, 0]}>
        <boxGeometry args={[innerW, innerH, innerD]} />
        <meshStandardMaterial color="#f1e7d4" roughness={0.62} metalness={0.02} />
      </mesh>
      <mesh position={[innerW / 2 + 0.028, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[innerD * 0.92, innerH * 0.86]} />
          <meshStandardMaterial color="#f4ead8" roughness={0.55} metalness={0.03} />
        </mesh>
        {[-0.42, 0, 0.42].map((z) => (
          <mesh key={z} position={[0.08, 0.05, z]} castShadow>
            <boxGeometry args={[innerW * 0.6, innerH * 0.7, 0.26]} />
            <meshStandardMaterial color="#5c241c" roughness={0.48} />
          </mesh>
        ))}
      <mesh position={[innerW / 2 + 0.09, 0, 0]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[0.035, 0.17, 0.26]} />
        <meshStandardMaterial color="#3a1c14" roughness={0.72} />
      </mesh>
    </group>
  )
}

function Dust({ heroRef }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(240 * 3)
    for (let i = 0; i < 240; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 6
      arr[i * 3 + 1] = Math.random() * 5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const boxY = heroRef.current?.position.y ?? 0
    ref.current.rotation.y += delta * 0.04
    ref.current.position.y = boxY * 0.2
    ref.current.material.opacity = Math.min(0.45, boxY * 0.12)
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f7e6d2" size={0.035} transparent opacity={0} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function Director({ timeRef, playingRef, onFrame, heroRef, drawerRef, tableRef }) {
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (playingRef.current) {
      timeRef.current = Math.min(timeRef.current + delta, FILM_DURATION)
      if (timeRef.current >= FILM_DURATION) playingRef.current = false
    }
    const film = evaluateFilm(timeRef.current)
    const cam = state.camera
    cam.position.set(film.cam[0], film.cam[1], film.cam[2])
    look.set(film.look[0], film.look[1], film.look[2])
    cam.lookAt(look)
    cam.fov = film.fov
    cam.rotation.z += film.roll
    cam.updateProjectionMatrix()

    if (heroRef.current) heroRef.current.position.y = film.boxY
    if (drawerRef.current) drawerRef.current.userData.drawer = film.drawer
    if (tableRef.current) {
      tableRef.current.material.opacity = film.tableOpacity
      tableRef.current.material.transparent = film.tableOpacity < 0.999
    }
    onFrame(timeRef.current, film)
  })

  return null
}

function Backdrop() {
  const uniforms = useMemo(
    () => ({
      uA: { value: new THREE.Color('#f6d7c8') },
      uB: { value: new THREE.Color('#fbf1e6') },
      uC: { value: new THREE.Color('#e7a99a') },
    }),
    [],
  )

  return (
    <mesh position={[0, 3.2, -10]} scale={[42, 22, 1]}>
      <planeGeometry />
      <shaderMaterial
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
          void main() {
            vec3 col = mix(uB, uA, smoothstep(0.15, 0.9, vUv.y));
            float dune = sin(vUv.x * 4.2 + vUv.y * 1.4) * 0.5 + 0.5;
            col = mix(col, uC, dune * smoothstep(0.35, 1.0, vUv.y) * 0.35);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export default function TimeSnackScene({ timeRef, playingRef, onFrame }) {
  const heroRef = useRef()
  const drawerRef = useRef()
  const tableRef = useRef()
  const [top, front, side, inner] = useTexture([
    '/images/time-snack/tex-top.png',
    '/images/time-snack/tex-front.png',
    '/images/time-snack/tex-side.png',
    '/images/time-snack/tex-inner.png',
  ])

  useLayoutEffect(() => {
    ;[top, front, side, inner].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      tex.needsUpdate = true
    })
  }, [top, front, side, inner])

  const maps = useMemo(() => ({ top, front, side, inner }), [top, front, side, inner])
  const wood = useMemo(() => makeWoodMap(), [])

  return (
    <>
      <color attach="background" args={['#f3d5c6']} />
      <fog attach="fog" args={['#f3d5c6', 14, 32]} />
      <hemisphereLight args={['#ffe7d4', '#8a6248', 0.85]} />
      <directionalLight
        castShadow
        position={[5.4, 8.2, 3.6]}
        intensity={2.35}
        color="#ffe1c0"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-4, 2.4, -2]} intensity={0.45} color="#ffc8bc" />
      <pointLight position={[0, 6, 2]} intensity={0.55} color="#fff4e8" />

      <Backdrop />

      <mesh ref={tableRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -H / 2 - 0.001, 0]} receiveShadow>
        <circleGeometry args={[4.35, 80]} />
        <meshStandardMaterial map={wood} roughness={0.78} metalness={0.03} />
      </mesh>

      <group ref={drawerRef} />
      <group ref={heroRef} position={[0.15, 0, 0.1]}>
        <Sleeve maps={maps} />
        <Drawer maps={maps} drawerRef={drawerRef} />
      </group>
      <group position={[-2.15, 0, -1.22]} rotation={[0, 0.42, 0]}>
        <Sleeve maps={maps} />
        <Drawer maps={maps} drawerRef={drawerRef} locked />
      </group>
      <Dust heroRef={heroRef} />

      <ContactShadows
        position={[0, -H / 2 + 0.002, 0]}
        opacity={0.42}
        scale={10}
        blur={2.4}
        far={4.5}
        color="#5a3a28"
      />

      <Director
        timeRef={timeRef}
        playingRef={playingRef}
        onFrame={onFrame}
        heroRef={heroRef}
        drawerRef={drawerRef}
        tableRef={tableRef}
      />
    </>
  )
}

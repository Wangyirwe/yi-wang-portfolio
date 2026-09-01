import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function StarField() {
  const ref = useRef()
  const positions = useMemo(() => {
    const count = 1400
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  useFrame(({ clock, pointer }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.04
    ref.current.rotation.y = t + pointer.x * 0.15
    ref.current.rotation.x = pointer.y * 0.08
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#d9d2c5"
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function Core() {
  const mesh = useRef()
  const ring = useRef()

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime
    if (mesh.current) {
      mesh.current.rotation.x = t * 0.12
      mesh.current.rotation.y = t * 0.18
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, pointer.x * 0.6, 0.04)
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, pointer.y * 0.35, 0.04)
    }
    if (ring.current) {
      ring.current.rotation.z = -t * 0.08
      ring.current.rotation.y = t * 0.05
    }
  })

  return (
    <group position={[1.6, 0.2, -1]}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color="#e8e2d6" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[1.85, 0.004, 8, 120]} />
        <meshBasicMaterial color="#9eb8ff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export default function WebGLBackground() {
  return (
    <div className="webgl">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        style={{ pointerEvents: 'none' }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 6, 16]} />
        <StarField />
        <Core />
      </Canvas>
    </div>
  )
}

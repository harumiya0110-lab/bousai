import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { ThreeEvent } from '@react-three/fiber'
import { Object3D } from 'three'
import {
  createDemoBuildings,
  createTerrainGeometry,
  terrainElevation,
  type LayerId,
  type LocalPosition,
  type SelectedLocation,
  type VirtualFacility,
} from '../data/demo'
import type { ToolMode } from '../store'

type CameraView = 'overview' | 'oblique' | 'ground'

interface Scene3DProps {
  layers: Record<LayerId, boolean>
  floodStep: number
  facilities: VirtualFacility[]
  toolMode: ToolMode
  selectedFacilityId: string | null
  cameraView: CameraView
  onSelectLocation: (location: SelectedLocation) => void
  onPlace: (position: LocalPosition) => void
  onSelectFacility: (id: string) => void
}

const buildingLocations = createDemoBuildings()

export function Scene3D(props: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [15, 17, 18], fov: 43, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      shadows="basic"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-label="仮想地形の3Dシーン。ドラッグで回転、右ドラッグで移動、ホイールでズームできます。"
    >
      <color attach="background" args={['#101d2a']} />
      <fog attach="fog" args={['#101d2a', 24, 55]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[8, 18, 8]} intensity={2.1} castShadow />
      <directionalLight position={[-10, 9, -8]} intensity={0.75} color="#7abbd1" />
      <CameraRig cameraView={props.cameraView} />
      <gridHelper args={[24, 24, '#4d6574', '#2a3c4c']} position={[0, 0.1, 0]} />
      {props.layers.terrain && <Terrain {...props} />}
      {props.layers.buildings && <Buildings toolMode={props.toolMode} onPlace={props.onPlace} onSelect={props.onSelectLocation} />}
      {props.layers.roads && <Roads />}
      {props.layers.river && <River />}
      {props.layers.shelters && <Shelters toolMode={props.toolMode} onPlace={props.onPlace} onSelect={props.onSelectLocation} />}
      {props.layers.virtual && <VirtualFacilities toolMode={props.toolMode} facilities={props.facilities} selectedId={props.selectedFacilityId} onPlace={props.onPlace} onSelect={props.onSelectFacility} />}
    </Canvas>
  )
}

function CameraRig({ cameraView }: { cameraView: CameraView }) {
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    const positions: Record<CameraView, [number, number, number]> = {
      overview: [15, 17, 18],
      oblique: [19, 10, 14],
      ground: [0, 3.2, 18],
    }
    camera.position.set(...positions[cameraView])
    camera.lookAt(0, 0, 0)
    if (controls.current) {
      controls.current.target.set(0, 0, 0)
      controls.current.update()
    }
  }, [camera, cameraView])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={7}
      maxDistance={34}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2.05}
      rotateSpeed={0.62}
      panSpeed={0.68}
      zoomSpeed={0.78}
    />
  )
}

interface TerrainProps extends Omit<Scene3DProps, 'cameraView' | 'selectedFacilityId' | 'facilities' | 'onSelectFacility'> {}

function Terrain({ floodStep, layers, toolMode, onSelectLocation, onPlace }: TerrainProps) {
  const geometry = useMemo(() => createTerrainGeometry(layers.flood ? floodStep : 0), [floodStep, layers.flood])
  useEffect(() => () => geometry.dispose(), [geometry])

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const position = { x: event.point.x, z: event.point.z }
    if (toolMode === 'place' || toolMode === 'move') {
      onPlace(position)
      return
    }
    onSelectLocation({
      title: '仮想地点',
      position,
      elevation: terrainElevation(position.x, position.z),
      source: 'B: 仮想シミュレーションデータ',
      note: '表示用ローカル座標です。実際の地理座標・測量標高ではありません。',
    })
  }

  return (
    <mesh geometry={geometry} receiveShadow onClick={handleClick}>
      <meshStandardMaterial vertexColors roughness={0.9} metalness={0.03} />
    </mesh>
  )
}

function Buildings({ toolMode, onPlace, onSelect }: {
  toolMode: ToolMode
  onPlace: (position: LocalPosition) => void
  onSelect: (location: SelectedLocation) => void
}) {
  const mesh = useRef<import('three').InstancedMesh>(null)

  useEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D()
    buildingLocations.forEach((building, index) => {
      transform.position.set(building.x, terrainElevation(building.x, building.z) + building.height / 2, building.z)
      transform.scale.set(0.52, building.height, 0.48)
      transform.rotation.y = ((index * 17) % 12) * 0.025
      transform.updateMatrix()
      mesh.current?.setMatrixAt(index, transform.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [])

  const selectBuilding = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (event.instanceId === undefined) return
    const building = buildingLocations[event.instanceId]
    if (toolMode !== 'navigate') {
      onPlace({ x: event.point.x, z: event.point.z })
      return
    }
    onSelect({
      title: `仮想建物 ${event.instanceId + 1}`,
      position: { x: building.x, z: building.z },
      elevation: terrainElevation(building.x, building.z),
      source: 'B: 仮想シミュレーションデータ',
      note: '位置・高さ・形状は説明用に生成した仮想モデルです。実在する建物情報ではありません。',
    })
  }

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, buildingLocations.length]} castShadow receiveShadow onClick={selectBuilding}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#a8bac0" roughness={0.78} />
    </instancedMesh>
  )
}

function Roads() {
  const lines = [-5, 0, 5].map((z) => Array.from({ length: 41 }, (_, index) => {
    const x = -8.5 + index * 0.425
    return [x, terrainElevation(x, z) + 0.055, z] as [number, number, number]
  }))
  const crossRoads = [-5, 0, 5].map((x) => Array.from({ length: 41 }, (_, index) => {
    const z = -8.5 + index * 0.425
    return [x, terrainElevation(x, z) + 0.06, z] as [number, number, number]
  }))

  return <>{[...lines, ...crossRoads].map((points, index) => <Line key={index} points={points} color="#e2b974" lineWidth={1.7} transparent opacity={0.72} />)}</>
}

function River() {
  const points = Array.from({ length: 61 }, (_, index) => {
    const z = -9 + index * 0.3
    const x = Math.sin(z * 0.38) * 1.35
    return [x, terrainElevation(x, z) + 0.08, z] as [number, number, number]
  })
  return <Line points={points} color="#40b9dc" lineWidth={4} transparent opacity={0.9} />
}

function Shelters({ toolMode, onPlace, onSelect }: {
  toolMode: ToolMode
  onPlace: (position: LocalPosition) => void
  onSelect: (location: SelectedLocation) => void
}) {
  const shelters: LocalPosition[] = [{ x: -6.4, z: -5.8 }, { x: 6.1, z: 5.7 }, { x: 6.5, z: -4.4 }]
  return (
    <>
      {shelters.map((shelter, index) => {
        const y = terrainElevation(shelter.x, shelter.z)
        return (
          <group key={index} position={[shelter.x, y + 0.35, shelter.z]} onClick={(event) => {
            event.stopPropagation()
            if (toolMode !== 'navigate') {
              onPlace({ x: event.point.x, z: event.point.z })
              return
            }
            onSelect({
              title: `仮想避難施設 ${index + 1}`,
              position: shelter,
              elevation: y,
              source: 'B: 仮想シミュレーションデータ',
              note: '説明用の仮想マーカーです。実在の施設名・住所・災害対応状況ではありません。',
            })
          }}>
            <mesh castShadow><cylinderGeometry args={[0.16, 0.2, 0.54, 8]} /><meshStandardMaterial color="#49d18d" emissive="#17422f" /></mesh>
            <mesh position={[0, 0.36, 0]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial color="#b4f4c8" emissive="#277849" /></mesh>
          </group>
        )
      })}
    </>
  )
}

function VirtualFacilities({ toolMode, facilities, selectedId, onPlace, onSelect }: {
  toolMode: ToolMode
  facilities: VirtualFacility[]
  selectedId: string | null
  onPlace: (position: LocalPosition) => void
  onSelect: (id: string) => void
}) {
  return (
    <>
      {facilities.map((facility) => (
        <group key={facility.id} position={[facility.x, terrainElevation(facility.x, facility.z) + 0.5, facility.z]} onClick={(event) => {
          event.stopPropagation()
          if (toolMode !== 'navigate') {
            onPlace({ x: event.point.x, z: event.point.z })
            return
          }
          onSelect(facility.id)
        }}>
          <mesh castShadow>
            <cylinderGeometry args={[selectedId === facility.id ? 0.35 : 0.27, 0.32, 0.72, 6]} />
            <meshStandardMaterial color={selectedId === facility.id ? '#ffba57' : '#f59e0b'} emissive="#50320d" />
          </mesh>
          <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color="#fff1cd" /></mesh>
        </group>
      ))}
    </>
  )
}

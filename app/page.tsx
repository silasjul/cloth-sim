import Scene from '@/components/Scene'
import LevaControls from '@/components/LevaControls'
import Loader from '@/components/Loader'

export default function Home() {
  return (
    <main className="w-full h-lvh">
      <Loader />
      <LevaControls />
      <Scene />
    </main>
  )
}

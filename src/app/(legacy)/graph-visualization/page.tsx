import { GraphVisualizationContainer } from '@/components/graph-visualization/graph-visualization-container'

export default async function GraphVisualization() {
  return (
    <div className="overflow-x-hidden bg-black text-green-400 font-mono">
      <div className="grow py-4 w-full overflow-x-hidden">
        <div className="space-y-10">
          <p>graph visualization</p>
          <GraphVisualizationContainer />
        </div>
      </div>
    </div>
  )
}

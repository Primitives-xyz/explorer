import { GraphVisualizationContainer } from '@/components/graph-visualization/graph-visualization-container'

export default async function GraphVisualization() {
  return (
    <div className="overflow-x-hidden bg-black text-green-400 font-mono">
      <div className="flex-grow p-4 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">graph visualization</div>
        <GraphVisualizationContainer />
      </div>
    </div>
  )
}

'use client'

import { FC, useMemo } from 'react'
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react'
import { calculateOrthogonalRoute, nodeToShape } from './orthogonal-connector'
import { SOL_MINT } from '@/utils/constants'
import { EdgeLabel } from './edge-label'

interface OrthogonalEdgeProps extends EdgeProps {
  data?: {
    mint?: string;
    amount?: number;
    sourceNode?: any;
    targetNode?: any;
    isBidirectional?: boolean;
    color?: string;
  };
  sourceHandle?: string;
  targetHandle?: string;
}

export const OrthogonalEdge: FC<OrthogonalEdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  sourceHandle,
  targetHandle,
}) => {
  // Determine which side the edge is coming from/to
  const sourceSide = sourceHandle === 'right' ? 'right' : (sourcePosition?.toLowerCase() || 'right')
  const targetSide = targetHandle === 'top' ? 'top' : targetHandle === 'right' ? 'right' : (targetPosition?.toLowerCase() || 'top')
  
  // Get the source and target nodes
  const sourceNode = data?.sourceNode
  const targetNode = data?.targetNode
  const isBidirectional = data?.isBidirectional
  
  // If we have bidirectional edges, apply an offset to prevent overlap
  const offsetDistance = isBidirectional ? 20 : 0
  
  const edgePath = useMemo(() => {
    if (!sourceNode || !targetNode) {
      // Fallback to straight path if nodes are not available
      const [path] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      })
      return path
    }

    try {
      // Use orthogonal connector algorithm with adjusted points for bidirectional edges
      const route = calculateOrthogonalRoute({
        pointA: {
          shape: {
            left: sourceNode.position.x,
            top: sourceNode.position.y,
            width: sourceNode.width || 250,
            height: sourceNode.height || 80,
          },
          side: sourceSide as 'top' | 'right' | 'bottom' | 'left',
          distance: 0.5,
        },
        pointB: {
          shape: {
            left: targetNode.position.x,
            top: targetNode.position.y,
            width: targetNode.width || 250,
            height: targetNode.height || 80,
          },
          side: targetSide as 'top' | 'right' | 'bottom' | 'left',
          distance: 0.5,
        },
        shapeMargin: 10,
        globalBoundsMargin: 100,
        globalBounds: {
          left: 0,
          top: 0,
          width: 2000,
          height: 2000,
        },
      })

      // Convert points to SVG path and apply offset if needed
      if (route.length < 2) {
        // Fallback to straight path if route could not be calculated
        const [path] = getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        })
        return path
      }

      // Apply offset to the path points if this is a bidirectional edge
      if (isBidirectional && offsetDistance > 0) {
        // Calculate normals to offset the path
        for (let i = 1; i < route.length - 1; i++) {
          const prev = route[i - 1];
          const curr = route[i];
          const next = route[i + 1];
          
          // Determine if segment is horizontal or vertical
          const isHorizontal = Math.abs(curr.y - next.y) < Math.abs(curr.x - next.x);
          
          if (isHorizontal) {
            // Offset horizontal segments
            curr.y += offsetDistance;
            next.y += offsetDistance;
          } else {
            // Offset vertical segments
            curr.x += offsetDistance;
            next.x += offsetDistance;
          }
        }
      }

      let pathString = `M ${route[0].x} ${route[0].y}`
      for (let i = 1; i < route.length; i++) {
        pathString += ` L ${route[i].x} ${route[i].y}`
      }
      
      return pathString
    } catch (error) {
      console.error('Error calculating orthogonal path:', error)
      // Fallback to straight path on error
      const [path] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      })
      return path
    }
  }, [sourceNode, targetNode, sourceX, sourceY, targetX, targetY, sourceSide, targetSide, isBidirectional, offsetDistance])

  // Determine label position (middle of the path)
  const labelX = (sourceX + targetX) / 2
  const labelY = (sourceY + targetY) / 2 - 10 // Slight offset to not overlap with the path

  // Get token info from data
  const amount = data?.amount || 0
  const mint = data?.mint || ''
  const edgeColor = data?.color || '#a5b4fc'
  const isSol = mint === SOL_MINT
  const tokenSymbol = isSol ? 'SOL' : (mint ? `${mint.slice(0, 4)}...${mint.slice(-4)}` : '')
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2,
        }}
        markerEnd={markerEnd}
        interactionWidth={14}
      />

      {/* Label */}
      {data?.amount && data?.mint && (
        <foreignObject
          width={120}
          height={30}
          x={labelX - 60}
          y={labelY - 15}
          className="edge-label-container"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="nodrag nopan">
            <EdgeLabel mint={data.mint} amount={data.amount} color={edgeColor} />
          </div>
        </foreignObject>
      )}
    </>
  )
}

export default OrthogonalEdge 
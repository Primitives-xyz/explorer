'use client'

import { FC, useMemo, useCallback, ReactNode, MouseEvent } from 'react'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { 
  Background, 
  ConnectionMode,
  Controls,
  Edge, 
  EdgeTypes,
  Handle, 
  MarkerType,
  Node, 
  NodeChange,
  NodePositionChange,
  Position, 
  ReactFlow,
  useEdgesState, 
  useNodesState 
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { SOL_MINT } from '@/utils/constants'
import { OrthogonalEdge } from './orthogonal-edge'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'

interface TokenTransferGraphProps {
  transaction: Transaction
}

// Custom node for accounts
const AccountNode: FC<{ data: any }> = ({ data }) => {
  return (
    <div className={`account-node ${data.isFeePayer ? 'fee-payer' : ''}`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top" 
        style={{ background: '#6366F1' }}
      />
      <Card className="w-[250px] h-[80px] bg-gray-800 border-none overflow-visible">
        <CardHeader className="pb-0 pt-2 px-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-[#4ADE80] truncate">{data.label}</CardTitle>
            {data.isFeePayer && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Fee Payer</span>
            )}
          </div>
            <SolanaAddressDisplay 
            address={data.address}
            displayAbbreviatedAddress
            showCopyButton
            highlightable
             />
        </CardHeader>
      </Card>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right" 
        style={{ background: '#10B981' }}
      />
    </div>
  )
}

const nodeTypes = {
  account: AccountNode,
};

const edgeTypes: EdgeTypes = {
  orthogonal: OrthogonalEdge,
};

const TokenTransferGraph: FC<TokenTransferGraphProps> = ({ transaction }) => {
  // Only render if there are token transfers
  if (!transaction.tokenTransfers || transaction.tokenTransfers.length === 0) {
    return <div className="text-center p-4">No token transfers in this transaction</div>
  }

  // Prepare nodes and edges from transaction data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    const addedAccounts = new Set<string>()
    const nodeMap: Record<string, Node> = {}
    
    // Add fee payer as the first node
    const feePayer = transaction.feePayer
    if (feePayer) {
      const feePayerNode: Node = {
        id: feePayer,
        type: 'account',
        position: { x: 50, y: 100 },
        data: {
          address: feePayer,
          label: 'Fee Payer',
          isFeePayer: true,
          balance: transaction.balanceChanges?.[feePayer] || 0
        },
        // Store dimensions for edge routing
        width: 250,
        height: 80,
      }
      nodes.push(feePayerNode)
      nodeMap[feePayer] = feePayerNode
      addedAccounts.add(feePayer)
    }
    
    // Process token transfers
    let yOffset = 50
    let targetX = 400
    
    // Track bidirectional edges for offset calculation
    const edgeMap = new Map<string, number>()
    
    transaction.tokenTransfers?.forEach((transfer, index) => {
      const { fromUserAccount, toUserAccount, tokenMint, tokenAmount } = transfer
      const mint = transfer.mint || tokenMint
      
      // Add sending account if not already added
      if (!addedAccounts.has(fromUserAccount)) {
        const y = yOffset
        yOffset += 120
        const fromNode: Node = {
          id: fromUserAccount,
          type: 'account',
          position: { x: targetX, y },
          data: { 
            address: fromUserAccount,
            label: 'Account',
            balance: transaction.balanceChanges?.[fromUserAccount] || 0
          },
          width: 250,
          height: 80,
        }
        nodes.push(fromNode)
        nodeMap[fromUserAccount] = fromNode
        addedAccounts.add(fromUserAccount)
      }
      
      // Add receiving account if not already added
      if (!addedAccounts.has(toUserAccount)) {
        const y = yOffset
        yOffset += 120
        const toNode: Node = {
          id: toUserAccount,
          type: 'account',
          position: { x: targetX + 350, y },
          data: { 
            address: toUserAccount,
            label: 'Account',
            balance: transaction.balanceChanges?.[toUserAccount] || 0
          },
          width: 250,
          height: 80,
        }
        nodes.push(toNode)
        nodeMap[toUserAccount] = toNode
        addedAccounts.add(toUserAccount)
      }
      
      // Check if there's already an edge between these nodes (for bidirectional)
      const edgeKey = `${fromUserAccount}-${toUserAccount}`
      const reverseEdgeKey = `${toUserAccount}-${fromUserAccount}`
      const hasBidirectional = edgeMap.has(reverseEdgeKey)
      
      // Increment the count for this direction
      edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1)
      
      // Use different handle combinations for bidirectional edges
      const sourceHandleId = hasBidirectional ? 'right' : 'right'
      const targetHandleId = hasBidirectional ? 'right' : 'top'
      
      // Calculate a specific color based on the mint address
      // This creates a deterministic color from the mint address
      const mintHash = mint?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
      const hue = (mintHash % 360)
      const mintColor = `hsl(${hue}, 80%, 55%)`
      
      // Add edge for token transfer
      edges.push({
        id: `e-${fromUserAccount}-${toUserAccount}-${index}`,
        source: fromUserAccount,
        target: toUserAccount,
        animated: true,
        type: 'orthogonal',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: mintColor,
          width: 20,
          height: 20,
        },
        style: {
          stroke: mintColor,
        },
        data: {
          mint,
          amount: tokenAmount,
          // Pass the node objects for better edge routing
          sourceNode: nodeMap[fromUserAccount],
          targetNode: nodeMap[toUserAccount],
          // Add a flag for bidirectional edges
          isBidirectional: hasBidirectional,
          color: mintColor
        },
        // Set the anchor points for the orthogonal connector
        sourceHandle: sourceHandleId,
        targetHandle: targetHandleId,
      })
    })
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [transaction])
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Custom node change handler to update edges during node movement
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // First apply the changes to nodes
      onNodesChange(changes);
      
      // Then update edges for any node that's being dragged
      const positionChanges = changes.filter(
        (change) => change.type === 'position' && (change as NodePositionChange).dragging
      ) as NodePositionChange[];
      
      if (positionChanges.length > 0) {
        // For each node being dragged, update connected edges
        setEdges((eds) =>
          eds.map((edge) => {
            // Find position changes for source and target nodes
            const sourceChange = positionChanges.find((c) => c.id === edge.source);
            const targetChange = positionChanges.find((c) => c.id === edge.target);
            
            if (sourceChange || targetChange) {
              // Get current nodes with positions
              const currentNodes = nodes.map((n) => {
                const change = positionChanges.find((c) => c.id === n.id);
                if (change) {
                  // Apply position change to the node copy
                  return {
                    ...n,
                    position: {
                      x: change.position?.x || n.position.x,
                      y: change.position?.y || n.position.y,
                    },
                  };
                }
                return n;
              });
              
              // Find updated nodes
              const sourceNode = currentNodes.find((n) => n.id === edge.source);
              const targetNode = currentNodes.find((n) => n.id === edge.target);
              
              if (sourceNode && targetNode) {
                // Update edge with new node positions
                return {
                  ...edge,
                  data: {
                    ...edge.data,
                    sourceNode,
                    targetNode,
                  },
                };
              }
            }
            return edge;
          })
        );
      }
    },
    [nodes, setEdges, onNodesChange]
  );

  // Update edge data when nodes change positions
  const onNodeDragStop = useCallback(
    (event: MouseEvent, node: Node) => {
      // Update edges connected to this node
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            // Find the source and target nodes
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            
            // Update the edge data with new node positions
            if (sourceNode && targetNode) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  sourceNode,
                  targetNode,
                },
              };
            }
          }
          return edge;
        })
      );
    },
    [nodes, setEdges]
  );

  return (
    <div className="w-full h-[295px] bg-gradient-to-b from-[#312C30]
               to-[#292226] rounded-lg overflow-hidden shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: 'orthogonal',
          animated: true,
        }}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={true}
        snapGrid={[10, 10]}
        nodesDraggable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnDrag={true}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-900"
      >
        <Background color="#473C44" gap={16} />
        <Controls className="text-black" />
      </ReactFlow>
    </div>
  )
}

export default TokenTransferGraph

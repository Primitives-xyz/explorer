import type { Node, Relationship } from '@neo4j-nvl/base'
import type { NextRequest } from 'next/server'

async function getConnectionFromProfile(username: string) {
  const url = `${process.env.TAPESTRY_URL}/profiles/visualize-blink/${username}?apiKey=${process.env.TAPESTRY_API_KEY}`

  const response = await fetch(url)

  return response.json()
}

export async function GET(request: NextRequest) {
  const urlSegments = request.url.split('/')
  const username =
    urlSegments.length > 5 && urlSegments[5] ? urlSegments[5].toLowerCase() : ''

  const data = (await getConnectionFromProfile(username)) as Neo4jQueryResult

  const response = transformNeo4jDataForNvl(data)

  const filteredNodes = response.nodes.filter((node) => {
    return node.labels.includes('profile')
  })

  return new Response(
    JSON.stringify({
      nodes: filteredNodes,
      rels: response.rels,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  )
}

// Add OPTIONS handler for preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

type NodeWithLabels = Node & {
  labels: string[]
}

function transformNeo4jDataForNvl(queryResult: Neo4jQueryResult): {
  nodes: NodeWithLabels[]
  rels: Relationship[]
} {
  const nodesMap = new Map<string, NodeWithLabels>()
  const relsMap = new Map<string, Relationship>()
  queryResult.forEach((result) => {
    const path = result._fields[0]
    // Process start and end nodes
    ;[path.start, path.end].forEach((nodeData) => {
      if (!nodesMap.has(nodeData.elementId)) {
        nodesMap.set(nodeData.elementId, createNode(nodeData))
      }
    })

    // Process segments
    path.segments.forEach((segment) => {
      // Add any nodes not already processed
      if (!nodesMap.has(segment.start.elementId)) {
        nodesMap.set(segment.start.elementId, createNode(segment.start))
      }
      if (!nodesMap.has(segment.end.elementId)) {
        nodesMap.set(segment.end.elementId, createNode(segment.end))
      }

      // Process relationship
      if (!relsMap.has(segment.relationship.elementId)) {
        relsMap.set(
          segment.relationship.elementId,
          createRelationship(segment.relationship),
        )
      }
    })
  })

  return {
    nodes: Array.from(nodesMap.values()),
    rels: Array.from(relsMap.values()),
  }
}

function createNode(nodeData: NodeData): NodeWithLabels {
  return {
    id: nodeData.elementId,
    caption: nodeData.properties.id as string,
    labels: nodeData.labels,
    // Add more properties as needed, e.g.:
    // color: nodeData.properties.color as string,
    // size: nodeData.properties.size as number,
  }
}

function createRelationship(relData: RelationshipData) {
  return {
    id: relData.elementId,
    from: relData.startNodeElementId,
    to: relData.endNodeElementId,
    type: relData.type,
    // Add more properties as needed, e.g.:
    // caption: relData.type,
    // width: 1,
  }
}

type Neo4jQueryResult = {
  keys: string[]
  length: number
  _fields: [
    {
      start: NodeData
      end: NodeData
      segments: {
        start: NodeData
        relationship: RelationshipData
        end: NodeData
      }[]
      length: number
    },
  ]
  _fieldLookup: {
    [key: string]: number
  }
}[]

type NodeData = {
  identity: {
    low: number
    high: number
  }
  labels: string[]
  properties: {
    [key: string]:
      | string
      | number
      | {
          low: number
          high: number
        }
  }
  elementId: string
}

type RelationshipData = {
  identity: {
    low: number
    high: number
  }
  start: {
    low: number
    high: number
  }
  end: {
    low: number
    high: number
  }
  type: string
  properties: {
    [key: string]:
      | {
          low: number
          high: number
        }
      | string
      | number
  }
  elementId: string
  startNodeElementId: string
  endNodeElementId: string
}

export interface IGraph {
  nodes: INode[]
  rels: IRelationship[]
}

export interface INode {
  id: string
  caption: string
}

export interface IRelationship {
  id: string
  from: string
  to: string
  type: string
}

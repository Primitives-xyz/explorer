/**
 * Orthogonal Connector Algorithm
 * Adapted from: https://gist.github.com/jose-mdz/4a8894c152383b9d7a870c24a04447e4
 */

// Rectangle class
class Rectangle {
  constructor(
    public left: number,
    public top: number,
    public right: number,
    public bottom: number
  ) {}

  static fromRect(rect: { left: number; top: number; width: number; height: number }): Rectangle {
    return new Rectangle(
      rect.left,
      rect.top,
      rect.left + rect.width,
      rect.top + rect.height
    );
  }

  get width(): number {
    return this.right - this.left;
  }

  get height(): number {
    return this.bottom - this.top;
  }

  inflate(dx: number, dy: number): Rectangle {
    return new Rectangle(
      this.left - dx,
      this.top - dy,
      this.right + dx,
      this.bottom + dy
    );
  }

  intersects(other: Rectangle): boolean {
    return !(
      this.right < other.left ||
      this.left > other.right ||
      this.bottom < other.top ||
      this.top > other.bottom
    );
  }

  union(other: Rectangle): Rectangle {
    return new Rectangle(
      Math.min(this.left, other.left),
      Math.min(this.top, other.top),
      Math.max(this.right, other.right),
      Math.max(this.bottom, other.bottom)
    );
  }
}

// Point interface
interface Point {
  x: number;
  y: number;
}

// ConnectorPoint interface
interface ConnectorPoint {
  shape: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  side: 'top' | 'right' | 'bottom' | 'left';
  distance: number;
}

// RouteOptions interface
interface RouteOptions {
  pointA: ConnectorPoint;
  pointB: ConnectorPoint;
  shapeMargin: number;
  globalBoundsMargin: number;
  globalBounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

// Create a point with given coordinates
function createPoint(x: number, y: number): Point {
  return { x, y };
}

// Calculate the position of a connector point based on the side and distance
function calculatePoint(connectorPoint: ConnectorPoint): Point {
  const { shape, side, distance } = connectorPoint;
  let x = shape.left;
  let y = shape.top;
  
  switch (side) {
    case 'top':
      x += shape.width * distance;
      break;
    case 'right':
      x += shape.width;
      y += shape.height * distance;
      break;
    case 'bottom':
      x += shape.width * distance;
      y += shape.height;
      break;
    case 'left':
      y += shape.height * distance;
      break;
  }
  
  return { x, y };
}

// Main orthogonal routing function
export function calculateOrthogonalRoute(options: RouteOptions): Point[] {
  const { pointA, pointB, shapeMargin, globalBoundsMargin } = options;
  
  // Get the shapes
  const shapeA = Rectangle.fromRect(pointA.shape);
  const shapeB = Rectangle.fromRect(pointB.shape);
  
  // Calculate the start and end points
  const start = calculatePoint(pointA);
  const end = calculatePoint(pointB);
  
  // Check if shapes overlap - if they do, just use a direct connection
  const inflatedA = shapeA.inflate(shapeMargin, shapeMargin);
  const inflatedB = shapeB.inflate(shapeMargin, shapeMargin);
  
  if (inflatedA.intersects(inflatedB)) {
    return [start, end];
  }
  
  // Get starting directions based on sides
  const startDir = getDirectionFromSide(pointA.side);
  const endDir = getDirectionFromSide(pointB.side);
  
  // Calculate points for the orthogonal path
  const path = calculateOrthogonalPath(start, end, startDir, endDir);
  
  return path;
}

// Get direction from side
function getDirectionFromSide(side: 'top' | 'right' | 'bottom' | 'left'): { dx: number; dy: number } {
  switch (side) {
    case 'top': return { dx: 0, dy: -1 };
    case 'right': return { dx: 1, dy: 0 };
    case 'bottom': return { dx: 0, dy: 1 };
    case 'left': return { dx: -1, dy: 0 };
  }
}

// Calculate orthogonal path
function calculateOrthogonalPath(
  start: Point,
  end: Point,
  startDir: { dx: number; dy: number },
  endDir: { dx: number; dy: number }
): Point[] {
  const points: Point[] = [start];
  let current = { ...start };
  
  // Calculate the midpoint
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // First segment - from start in start direction
  if (startDir.dx !== 0) {
    // Moving horizontally
    current = { x: midX, y: current.y };
  } else {
    // Moving vertically
    current = { x: current.x, y: midY };
  }
  points.push(current);
  
  // Middle segment - orthogonal turn
  if (startDir.dx !== 0) {
    // Previous move was horizontal, now move vertically
    current = { x: current.x, y: midY };
  } else {
    // Previous move was vertical, now move horizontally
    current = { x: midX, y: current.y };
  }
  
  // Check if we need an additional point to reach the end direction
  const diffX = end.x - current.x;
  const diffY = end.y - current.y;
  
  if ((endDir.dx === 0 && diffX !== 0) || (endDir.dy === 0 && diffY !== 0)) {
    // We need another segment
    if (endDir.dx === 0) {
      // End direction is vertical, go to the right x first
      points.push({ x: end.x, y: current.y });
    } else {
      // End direction is horizontal, go to the right y first
      points.push({ x: current.x, y: end.y });
    }
  }
  
  points.push(end);
  
  return simplifyPath(points);
}

// Simplify path by removing unnecessary points
function simplifyPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;
  
  const result: Point[] = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];
    
    // Check if the current point is on the same line as prev and next
    if (!((prev.x === current.x && current.x === next.x) || 
          (prev.y === current.y && current.y === next.y))) {
      result.push(current);
    }
  }
  
  result.push(path[path.length - 1]);
  return result;
}

// Utility function to get the opposite side
export function getOppositeSide(side: 'top' | 'right' | 'bottom' | 'left'): 'top' | 'right' | 'bottom' | 'left' {
  switch (side) {
    case 'top': return 'bottom';
    case 'right': return 'left';
    case 'bottom': return 'top';
    case 'left': return 'right';
  }
}

// Utility for React Flow - convert React Flow nodes to shape format
export function nodeToShape(node: { position: Point; width: number; height: number }): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  return {
    left: node.position.x,
    top: node.position.y,
    width: node.width,
    height: node.height
  };
} 
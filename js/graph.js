// Pie chart

const dims = {
  height: 300,
  width: 300,
  radius: 150,
}
const center = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 }
const svg = d3.select('.canvas')

// create svg
svg
  .append('svg')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150)

// Create graph group
const graph = svg.append('g')
graph.attr('transform', `translate(${center.x}, ${center.y})`)

// Create pie chart
const pie = d3.pie()
pie.sort(null).value((d) => d.cost) // for generate pie chart angles

const angles = pie([
  { name: 'rent', cost: 500 },
  { name: 'bills', cost: 300 },
  { name: 'gaming', cost: 200 },
])

const arcPath = d3.arc()
arcPath
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2)

console.log(arcPath(angles[0]))

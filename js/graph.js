// Pie chart

const dims = {
  height: 300,
  width: 300,
  radius: 150,
}
const center = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 }
const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150)

const graph = svg.append('g').attr('transform', `translate(${center.x}, ${center.y})`)
// translates the graph group to the middle of the svg container

// Create pie chart
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost) // the value we are evaluating to create the pie angles

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2)

// const colour = d3.scaleOrdinal(d3['schemeSet3'])
const colour = d3.scaleOrdinal(d3.schemeCategory10)

// Update data
const update = (data) => {
  // update color scale domain
  colour.domain(data.map(d => d.name))
  // join enhanced (pie) data to path elements
  const paths = graph.selectAll('path').data(pie(data))


  paths
    .enter()
    .append('path')
    .attr('class', 'arc')
    .attr('d', arcPath)
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', d => colour(d.data.name)) // here need d.data.name, its nested data.name field
}

// Get data from firebase firestore
let data = []
db.collection('expenses')
  .orderBy('cost')
  .onSnapshot((res) => {
    res.docChanges().forEach((change) => {
      const doc = { ...change.doc.data(), id: change.doc.id }

      switch (change.type) {
        case 'added':
          data.push(doc)
          break
        case 'modified':
          const index = data.findIndex((item) => item.id === doc.id)
          data[index] = doc
          break
        case 'removed':
          data = data.filter((item) => item.id !== doc.id)
          break

        default:
          break
      }
    })
    console.log(data)
    update(data)
  })

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

// need update arc path on every data update
const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2)

// const colour = d3.scaleOrdinal(d3['schemeSet3'])
const colour = d3.scaleOrdinal(d3.schemeCategory10)

// Plugins
// legend setup, names on the right of chart with color circles
const legendGroup = svg.append('g').attr('transform', `translate(${dims.width + 40}, 10)`)

const legend = d3
  .legendColor()
  .shape('circle')
  .shapePadding(10)
  .scale(colour)

const tip = d3
  .tip()
  .attr('class', 'tip card') // matialize css class
  .html((d) => {
    let content = `<div class="name">${d.data.name}</div>`
    content += `<div class="cost">${d.data.cost}</div>`
    content += `<div class="delete">Click to delete</div>`
    return content
  }) // html inside tooltip
graph.call(tip)

// Update data
const update = (data) => {
  // update color scale domain
  colour.domain(data.map((d) => d.name))

  // update legend
  legendGroup.call(legend)
  legendGroup.selectAll('text').attr('fill', 'white')

  // join enhanced (pie) data to path elements
  const paths = graph.selectAll('path').data(pie(data))

  // update on remove from DOM
  paths
    .exit()
    .transition()
    .duration(1000)
    .attrTween('d', arcTweenEnd)
    .remove()

  // Update on update DOM
  // paths.attr('d', arcPath) // Initial variant of update

  // handle the current DOM path updates, update with animation
  paths
    .transition()
    .duration(1000)
    .attrTween('d', arcTweenUpdate)

  paths
    .enter()
    .append('path')
    .attr('class', 'arc')
    .attr('d', arcPath)
    .attr('stroke', '#fff')
    // .attr('stroke-width', 3)
    .attr('fill', (d) => colour(d.data.name)) // here need d.data.name, its nested data.name field
    .each(function(d) {
      this._current = d
    })
    .transition()
    .duration(1000)
    .attrTween('d', arcTweenEnter)

  // add events
  graph
    .selectAll('path')
    .on('mouseover', (data, index, elements) => {
      tip.show(data, elements[index]) // elements[index] is the same as this
      handleMouseOver(data, index, elements)
    })
    .on('mouseout', (data, index, elements) => {
      tip.hide()
      handleMouseOut(data, index, elements)
    })
    .on('click', handleClick)
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

// animate arc util on enter
const arcTweenEnter = (d) => {
  let interpolate = d3.interpolate(d.endAngle, d.startAngle)

  return (ticker) => {
    d.startAngle = interpolate(ticker)
    return arcPath(d)
  }
}

// animate arc util on exit
const arcTweenEnd = (d) => {
  let interpolate = d3.interpolate(d.startAngle, d.endAngle)

  return (ticker) => {
    d.startAngle = interpolate(ticker)
    return arcPath(d)
  }
}

// use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
  console.log(this._current, d)
  // interpolate between the two objects
  const i = d3.interpolate(this._current, d)
  // update the current prop with new updated data
  this._current = i(1)

  return function(t) {
    // i(t) returns a value of d (data object) which we pass to arcPath
    return arcPath(i(t))
  }
}

// Even handlers
const handleMouseOver = (data, index, elements) => {
  d3.select(elements[index])
    .transition('changeSliceFill')
    .duration(300)
    .attr('fill', 'white')
}

const handleMouseOut = (data, index, elements) => {
  d3.select(elements[index])
    .transition('changeSliceFill')
    .duration(300)
    .attr('fill', colour(data.data.name))
}

const handleClick = (data, index, elements) => {
  const id = data.data.id
  db.collection('expenses')
    .doc(id)
    .delete()
}

// links:
// https://www.d3indepth.com/shapes/#arc-generator
// plugins: d3 legends, d3 tip

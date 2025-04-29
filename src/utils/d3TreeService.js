import * as d3 from 'd3';
import { createApp, h } from 'vue';
import EmployeeNode from '../components/EmployeeNode.vue';

export function createVerticalTree(data, containerElement, options = {}) {
  if (!data) {
    console.error("No data provided to createVerticalTree");
    return { update: () => {}, svg: null };
  }

  d3.select(containerElement).selectAll("*").remove();

  const {
    width = 800,
  } = options;

  const root = d3.hierarchy(data);
  const dx = 230;
  const dy = 650;

  const tree = d3.tree()
    .nodeSize([dx, dy])
    .separation((a, b) => a.parent === b.parent ? 1.4 : 2.2);

  tree(root);

  const windowHeight = window.innerHeight - 120;
  const svg = d3.select(containerElement)
    .append("svg")
    .attr("width", "100%")
    .attr("height", windowHeight)
    .attr("viewBox", [-width / 2, -250, width, windowHeight])
    .attr("style", `max-width: 100%; height: ${windowHeight}px; padding-top: 100px; font: 12px sans-serif; background: transparent; cursor: grab;`);

  // Create a zoom group that contains everything
  const gZoom = svg.append("g")
    .attr("class", "gZoom");

  // Put both links and nodes inside the zoom group
  const gLink = gZoom.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-opacity", 0.8)
    .attr("stroke-width", 1.5);

  const gNode = gZoom.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  // Collapse everything except root initially
  root.descendants().forEach(d => {
    d.id = d.data.id;
    d._children = d.children;
    d.children = null;
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Implement zoom behavior with both zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([0.4, 2]) // min and max zoom levels
    .filter((event) => {
      // Only allow zoom for non-wheel events
      return !event.type.startsWith('wheel');
    })
    .on("start", () => {
      svg.attr("style", "max-width: 100%; height: auto; font: 12px sans-serif; background: transparent; cursor: grabbing");
    })
    .on("zoom", (event) => {
      gZoom.attr("transform", event.transform);
    })
    .on("end", () => {
      svg.attr("style", "max-width: 100%; height: auto; font: 12px sans-serif; background: transparent; cursor: grab");
    });

  // Apply zoom behavior to SVG
  svg.call(zoom);

  // Disable double click zoom
  svg.on("dblclick.zoom", null);

  // Function to programmatically zoom in
  function zoomIn() {
    svg.transition()
      .duration(300)
      .call(zoom.scaleBy, 1.2);
  }
  
  // Function to programmatically zoom out
  function zoomOut() {
    svg.transition()
      .duration(300)
      .call(zoom.scaleBy, 1 / 1.2);
  }

  // Function to reset zoom
  function resetZoom() {
    svg.transition()
      .duration(300)
      .call(zoom.transform, d3.zoomIdentity);

    // Scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function collapseAllChildren(d) {
    if (d.children) {
      d.children.forEach(collapseAllChildren);
      d._children = d.children;
      d.children = null;
    }
  }

  function update(source) {
    const duration = 500;
    const nodes = root.descendants();
    const links = root.links();

    tree(root);

    const visibleNodes = root.descendants();
    const maxY = d3.max(visibleNodes, d => d.y)
    const extraSpace = 700;
    const newHeight = maxY + extraSpace;
    const windowHeight = window.innerHeight - 40;

    // Dynamically adjust SVG height
    svg.transition()
      .duration(400)
      .attr("height", Math.max(windowHeight, newHeight))
      .attr("viewBox", [-width / 2, -250, width, Math.max(windowHeight, newHeight)]);

    setTimeout(() => {
      const svgBottom = svg.node().getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;
    
      const scrollTarget = window.scrollY + svgBottom - viewportHeight + 150;
    
      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      });
    }, 300);

    // --- LINKS ---
    const link = gLink.selectAll("path").data(links, d => d.target.id);

    const cardHeight = 400;
    const verticalGap = 120;
    const offsetFromCenter = cardHeight / 2;
    const linkStartOffset = offsetFromCenter + 120;
    const linkEndOffset = offsetFromCenter - verticalGap;

    link.enter()
      .append("path")
      .attr("d", d => {
        const o = { x: source.x0, y: source.y0 };
        return d3.linkVertical().x(d => d.x).y(d => d.y)({ source: o, target: o });
      })
      .merge(link)
      .transition().duration(duration)
      .attr("d", d => {
        const source = { x: d.source.x, y: d.source.y + linkStartOffset }; // bottom center of parent card
        const target = { x: d.target.x, y: d.target.y - linkEndOffset }; // top center of child card
        return d3.linkVertical().x(d => d.x).y(d => d.y)({ source, target });
      })

    link.exit()
      .transition()
      .duration(duration)
      .attr("d", d => {
        const o = { x: source.x, y: source.y };
        return d3.linkVertical().x(d => d.x).y(d => d.y)({ source: o, target: o });
      })
      .remove();

    // --- NODES ---
    const node = gNode.selectAll("g").data(nodes, d => d.id);

    const nodeEnter = node.enter()
      .append("g")
      .attr("transform", d => `translate(${source.x0},${source.y0})`);

    nodeEnter.transition().duration(duration)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodeEnter.each(function (d) {
      const foreign = d3.select(this)
        .append("foreignObject")
        .attr("width", 260)
        .attr("height", 500)
        .attr("x", -130)
        .attr("y", -90);

      const container = document.createElement("div");
      foreign.node().appendChild(container);

      const app = createApp({
        render() {
          return h(EmployeeNode, {
            key: d.id + '-' + (d.children ? 'expanded' : 'collapsed'),
            node: d,
            hasChildren: d._children?.length > 0 || d.children?.length > 0,
            onToggleChildren: () => {
              const parent = d.parent;
            
              if (d.children) {
                collapseAllChildren(d);
              } else {
                // First collapse all sibling subtrees
                if (parent?.children) {
                  parent.children.forEach(sibling => {
                    if (sibling !== d && sibling.children) {
                      collapseAllChildren(sibling);
                    }
                  });
                }
            
                // Expand this node
                d.children = d._children;
                d._children = null;
              }
            
              update(d); // Re-render
            }
          });
        }
      });
      app.mount(container);
    });

    node.merge(nodeEnter).transition().duration(duration)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.exit().transition().duration(duration)
      .attr("transform", d => `translate(${source.x},${source.y})`)
      .remove();

    root.descendants().forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  update(root);

  return { 
    update, 
    svg,
    zoomIn,
    zoomOut,
    resetZoom
  };
}
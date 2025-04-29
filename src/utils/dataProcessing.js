import * as XLSX from 'xlsx';

// Load and parse Excel file
export async function loadExcelData(filePath) {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet);
  return json;
}

// Build hierarchy from flat list
export function buildHierarchyFromFlatData(data) {
  const idToNodeMap = {};
  const rootCandidates = [];

  // First pass: add enriched node objects to map
  data.forEach(row => {
    const id = row['Employee Id'];
    const node = {
      id,
      name: row['Name'],
      title: row['Job Title'],
      location: row['Location'],
      department: row['Department'],
      managerId: row['Manager'],
      salary: Number(row['Salary']) || 0,
      children: [],
      _children: null, // For toggle state
      // Placeholder metrics
      icCount: 0,
      managerCount: 0,
      icCost: 0,
      managerCost: 0,
      totalCost: 0,
      layer: 1,
      reportingLayers: 0
    };
    idToNodeMap[id] = node;
  });

  // Second pass: assign children and root
  Object.values(idToNodeMap).forEach(node => {
    const manager = idToNodeMap[node.managerId];
    if (manager) {
      manager.children.push(node);
      node.layer = manager.layer + 1;
    } else {
      rootCandidates.push(node);
    }
  });

  // Return the top-level node
  return rootCandidates[0];
}

// Recursively compute metrics
export function computeMetrics(node) {
  if (!node.children || node.children.length === 0) {
    node.icCount = 1;
    node.icCost = node.salary;
    node.managerCount = 0;
    node.managerCost = 0;
    node.totalCost = node.salary;
    node.reportingLayers = 0;
    node.totalDescendants = 0;
    node.nonLeafDescendants = 0;
    node.managementCostRatio = 0;
    return {
      icCount: 1,
      icCost: node.salary,
      managerCount: 0,
      managerCost: 0,
      totalCost: node.salary,
      maxDepth: 0,
      totalDescendants: 0,
      nonLeafDescendants: 0
    };
  }

  let icCount = 0;
  let icCost = 0;
  let managerCount = 0;
  let managerCost = 0;
  let totalCost = 0;
  let maxDepth = 0;
  let totalDescendants = 0;
  let nonLeafDescendants = 0;

  for (const child of node.children) {
    const result = computeMetrics(child);

    totalDescendants += 1 + (child.totalDescendants || 0);
    if (child.children && child.children.length > 0) {
      nonLeafDescendants += 1 + (child.nonLeafDescendants || 0);
    }

    icCount += result.icCount;
    icCost += result.icCost;
    managerCount += result.managerCount;
    managerCost += result.managerCost;
    totalCost += result.totalCost;

    maxDepth = Math.max(maxDepth, result.maxDepth + 1);
  }

  // Self is a manager because has children
  if (node.managerId) { 
    managerCount += 1;
    managerCost += node.salary;
  }

  totalCost += node.salary;

  // Assign calculated metrics back to node
  node.icCount = icCount;
  node.icCost = icCost;
  node.managerCount = managerCount;
  node.managerCost = managerCost;
  node.totalCost = totalCost;
  node.reportingLayers = maxDepth;
  node.totalDescendants = totalDescendants;
  node.nonLeafDescendants = nonLeafDescendants;

  // Manager Cost Ratio calculation
  node.managementCostRatio = managerCost > 0 ? (icCost / managerCost) : 0;

  return {
    icCount,
    icCost,
    managerCount,
    managerCost,
    totalCost,
    maxDepth,
    totalDescendants,
    nonLeafDescendants
  };
}

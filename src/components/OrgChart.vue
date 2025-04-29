<template>
  <div class="org-chart-container">
    <div ref="treeContainer" class="tree-container"></div>
  </div>
</template>

<script>
import { createVerticalTree } from '../utils/d3TreeService';
import * as d3 from 'd3';

export default {
  name: 'OrgChart',
  props: {
    data: {
      type: Object,
      required: true
    },
    width: {
      type: Number,
      default: 900
    },
    height: {
      type: Number,
      default: 600
    }
  },
  data() {
    return {
      tree: null,
      chartOptions: {
        nodeRadius: 8,
        nodeColor: '#3b82f6'
      }
    };
  },
  watch: {
    data: {
      handler() {
        this.initTree();
      },
      deep: true
    }
  },
  mounted() {
    this.initTree();
    
    // Handle resize
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initTree() {
      if (!this.$refs.treeContainer) return;
      
      // Clear previous tree if exists
      this.$refs.treeContainer.innerHTML = '';
      
      // Get container width
      const containerWidth = window.innerWidth - 40;
      
      const dataCopy = JSON.parse(JSON.stringify(this.data));
      
      // Initialize the tree
      this.tree = createVerticalTree(
        dataCopy, 
        this.$refs.treeContainer, 
        {
          width: containerWidth,
          marginTop: 80,
          marginRight: 120,
          marginBottom: 40,
          marginLeft: 120,
          scrollContainer: this.$refs.treeContainer
        }
      );
      
      // Force initialization if needed
      this.$nextTick(() => {
        if (this.$refs.treeContainer.childNodes.length === 0) {
          this.initTree();
        }
      });
    },
    handleResize() {
      // Debounce resize event
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.initTree();
      }, 300);
    },
    zoomIn() {
      // Call the D3 zoom in functions
      if (this.tree && this.tree.zoomIn) {
        this.tree.zoomIn();
      }
    },
    zoomOut() {
      // Call the D3 zoom out function
      if (this.tree && this.tree.zoomOut) {
        this.tree.zoomOut();
      }
    },
    resetZoom() {
      // Call the D3 reset zoom function
      if (this.tree && this.tree.resetZoom) {
        this.tree.resetZoom();
      }
    }
  }
};
</script>

<style scoped>
.org-chart-container {
  width: 100%;
  overflow-x: auto;
  background: transparent;
}

.tree-container {
  width: 100%;
  min-height: 500px;
  background: transparent;
  user-select: none;
}
</style>
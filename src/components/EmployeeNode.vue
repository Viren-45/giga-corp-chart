  <template>
    <div
      class="min-w-[260px] max-w-sm mx-auto rounded-2xl px-2 py-4 text-white relative backdrop-blur-lg bg-opacity-30 border border-white/20 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
      :class="bgColorByLayer"
    >
      <!-- Initials -->
      <div class="flex items-center justify-center mb-2">
        <div
          class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl shadow"
        >
          {{ initials }}
        </div>
      </div>

      <!-- Name + Title -->
      <div class="text-center mb-1">
        <div class="text-lg font-semibold text-white">{{ node.data.name }}</div>
        <div class="text-sm font-normal text-gray-300">{{ node.data.title }}</div>
      </div>

      <!-- Department + Location -->
      <div class="text-sm text-center text-gray-300 space-y-1">
        <div class="rounded-full px-2 py-0.5 bg-white/20 text-white/80 text-md">
          {{ node.data.department || 'N/A' }}
        </div>
        <div class="flex justify-center items-center space-x-1 text-base">
          <span>📍</span> 
          <span>{{ node.data.location || 'Unknown' }}</span>
        </div>
      </div>

      <!-- Hierarchy info -->
      <div class="text-base space-y-2 font-medium text-gray-200 mt-4">
        <div>📏 Layer: {{ node.data.layer }}</div>
        <div>🔽 Reporting layers: {{ node.data.reportingLayers }}</div>
        <div>👥 Manager count: {{ node.data.managerCount }}</div>
        <div>🌿 IC count: {{ node.data.icCount }}</div>
      </div>

      <!-- Cost info -->
      <div class="text-base space-y-2 font-medium text-gray-200 mt-1.5">
        <div>💼 Manager cost: {{ formatCurrency(node.data.managerCost) }} / yr</div>
        <div>🛠 IC cost: {{ formatCurrency(node.data.icCost) }} / yr</div>
        <div>💰 Total cost: {{ formatCurrency(node.data.totalCost) }} / yr</div>
        <div>⚖ Manager cost ratio: {{ managerRatio }}</div>
      </div>

      <!-- Expand/Collapse Button -->
      <div
        v-if="hasChildren"
        @click.stop="$emit('toggle-children')"
        class="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 cursor-pointer select-none bg-black/80 text-white text-xs rounded-full px-4 py-1 shadow hover:bg-gray-700 flex items-center space-x-1 transition-all duration-300"
      >
        <!-- Numbers -->
        <span class="font-semibold">{{ node.data.nonLeafDescendants || 0 }} / {{ node.data.totalDescendants || 0 }}</span>

        <!-- Arrow Icon -->
        <svg xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 transition-transform duration-300"
          :class="isNodeExpanded ? 'rotate-180' : 'rotate-0'"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0l-4.24-4.25a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </template>

  <script>
  export default {
    name: "EmployeeNode",
    props: {
      node: {
        type: Object,
        required: true,
      },
      hasChildren: {
        type: Boolean,
        default: false,
      }
    },
    computed: {
      initials() {
        if (!this.node.data.name) return '';
        return this.node.data.name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase();
      },
      managerRatio() {
        return (this.node.data.managementCostRatio ?? 0).toFixed(2);
      },
      bgColorByLayer() {
        const layer = this.node.data.layer || 1;
        const gradients = [
          'bg-gradient-to-br from-blue-800 to-blue-900',    // Layer 1
          'bg-gradient-to-br from-green-800 to-green-900',   // Layer 2
          'bg-gradient-to-br from-purple-800 to-purple-900', // Layer 3
          'bg-gradient-to-br from-pink-800 to-pink-900',     // Layer 4
          'bg-gradient-to-br from-teal-800 to-teal-900',     // Layer 5
          'bg-gradient-to-br from-indigo-800 to-indigo-900', // Layer 6
          'bg-gradient-to-br from-rose-800 to-rose-900',     // Layer 7
          'bg-gradient-to-br from-emerald-800 to-emerald-900', // Layer 8
          'bg-gradient-to-br from-cyan-800 to-cyan-900',     // Layer 9
        ];
        return gradients[(layer - 1) % gradients.length];
      },
      isNodeExpanded() {
        return !!(this.node.children && this.node.children.length > 0);
      },
      isNodeCollapsed() {
        return !!(this.node._children && this.node._children.length > 0);
      }
    },  
    methods: {
      formatCurrency(value) {
        if (!value) return "$0";
        
        // Convert to K/M/B notation
        if (value >= 1000000000) {
          return `$${(value / 1000000000).toFixed(2)}B`;
        } else if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(2)}K`;
        } else {
          return `$${value}`;
        }
      },
    },
  };
  </script>

  <style scoped>
  </style>

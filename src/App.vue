<template>
  <div :class="['min-h-screen relative transition-colors duration-700', darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gray-50']">
    
    <!-- Fixed Glassmorphic Navbar -->
    <nav class="fixed top-0 left-0 w-full backdrop-blur-md bg-white/30 border-b border-white/20 shadow-md z-50 flex flex-wrap md:flex-nowrap items-center justify-between px-6 md:px-8 py-3 md:py-4 space-y-2 md:space-y-0">
      
      <!-- Left: Title -->
      <div :class="['w-1/4 text-2xl md:text-2xl sm:text-base md:text-center sm:text-center xs:text-center font-extrabold transition-colors duration-300', darkMode ? 'text-white' : 'text-gray-800']">
        Organizational Chart
      </div>

      <!-- Center: Zoom Controls -->
      <div class="flex-grow flex items-center justify-center space-x-4">
        <button @click="$refs.orgChart.zoomIn()" class="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-2 px-4 rounded-full shadow backdrop-blur-md transition-all">
          +
        </button>
        <button @click="$refs.orgChart.resetZoom()" class="bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-full shadow backdrop-blur-md transition-all">
          Reset
        </button>
        <button @click="$refs.orgChart.zoomOut()" class="bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold py-2 px-4 rounded-full shadow backdrop-blur-md transition-all">
          -
        </button>
      </div>

      <!-- Right: Dark Mode Toggle -->
      <div class="w-1/4 flex items-center justify-end space-x-2">
        <label class="flex items-center cursor-pointer">
          <div class="relative w-12 h-6">
            <input type="checkbox" v-model="darkMode" class="sr-only peer" />
            <div class="w-full h-full bg-gray-400 rounded-full shadow-inner transition-all peer-checked:bg-indigo-500"></div>
            <div class="dot absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all peer-checked:translate-x-6"></div>
          </div>
          <div :class="['ml-3 font-semibold transition-colors duration-300', darkMode ? 'text-white' : 'text-gray-700']">
            Dark Mode
          </div>
        </label>
      </div>

    </nav>

    <!-- Content Below Navbar -->
    <div class="pt-18 transition-all duration-500">
      <div class="w-full mx-auto">
        <div v-if="loading" class="flex flex-col items-center justify-center h-96 space-y-6">
          <!-- Fancy Spinner (bouncing dots) -->
          <div class="flex space-x-2">
            <div class="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div class="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            <div class="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300"></div>
          </div>

          <!-- Loading Text -->
          <p class="text-gray-600 text-lg font-medium">
            Loading Organizational Chart...
          </p>
        </div>

        <div v-else class="bg-transparent rounded-lg p-2">
          <OrgChart ref="orgChart" :data="chartData" />
        </div>
      </div>
    </div>

    <!-- Instructions  -->
    <div v-if="!loading && chartData" :class="['fixed top-24 right-4 md:right-4 md:top-28 p-4 rounded-lg backdrop-blur-md shadow-lg z-40 transition-all', darkMode ? 'bg-black/80 text-white' : 'bg-white/40 text-gray-800']">
      <div class="text-md md:text-sm sm:text-sm">
        <p class="font-semibold mb-2">Controls:</p>
        <ul class="space-y-1">
          <li>🖱️ Drag to pan the chart</li>
          <li>🔍 Use Zoom buttons in Navbar</li>
          <li>⬇️ Click Arrows to expand/collapse</li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>
import OrgChart from './components/OrgChart.vue';
import { loadExcelData, buildHierarchyFromFlatData, computeMetrics } from './utils/dataProcessing';

export default {
  name: 'App',
  components: {
    OrgChart
  },
  data() {
    return {
      chartData: null,
      loading: true,
      darkMode: true
    };
  },
  async mounted() {
    try {
      const rawData = await loadExcelData('/Giga-Corp-40k.xlsx');
      const root = buildHierarchyFromFlatData(rawData);
      computeMetrics(root);
      this.chartData = root;
    } catch (error) {
      console.error('Error loading or processing Excel data:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
/* Toggle switch animation */
input:checked + div {
  background-color: #6366f1;
}
input:checked + div .dot {
  transform: translateX(100%);
  background-color: white;
}
.dot {
  transition: all 0.3s ease;
}
</style>
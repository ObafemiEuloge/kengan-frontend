<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['page-change']);

// Changer de page
const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page);
  }
};

// Générer la liste des pages à afficher
const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props;
  
  if (totalPages <= maxVisiblePages) {
    // Si le nombre total de pages est inférieur au nombre de pages visibles,
    // afficher toutes les pages
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Nombre de pages à afficher de chaque côté de la page courante
  const sidePages = Math.floor(maxVisiblePages / 2);
  
  let startPage = Math.max(currentPage - sidePages, 1);
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
  
  // Ajuster si on est proche de la fin
  if (endPage === totalPages) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

// Vérifier si la page est la première
const isFirstPage = computed(() => {
  return props.currentPage === 1;
});

// Vérifier si la page est la dernière
const isLastPage = computed(() => {
  return props.currentPage === props.totalPages;
});
</script>

<template>
  <div class="flex items-center justify-center space-x-1">
    <!-- Bouton page précédente -->
    <button
      class="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200"
      :class="isFirstPage ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-primary-dark hover:text-white'"
      :disabled="isFirstPage"
      @click="changePage(currentPage - 1)"
      aria-label="Page précédente"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>
    
    <!-- Première page + ellipsis -->
    <template v-if="!visiblePages.includes(1)">
      <button
        class="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 text-gray-400 hover:bg-primary-dark hover:text-white"
        @click="changePage(1)"
      >
        1
      </button>
      
      <span v-if="!visiblePages.includes(2)" class="w-10 h-10 flex items-center justify-center text-gray-600">
        ...
      </span>
    </template>
    
    <!-- Pages visibles -->
    <button
      v-for="page in visiblePages"
      :key="page"
      class="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200"
      :class="page === currentPage ? 'bg-secondary text-white' : 'text-gray-400 hover:bg-primary-dark hover:text-white'"
      @click="changePage(page)"
    >
      {{ page }}
    </button>
    
    <!-- Dernière page + ellipsis -->
    <template v-if="!visiblePages.includes(totalPages)">
      <span v-if="!visiblePages.includes(totalPages - 1)" class="w-10 h-10 flex items-center justify-center text-gray-600">
        ...
      </span>
      
      <button
        class="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 text-gray-400 hover:bg-primary-dark hover:text-white"
        @click="changePage(totalPages)"
      >
        {{ totalPages }}
      </button>
    </template>
    
    <!-- Bouton page suivante -->
    <button
      class="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200"
      :class="isLastPage ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-primary-dark hover:text-white'"
      :disabled="isLastPage"
      @click="changePage(currentPage + 1)"
      aria-label="Page suivante"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>
</template>
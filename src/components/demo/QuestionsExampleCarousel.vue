<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BaseBadge from '../ui/BaseBadge.vue';

const exampleQuestions = ref([
  {
    id: 1,
    text: "Quel est le nom du titan d'Eren Yeager dans Attack on Titan?",
    imageUrl: "/images/questions/aot-titan.webp",
    options: [
      { id: 1, text: "Titan Colossal" },
      { id: 2, text: "Titan Cuirassé" },
      { id: 3, text: "Titan Assaillant" },
      { id: 4, text: "Titan Bestial" }
    ],
    correctOption: 3,
    category: "Shonen Classics",
    difficulty: "Medium"
  },
  {
    id: 2,
    text: "Qui est le capitaine du navire Thousand Sunny dans One Piece?",
    imageUrl: "/images/questions/one-piece-crew.webp",
    options: [
      { id: 1, text: "Monkey D. Luffy" },
      { id: 2, text: "Roronoa Zoro" },
      { id: 3, text: "Nami" },
      { id: 4, text: "Usopp" }
    ],
    correctOption: 1,
    category: "Anime Populaires",
    difficulty: "Easy"
  },
  {
    id: 3,
    text: "Quel personnage de Naruto possède le Sharingan?",
    imageUrl: "/images/questions/naruto-jutsu.webp",
    options: [
      { id: 1, text: "Naruto Uzumaki" },
      { id: 2, text: "Sasuke Uchiha" },
      { id: 3, text: "Sakura Haruno" },
      { id: 4, text: "Rock Lee" }
    ],
    correctOption: 2,
    category: "Jutsu & Powers",
    difficulty: "Easy"
  }
]);

const selectedOptions = ref([0, 0, 0]);
const showAnswers = ref([false, false, false]);

const selectOption = (questionIndex: number, optionId: number) => {
  selectedOptions.value[questionIndex] = optionId;
  showAnswers.value[questionIndex] = true;
};

const is_correct = (questionIndex: number, optionId: number) => {
  return exampleQuestions.value[questionIndex].correctOption === optionId;
};

// Modules pour Swiper
const modules = [Pagination, Navigation];
</script>

<template>
  <div class="questions-example-carousel">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="50"
      navigation
      :pagination="{ clickable: true }"
      class="h-full rounded-lg overflow-hidden"
    >
      <SwiperSlide v-for="(question, qIndex) in exampleQuestions" :key="question.id" class="pb-12">
        <div class="p-4 bg-primary-dark rounded-lg border border-gray-700">
          <div class="flex justify-between items-center mb-4">
            <BaseBadge variant="secondary" size="md">
              {{ question.category }}
            </BaseBadge>
            <BaseBadge variant="info" size="sm">
              {{ question.difficulty }}
            </BaseBadge>
          </div>
          
          <div class="text-center mb-4">
            <img 
              :src="question.imageUrl" 
              :alt="'Question ' + (qIndex + 1)" 
              class="rounded-md mx-auto max-h-48 object-cover mb-4"
            />
            <h3 class="text-xl text-white font-bold">{{ question.text }}</h3>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <button 
              v-for="option in question.options" 
              :key="option.id"
              class="p-3 rounded-md text-left transition-all duration-200 border"
              :class="[
                selectedOptions[qIndex] === option.id ? (
                  is_correct(qIndex, option.id) ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'
                ) : 'bg-primary-light border-gray-700 hover:border-accent',
                {
                  'opacity-75': showAnswers[qIndex] && selectedOptions[qIndex] !== option.id && !is_correct(qIndex, option.id),
                  'border-green-500 bg-green-900 bg-opacity-30': showAnswers[qIndex] && is_correct(qIndex, option.id) && selectedOptions[qIndex] !== option.id
                }
              ]"
              @click="selectOption(qIndex, option.id)"
              :disabled="showAnswers[qIndex]"
            >
              <div class="flex items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center mr-2 border border-gray-600">
                  {{ option.id }}
                </div>
                <span class="text-white">{{ option.text }}</span>
              </div>
            </button>
          </div>
          
          <div v-if="showAnswers[qIndex]" class="mt-4 text-center">
            <p class="text-lg" :class="is_correct(qIndex, selectedOptions[qIndex]) ? 'text-green-400' : 'text-red-400'">
              {{ is_correct(qIndex, selectedOptions[qIndex]) ? 'Bonne réponse!' : 'Réponse incorrecte!' }}
            </p>
            <p v-if="!is_correct(qIndex, selectedOptions[qIndex])" class="text-accent">
              La bonne réponse était: {{ question.options.find(o => o.id === question.correctOption)?.text }}
            </p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #E63946;
}

:deep(.swiper-pagination-bullet) {
  background: #E63946;
}
</style>
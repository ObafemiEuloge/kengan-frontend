<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseAlert from '../ui/BaseAlert.vue';

const props = defineProps({
  questions: {
    type: Array as () => {
      question: string;
      options: string[];
      correctAnswer: number;
    }[],
    required: true
  }
});

const emit = defineEmits(['submit']);

const answers = ref<number[]>(Array(props.questions.length).fill(-1));
const submitted = ref(false);
const error = ref('');
const result = ref({ correct: 0, total: 0, passed: false });

const submitQuiz = () => {
  // Vérifier que toutes les questions ont une réponse
  if (answers.value.includes(-1)) {
    error.value = "Veuillez répondre à toutes les questions avant de soumettre.";
    return;
  }
  
  submitted.value = true;
  error.value = '';
  
  // Calculer le résultat
  let correctCount = 0;
  for (let i = 0; i < props.questions.length; i++) {
    if (answers.value[i] === props.questions[i].correctAnswer) {
      correctCount++;
    }
  }
  
  // Mettre à jour le résultat
  result.value = {
    correct: correctCount,
    total: props.questions.length,
    passed: correctCount === props.questions.length
  };
  
  // Émettre le résultat
  emit('submit', result.value.passed);
};

const resetQuiz = () => {
  answers.value = Array(props.questions.length).fill(-1);
  submitted.value = false;
  error.value = '';
};

const selectAnswer = (questionIndex: number, answerIndex: number) => {
  answers.value[questionIndex] = answerIndex;
};
</script>

<template>
  <div class="comprehension-quiz-form">
    <BaseAlert 
      v-if="error" 
      type="error" 
      dismissible
      class="mb-4"
    >
      {{ error }}
    </BaseAlert>
    
    <form @submit.prevent="submitQuiz">
      <div class="space-y-6">
        <div 
          v-for="(question, qIndex) in questions" 
          :key="qIndex"
          class="p-4 bg-primary-dark rounded-lg border border-gray-700"
        >
          <h3 class="text-white text-lg font-bold mb-3">{{ qIndex + 1 }}. {{ question.question }}</h3>
          
          <div class="space-y-2">
            <div 
              v-for="(option, oIndex) in question.options" 
              :key="oIndex"
              class="flex items-center"
            >
              <input 
                type="radio" 
                :id="`q${qIndex}-o${oIndex}`" 
                :name="`question-${qIndex}`" 
                :value="oIndex"
                :checked="answers[qIndex] === oIndex"
                @change="selectAnswer(qIndex, oIndex)"
                :disabled="submitted"
                class="w-4 h-4 mr-2"
              />
              <label 
                :for="`q${qIndex}-o${oIndex}`" 
                class="flex-grow p-2 rounded-md"
                :class="[
                  'text-neutral-light cursor-pointer hover:bg-primary-light hover:bg-opacity-50',
                  {
                    'bg-primary-light': answers[qIndex] === oIndex && !submitted,
                    'text-green-400 font-bold': submitted && oIndex === question.correctAnswer,
                    'text-red-400 line-through': submitted && answers[qIndex] === oIndex && oIndex !== question.correctAnswer
                  }
                ]"
              >
                {{ option }}
              </label>
            </div>
          </div>
          
          <div v-if="submitted && answers[qIndex] !== question.correctAnswer" class="mt-3 text-accent text-sm">
            La bonne réponse était: {{ question.options[question.correctAnswer] }}
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-between">
        <BaseButton 
          v-if="submitted && !result.passed" 
          type="button" 
          variant="outline" 
          @click="resetQuiz"
        >
          Réessayer
        </BaseButton>
        
        <BaseButton 
          v-if="!submitted" 
          type="submit" 
          variant="primary"
        >
          Vérifier mes réponses
        </BaseButton>
      </div>
    </form>
    
    <div v-if="submitted" class="mt-6 text-center">
      <div 
        class="text-lg font-bold mb-2" 
        :class="result.passed ? 'text-green-400' : 'text-red-400'"
      >
        Résultat: {{ result.correct }}/{{ result.total }}
      </div>
      
      <p v-if="result.passed" class="text-accent">
        Félicitations! Tu as compris toutes les règles.
      </p>
      <p v-else class="text-neutral-light">
        Tu n'as pas réussi à répondre correctement à toutes les questions. Révise les règles et réessaie!
      </p>
    </div>
  </div>
</template>
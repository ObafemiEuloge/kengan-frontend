<script setup lang="ts">
import { ref } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseAlert from '../components/ui/BaseAlert.vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const subjects = [
  { value: 'support', label: 'Support technique' },
  { value: 'payment', label: 'Question de paiement' },
  { value: 'account', label: 'Problème de compte' },
  { value: 'feedback', label: 'Suggestion/Feedback' },
  { value: 'partnership', label: 'Proposition de partenariat' },
  { value: 'other', label: 'Autre' }
];

const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref(false);
const errorMessage = ref('');

const validateForm = () => {
  if (!form.value.name) return 'Veuillez saisir votre nom';
  if (!form.value.email) return 'Veuillez saisir votre email';
  if (!form.value.email.includes('@')) return 'Veuillez saisir un email valide';
  if (!form.value.subject) return 'Veuillez sélectionner un sujet';
  if (!form.value.message) return 'Veuillez saisir votre message';
  if (form.value.message.length < 20) return 'Votre message doit contenir au moins 20 caractères';
  
  return null;
};

const submitForm = () => {
  const error = validateForm();
  if (error) {
    errorMessage.value = error;
    submitError.value = true;
    setTimeout(() => {
      submitError.value = false;
    }, 5000);
    return;
  }
  
  isSubmitting.value = true;
  
  // Simuler un appel API
  setTimeout(() => {
    isSubmitting.value = false;
    submitSuccess.value = true;
    
    // Reset form after success
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 5000);
  }, 1500);
};
</script>

<template>
  <MainLayout>
    <div class="container mx-auto py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-heading text-white text-center mb-8">Contactez-nous</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="bg-primary-light rounded-lg p-6 border border-gray-800 text-center">
            <div class="text-secondary text-3xl mb-3">📧</div>
            <h3 class="font-heading text-white text-xl mb-2">Email</h3>
            <p class="text-neutral-light">support@kengan.com</p>
          </div>
          
          <div class="bg-primary-light rounded-lg p-6 border border-gray-800 text-center">
            <div class="text-secondary text-3xl mb-3">📱</div>
            <h3 class="font-heading text-white text-xl mb-2">Support</h3>
            <p class="text-neutral-light">Disponible 7j/7, 9h-18h</p>
          </div>
          
          <div class="bg-primary-light rounded-lg p-6 border border-gray-800 text-center">
            <div class="text-secondary text-3xl mb-3">🌍</div>
            <h3 class="font-heading text-white text-xl mb-2">Réseaux sociaux</h3>
            <p class="text-neutral-light">@KenganOfficiel</p>
          </div>
        </div>
        
        <div class="bg-primary-light rounded-lg shadow-lg p-8 border border-gray-800">
          <h2 class="text-2xl font-heading text-white mb-6">Formulaire de contact</h2>
          
          <BaseAlert 
            v-if="submitSuccess" 
            type="success" 
            dismissible
          >
            Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
          </BaseAlert>
          
          <BaseAlert 
            v-if="submitError" 
            type="error" 
            dismissible
          >
            {{ errorMessage }}
          </BaseAlert>
          
          <form @submit.prevent="submitForm" class="space-y-4">
            <BaseInput
              v-model="form.name"
              label="Nom"
              placeholder="Votre nom"
              :disabled="isSubmitting"
            />
            
            <BaseInput
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="votre.email@exemple.com"
              :disabled="isSubmitting"
            />
            
            <BaseSelect
              v-model="form.subject"
              label="Sujet"
              :options="subjects"
              placeholder="Sélectionnez un sujet"
              :disabled="isSubmitting"
            />
            
            <div class="mb-4">
              <label class="block text-neutral-light mb-2">Message</label>
              <textarea
                v-model="form.message"
                rows="6"
                class="w-full px-4 py-2 bg-primary border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-neutral-light placeholder-gray-500"
                placeholder="Détaillez votre demande..."
                :disabled="isSubmitting"
              ></textarea>
            </div>
            
            <div class="flex justify-end">
              <BaseButton
                type="submit"
                variant="primary"
                size="lg"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Envoi en cours...</span>
                <span v-else>Envoyer le message</span>
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
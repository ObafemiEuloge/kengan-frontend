<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import BaseCard from '../ui/BaseCard.vue';
import 'swiper/css';
import 'swiper/css/pagination';

// Témoignages fictifs
const testimonials = ref([
  {
    quote: "En trois duels, j'ai gagné assez pour m'offrir les derniers tomes de One Piece!",
    author: "KaizokuSama92",
    avatar: "/images/avatars/avatar-1.webp",
    rank: "Jonin, Top 50"
  },
  {
    quote: "Les duels sur KENGAN sont devenus ma nouvelle addiction. L'adrénaline quand tu réponds avant ton adversaire est incomparable!",
    author: "AnimeFighter",
    avatar: "/images/avatars/avatar-2.webp",
    rank: "Chunin, Top 200"
  },
  {
    quote: "J'ai toujours été fier de mes connaissances en anime, mais KENGAN m'a fait découvrir que j'avais encore beaucoup à apprendre. Addict!",
    author: "MangaQueen",
    avatar: "/images/avatars/avatar-3.webp",
    rank: "Kage, Top 10"
  },
  {
    quote: "Les questions sont vraiment bien pensées et couvrent tous les genres. Même un vétéran comme moi est challengé!",
    author: "OtakuLegend",
    avatar: "/images/avatars/avatar-4.webp",
    rank: "Anbu, Top 100"
  }
]);

// Modules Swiper pour le carrousel
const modules = [Autoplay, Pagination];
</script>

<template>
  <section class="py-20 px-4 bg-primary">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl md:text-5xl text-white mb-4">
          CE QUE DISENT <span class="text-accent">NOS CHAMPIONS</span>
        </h2>
      </div>
      
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="30"
        :loop="true"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false
        }"
        :pagination="{
          clickable: true,
          bulletActiveClass: 'swiper-pagination-bullet-active bg-secondary'
        }"
        :breakpoints="{
          640: {
            slidesPerView: 1
          },
          768: {
            slidesPerView: 2
          },
          1024: {
            slidesPerView: 3
          }
        }"
        class="testimonials-swiper"
      >
        <SwiperSlide v-for="(testimonial, index) in testimonials" :key="index" class="pb-12">
          <BaseCard class="h-full flex flex-col">
            <div class="flex-grow">
              <div class="text-accent text-5xl font-serif absolute -top-6 left-4 opacity-50">"</div>
              <p class="text-neutral-light italic mb-6 relative z-10">
                {{ testimonial.quote }}
              </p>
              
              <div class="flex items-center mt-auto">
                <img 
                  :src="testimonial.avatar" 
                  :alt="testimonial.author" 
                  class="w-12 h-12 rounded-full border-2 border-gray-700"
                />
                <div class="ml-3">
                  <p class="text-accent font-bold">{{ testimonial.author }}</p>
                  <p class="text-sm text-neutral-light">{{ testimonial.rank }}</p>
                </div>
              </div>
            </div>
          </BaseCard>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<style scoped>
.swiper-pagination-bullet {
  @apply bg-gray-500;
}

.swiper-pagination-bullet-active {
  @apply bg-secondary;
}
</style>
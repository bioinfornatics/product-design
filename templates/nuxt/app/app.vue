<script setup lang="ts">
// Dev-only annotation overlay, mounted client-only so it never renders
// during SSR and is easy to strip for production if desired.
const isDev = process.dev;
</script>

<template>
  <div>
    <NuxtPage />
    <ClientOnly v-if="isDev">
      <AnnotationOverlay />
    </ClientOnly>
  </div>
</template>

<template>
  <div>
    Nuxt module playground!
    <button type="button" @click="test">ClickMe</button>
  </div>
</template>

<script setup>
async function test() {
  const { $api } = useNuxtApp();
  try {
    console.log($api);
    const response = await $api.test.getLogMe();
    console.log(response);
    // console.log($api);
  } catch (error) {
    console.error(error);
  }
}
</script>

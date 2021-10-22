import PrimeVue from 'primevue/config'

import { createApp } from 'vue'
import App from './App.vue'

import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/md-light-indigo/theme.css'

import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'

createApp(App).use(PrimeVue,{ripple:true}).mount('#app')

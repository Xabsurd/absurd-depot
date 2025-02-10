import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { i18n } from './stores/setting';
import component from './components';
import './assets/styles/main.scss';
import 'virtual:uno.css';
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(component);
app.mount('#app');

import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { useStore } from '@/stores/test'

const routes = [
    {
      path: "home",
      alias: "home",
      component: () => import('@/views/Home.vue'),
    },
    {
      path: 'about',
      alias: 'About',
      component: () => import('@/views/About.vue'),
    },
    {
   	  path: 'Products',
      alias: 'Products',
      component: () => import('@/views/Products.vue')
    },
    {
   	  path: 'Personal/:id',
      alias: 'Personal/:id',
      component: () => import('@/views/Personal.vue')
    },
    {
   	  path: 'PersonalArea/:id',
      alias: 'PersonalArea/:id',
      component: () => import('@/views/PersonalArea.vue')
    },
    {
   	  path: 'Blog',
      alias: 'Blog',
      component: () => import('@/views/Blog.vue')
    },
    {
      path: 'Checkout',
      alias: 'Checkout',
      component: () => import('@/views/Checkout.vue')
    }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  	{
  		path: '/',
  		name: 'root',
  		redirect: to => { 
	  		return useStore().lang 
  		}
  	},
  	{
  		path: '/ru',
  		name: 'ru',
  		redirect: to => { return 'ru/home' },
  		beforeEnter: async (to, from) => { useStore().lang = 'ru'; useStore().process(); },
  		children: routes,
  	},
  	{
  		path: '/en',
  		name: 'en',
  		redirect: to => { return 'en/home' },
  		beforeEnter: (to) => { useStore().lang = 'en'; useStore().process(); },
  		children: routes,
  	},
  	{
  		path: '/kg',
  		name: 'kg',
   		redirect: to => { return 'kg/home' },
   		beforeEnter: (to) => { useStore().lang = 'kg'; useStore().process(); },
  		children: routes,
  	},
  ]
});

export default router;

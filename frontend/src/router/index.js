import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { guest: true }
    },
    {
        path: '/forget',
        name: 'ForgetPassword',
        component: () => import('../views/ForgetPassword.vue'),
        meta: { guest: true }
    },
    {
        path: '/goods/:id',
        name: 'GoodsDetail',
        component: () => import('../views/GoodsDetail.vue')
    },
    {
        path: '/publish',
        name: 'Publish',
        component: () => import('../views/Publish.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/edit-profile',
        name: 'EditProfile',
        component: () => import('../views/EditProfile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('../views/Admin.vue'),
        meta: { requiresAuth: true, admin: true }
    },
    {
        path: '/edit-goods/:id',
        name: 'EditGoods',
        component: () => import('../views/EditGoods.vue'),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    // 需要登录但未登录
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next('/login');
    }
    // 游客页面但已登录 → 跳转首页
    else if (to.meta.guest && userStore.isLoggedIn) {
        next('/');
    }
    // 需要管理员权限但当前用户不是管理员
    else if (to.meta.admin && userStore.userInfo.role !== 'ADMIN') {
        next('/');
    }
    else {
        next();
    }
});

export default router;
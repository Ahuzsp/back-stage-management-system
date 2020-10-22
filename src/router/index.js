import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Goods from '../components/goods/Goods.vue'
import Orders from '../components/orders/Orders.vue'
import Reports from '../components/reports/Reports.vue'
import Categories from '../components/goods/Categories.vue'
import Params from '../components/goods/Params.vue'
import Add from '../components/goods/Add.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: Users },
            { path: '/rights', component: Rights },
            { path: '/roles', component: Roles },
            { path: '/goods', component: Goods },
            { path: '/orders', component: Orders },
            { path: '/reports', component: Reports },
            { path: '/categories', component: Categories },
            { path: '/params', component: Params },
            { path: '/goods/add', component: Add }
        ]
    }
]

const router = new VueRouter({
        routes
    })
 router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next()
    let tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('./login')
    return next()
})
export default router
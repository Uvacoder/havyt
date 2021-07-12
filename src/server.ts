import Fastify from 'fastify'
import { USERS, RECIPES, RECIPE_CATEGORIES } from './fixtures'

const APP_PORT = process.env.APP_PORT || 3000

const server = Fastify()

server.get('/users', (req, res) => {
    res.send(USERS)
})

server.get('/recipes', (req, res) => {
    res.send(RECIPES)
})

server.get('/categories', (req, res) => {
    res.send(RECIPE_CATEGORIES)
})

server.get('*', (req, res) => {
    res.send(`You requested for ${req.url} using method ${req.method}, which does not have an associated response`)
})

server.listen(APP_PORT, () => console.log(`Server started on ${APP_PORT} 🚀`));

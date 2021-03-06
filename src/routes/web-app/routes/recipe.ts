// @ts-ignore
import { FastifyInstance } from 'fastify'
import { Container } from 'typedi'
import {
  getPropsForTemplate,
  toImageUrl,
  toArrayFromMultilineStrFields,
  toFlatFromMultipartBodySimple,
} from '../../../lib/commons/utils'
import { RecipeService } from '../../recipe/service'
import {
  RecipeQuerystring,
  RecipeParams,
  RecipeCreateMultipartBody,
  RecipeUpdateMultipartBody,
  RecipeCreateBody,
} from '../../recipe/types'
import {
  getRecipeSchema,
  recipeCreateSchema,
  createRecipeMultipartSchema,
  updateRecipeMultipartSchema,
} from '../../recipe/schemas'
import { CategoryService } from '../../category/service'

export default async function routes(fastify: FastifyInstance) {
  const categoryService = Container.get(CategoryService)
  const recipeService = Container.get(RecipeService)

  const renderConfig = {
    desc: { renderAs: 'textarea' },
    cuisineId: { values: categoryService.getAllItemsByCategoryType('cuisines') },
    courseId: { values: categoryService.getAllItemsByCategoryType('courses') },
    imageUrl: { renderAs: 'file' },
  }

  fastify.get<{
    Querystring: RecipeQuerystring
  }>('/', async (req, reply) => {
    const recipesTplData = await recipeService.getAll(req.query)
    await reply.view('recipe/index', {
      recipes: recipesTplData,
    })
  })

  fastify.get<{
    Querystring: RecipeQuerystring
  }>('/recipes', async (req, reply) => {
    const recipesTplData = await recipeService.getAll(req.query)
    await reply.view('recipe/index', {
      recipes: recipesTplData,
    })
  })

  fastify.get<{
    Params: RecipeParams
  }>('/recipes/:id', { schema: getRecipeSchema }, async (req, reply) => {
    const recipeTplData = await recipeService.getOne(req.params)
    await reply.view('recipe/view', {
      recipe: recipeTplData,
    })
  })

  fastify.get('/recipes/add', async (req, reply) => {
    const recipeTplData = getPropsForTemplate(recipeCreateSchema, {}, renderConfig)
    await reply.view('recipe/edit', {
      fields: recipeTplData,
    })
  })

  fastify.get<{
    Params: RecipeParams
  }>('/recipes/:id/edit', { schema: getRecipeSchema }, async (req, reply) => {
    const recipe = await recipeService.getOne(req.params)
    const recipeTplData = getPropsForTemplate(recipeCreateSchema, recipe, renderConfig)
    await reply.view('recipe/edit', {
      id: req.params.id,
      fields: recipeTplData,
    })
  })

  fastify.post<{ Body: RecipeCreateMultipartBody }>(
    '/recipes/add',
    { schema: createRecipeMultipartSchema, preHandler: [ fastify.verifyBasicAuth ] },
    async (req, reply) => {
      const body = toArrayFromMultilineStrFields(toFlatFromMultipartBodySimple(req.body), [
        'ingredients',
        'directions',
        'tags',
      ]) as RecipeCreateBody
      body.imageUrl = await toImageUrl(req.body.imageUrl)
      const recipe = await recipeService.create(body)
      reply.redirect(`/recipes/${recipe.id}`)
    }
  )

  fastify.post<{
    Params: RecipeParams
    Body: RecipeUpdateMultipartBody
  }>('/recipes/:id/edit', { schema: updateRecipeMultipartSchema, preHandler: [ fastify.verifyBasicAuth ] }, async (req, reply) => {
    const body = toArrayFromMultilineStrFields(toFlatFromMultipartBodySimple(req.body), [
      'ingredients',
      'directions',
      'tags',
    ]) as RecipeCreateBody
    body.imageUrl = req.body.imageUrl ? await toImageUrl(req.body.imageUrl) : ''
    const recipe = await recipeService.update(req.params, body)
    const recipeTplData = getPropsForTemplate(recipeCreateSchema, recipe, renderConfig)
    await reply.view('recipe/edit', {
      id: req.params.id,
      fields: recipeTplData,
    })
  })
}

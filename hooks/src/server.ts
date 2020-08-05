import Koa from 'koa'
import Router from 'koa-router'
import logger from 'koa-logger'
import json from 'koa-json'
import bodyParser from 'koa-bodyparser'

import events from './events'
import actions from './actions'
import { PORT } from './config'

export const start = () =>
  new Promise(resolve => {
    const app = new Koa()
    const router = new Router()

    router.use('/events', events.routes()).use(events.allowedMethods())
    router.use('/actions', actions.routes()).use(events.allowedMethods())
    router.get('/healthz', async (ctx, next) => {
      ctx.body = 'ok'
      await next()
    })

    // Middlewares
    app.use(json())
    app.use(logger())
    app.use(bodyParser({ jsonLimit: '100mb', textLimit: '100mb' }))

    // Routes
    app.use(router.routes()).use(router.allowedMethods())

    app.listen(PORT, () => {
      console.log(` [*] Hooks started on port ${PORT}`)
      resolve()
    })
  })

import Koa from 'koa'

interface Request<T extends any> extends Koa.Request {
  body?: T
}

export interface Context<T extends any> extends Koa.Context {
  // body: T
  request: Request<T>
}

export type EventPayload<T> = {
  event: {
    session_variables?: { [key: string]: string }
    op: 'INSERT' | 'UPDATE' | 'DELETE' | 'MANUAL'
    data: {
      old?: T
      new?: T
    }
  }
  created_at: Date
  id: string
  trigger: {
    name: string
  }
  table: {
    schema: string
    name: string
  }
}

export type HasuraEventContext<T> = Context<EventPayload<T>>

import { buildASTSchema } from 'graphql'
import gql from 'graphql-tag'

export const schema = buildASTSchema(gql``)
// The root provides a resolver function for each API endpoint
export const rootValue = {}

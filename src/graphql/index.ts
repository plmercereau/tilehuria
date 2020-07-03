import gql from 'graphql-tag'

export const AREAS_OF_INTEREST = gql`
  query list {
    areasOfInterest(order_by: { name: asc }) {
      id
      name
    }
  }
`

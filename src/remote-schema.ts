import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  type CalculateLeasePayload {
    monthlyPayment: Float!
  }

  type Query {
    calculateLease: CalculateLeasePayload!
  }
`;

const resolvers = {
  Query: {
    async calculateLease(parent: any, args: any): Promise<any> {
      return {
          monthlyPayment: 3000,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  plugins: [
    {
      // Fires whenever a GraphQL request is received from a client.
      requestDidStart(requestContext) {
        console.log("Request started! Query:\n" + requestContext.request.query);

        return {
          // Fires whenever Apollo Server will parse a GraphQL
          // request to create its associated document AST.
          parsingDidStart(requestContext) {
            console.log("Parsing started!");
          },

          // Fires whenever Apollo Server will validate a
          // request's document AST against your GraphQL schema.
          validationDidStart(requestContext) {
            console.log("Validation started!");
          },
        };
      },
    },
  ],
});
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🐝 Remote schema server ready at ${url}`);
});

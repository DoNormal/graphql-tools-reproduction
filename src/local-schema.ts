import { ApolloServer, gql } from "apollo-server";
import {
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLSchema,
  print,
} from "graphql";
import { ExecutionParams } from "graphql-tools";
import {
  wrapSchema,
  introspectSchema,
  TransformRootFields,
} from "@graphql-tools/wrap";
import { fetch } from "cross-fetch";

const typeDefs = gql`
  type LeaseCalculation {
    monthlyPayment: Float!
  }

  type Query {
    leaseCalculation: LeaseCalculation!
  }
`;

const executor = async ({ document, variables }: ExecutionParams) => {
  const query = print(document);
  const fetchResult = await fetch("http://localhost:4000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return fetchResult.json();
};

async function remoteSchema(): Promise<GraphQLSchema> {
  const schema = await introspectSchema(executor);

  return wrapSchema({
    schema,
    executor,
    transforms: [
      new TransformRootFields((operation, fieldName, fieldConfig) => {
        if (operation === "Query" && fieldName === "calculateLease") {
          return [
            "leaseCalculation",
            {
              ...fieldConfig,
              type: new GraphQLObjectType({
                name: "LeaseCalculation",
                fields: {
                  monthlyPayment: { type: GraphQLFloat },
                },
              }),
            },
          ];
        }
        return undefined;
      }),
    ],
  });
};

const start = async () => {
    const server = new ApolloServer({
        schema: await remoteSchema(),
        typeDefs,
        introspection: true,
        playground: true,
      });
      server.listen({ port: process.env.PORT || 4001 }).then(({ url }) => {
        console.log(`🐝 Local schema server ready at ${url}`);
      });
}
start()



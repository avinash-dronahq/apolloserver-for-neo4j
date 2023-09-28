import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { Neo4jGraphQL } from "@neo4j/graphql";
import { toGraphQLTypeDefs } from "@neo4j/introspector";
import neo4j from "neo4j-driver";

const port = process.env.PORT || 4000;

const driver = neo4j.driver(
    "neo4j+s://c399c0ae.databases.neo4j.io",
    neo4j.auth.basic("neo4j", "fgvbEdyXFcdqauSG87118iWfaSIm9joWUikQNJuMPmY")
);

const sessionFactory = _ => driver.session({ defaultAccessMode: neo4j.session.READ });

// We create a async function here until "top level await" has landed
// so we can use async/await
async function main() {
    const readonly = true; // We don't want to expose mutations in this case
    const typeDefs = await toGraphQLTypeDefs(sessionFactory, readonly);
    const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
    const server = new ApolloServer({
        schema: await neoSchema.getSchema(),
        /*
        plugins: [
            // Install a landing page plugin based on NODE_ENV
            process.env.NODE_ENV === 'production'
              ? ApolloServerPluginLandingPageProductionDefault({
                  graphRef: 'my-graph-id@my-graph-variant',
                  footer: false,
                })
              : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
          ]
          */
    });
    const {url} = await startStandaloneServer(server, {
        context: async ({ req }) => ({ req }), listen: { port: port }
    });
    //console.log('server', server);
    console.log(`🚀 Server ready at ${url}`);
}

main();
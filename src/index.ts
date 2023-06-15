import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const hackernewsURL = process.env.HN_API_URL;
const topStoriesParam = "topstories.json";
const topStoryDetailParam = "item/";

const typeDefs = `#graphql
  type TopStoriesIDs{
    ids: [Int]
  }

    type Story {
        by: String
        descendants: Int
        id: Int
        kids: [Int]
        score: Int
        time: Int
        title: String
        type: String
        url: String
    }

    type Comment {
        by: String
        id: Int
        kids: [Int]
        parent: Int
        text: String
        time: Int
        type: String
    }

    type Query {
      GetTopStories: [Story]
      GetStory(id: Int!): Story
      GetComments(ids: [Int]!): [Comment]
    }
    `;

const resolvers = {
  Query: {
    GetTopStories: async () => {
      const { data } = await axios.get(`${hackernewsURL}${topStoriesParam}`);
      const stories = await Promise.all(
        data.slice(0, 30).map(async (id: number) => {
          const { data } = await axios.get(
            `${hackernewsURL}${topStoryDetailParam}${id}.json`
          );
          return data;
        })
      );
      return stories;
    },
    GetStory: async (parent: any, args: any) => {
      const { data } = await axios.get(
        `${hackernewsURL}${topStoryDetailParam}${args.id}.json`
      );

      return data;
    },
    GetComments: async (parent: any, args: any) => {
      const comments = await Promise.all(
        args.ids.map(async (id: number) => {
          const { data } = await axios.get(
            `${hackernewsURL}${topStoryDetailParam}${id}.json`
          );
          return data;
        })
      );
      return comments;
    },
  },
};

``;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

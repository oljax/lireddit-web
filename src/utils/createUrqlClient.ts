import { 
  dedupExchange, 
  fetchExchange, 
  Exchange, 
  stringifyVariables 
} from "urql";
import {  
  cacheExchange, 
  Resolver,
  Cache
} from '@urql/exchange-graphcache';
import { 
  LogoutMutation, 
  MeQuery, 
  MeDocument, 
  LoginMutation, 
  RegisterMutation, 
  VoteMutationVariables, 
  DeletePostMutationVariables
} from "../gql/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

import {  pipe, tap } from 'wonka';
import Router from "next/router"

import { gql } from '@urql/core';
import { isServer } from "./isServer";




const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver<any, any, any> => {

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log("data from info:",entityKey, fieldName);
    const allFields = cache.inspectFields(entityKey);
    // console.log('allfields cache data:', allFields);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    // Check if data is in cache and return it.
    
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );
    // console.log("fieldKey data:",fieldKey);
    info.partial = !isItInTheCache;
    const results: string[] = [];
    fieldInfos.forEach(fi => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key,  "posts") as string[];
      results.push(...data);
    });
    // console.log("results data:",results);
    return {
      __typename: "PaginatedPosts",
      posts: results,
    };
  };
};

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields("Query");    
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
  cache.invalidate('Query', 'posts', fi.arguments);
    });
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = ''
  if(isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  // console.log('this is cookie:', cookie);
  // require('dotenv').config();
  // console.log('api is', process.env.NEXT_PUBLIC_API_URL);
return{    
  
  url: process.env.NEXT_PUBLIC_API_URL as string,
  fetchOptions: {
    credentials: "include" as const,   
    headers: cookie 
     ? {
      cookie,
     } 
     : undefined,
  },
  exchanges: [
    dedupExchange, 
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          deletePost: (_result, args, cache, info) => {
            cache.invalidate({
              __typename: "Post",
              id: (args as DeletePostMutationVariables).id,
            })
          },
          vote: (_result, args, cache, info) => {
            const {postId, value} = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );
            
            if (data) {
              if (data.voteStatus === value) {
                return;
              }
              const newPoints = (data.points as number ) + (!data.voteStatus ? 1 : 2) * value;
              cache.writeFragment(
                gql`
                  fragment _ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value } as any
              );
            }
          },
          createPost: (_result, args, cache, info) =>{
            invalidateAllPosts(cache);
          },
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              () => ({me: null})
            );
          },
          login: (_result, args, cache, info) => {
            
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.login.errors) {
                  return query
                } else {
                  return {
                    me: result.login.user,
                  }
                }
              }
            );
            invalidateAllPosts(cache);
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.register.errors) {
                  return query
                } else {
                  return {
                    me: result.register.user,
                  }
                }
              }
            )
          }
        },      
      }
  }), 
  errorExchange,
  ssrExchange,
  fetchExchange
    ],
  };
};
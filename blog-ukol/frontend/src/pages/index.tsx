import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import { Box, Heading, Stack, Text, Flex, Button, Link, Icon, HStack, IconProps } from "@chakra-ui/react";
import React, { useState } from "react";
import NextLink from "next/link";

const Index = () => {
  const [variables, setVariables] = useState({ 
    limit: 10, 
    cursor: null as null | string,
  });
  const [{data, fetching }] = usePostsQuery({
      variables,
  });

  if(!fetching && !data) {
    return <div>you got query failed for some reason</div>;
  }

  const CircleIcon = (props: IconProps) => (
    <Icon viewBox="0 0 200 200" {...props}>
        <path
            fill="currentColor"
            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
        />    
    </Icon>
  )

  return (
    <Layout>
      <Flex align="center">
        <Heading>Recent articles</Heading>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div> 
      ) : (
        <Stack spacing={8}> 
          {data!.posts.posts.map((p) => 
            !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <Box w="100%">
                <Heading fontSize="xl" mb={4}>{p.title}</Heading> 
                <Flex align="center">
                  <Text mr={2}>{p.creator.firstname} {p.creator.lastname}</Text>
                  <HStack>
                    <CircleIcon boxSize={2} />
                  </HStack>
                  <Text ml={2}>{new Date(parseInt(p.createdAt)).toLocaleDateString("en-US")}</Text>
                </Flex>
                <Text mt={4}>{p.textSnippet}</Text>
                <Flex mt={4}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link ml={2}>
                      Read whole article
                    </Link>
                  </NextLink>
                  <Text ml={4}>{p.commentsLength} comments</Text>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching} 
            m="auto" 
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null }
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

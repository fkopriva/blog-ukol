import { withUrqlClient } from 'next-urql';
import React from 'react';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../../components/Layout';
import { Box, Flex, Heading, Text, Divider, HStack, Icon, IconProps } from '@chakra-ui/react';
import CommentsSection from '../../components/CommentsSection';
import { useGetPostFromUrl, useGetRelatedPostsFromUrl } from '../../utils/useGetPostFromUrl';

const Post = ({}) => {
    const [{data, error, fetching}] = useGetPostFromUrl();

    const [{data: relatedData, fetching: relatedFetching}] = useGetRelatedPostsFromUrl();

    const CircleIcon = (props: IconProps) => (
        <Icon viewBox="0 0 200 200" {...props}>
            <path
                fill="currentColor"
                d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
            />    
        </Icon>
    )

    if (fetching || relatedFetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <div>{error.message}</div>
        )
    }

    if (!data?.post || !relatedData?.relatedPosts) {
        return (
            <Layout>
                <Flex>
                    <Box w="75%">Could not find post</Box>
                    <Divider orientation="vertical" size="200px" />
                    <Box w="25%">Could not find related posts</Box>
                </Flex>

            </Layout>
        )
    }
    
    return (
        <Layout>
            <Flex>
                <Box w="75%">
                    <Heading size="xl">{data.post.title}</Heading>
                    <Flex mb={4} mt={4}>
                        <Text size="sm" mr={2} className="greyText">{data.post.creator.firstname} {data.post.creator.lastname}</Text>
                        <HStack>
                            <CircleIcon boxSize={2} />
                        </HStack>
                        <Text ml={2} className="greyText">
                            {new Date(parseInt(data.post.createdAt)).toLocaleDateString("en-US")}
                        </Text>
                    </Flex>
                    <Text mb={4} className="formattedTextArea">{data.post.text}</Text>
                    <Divider orientation="horizontal" />
                    <CommentsSection postId={data.post.id} />
                </Box>
                <Flex ml={4} w="25%">
                    <Box mr={4}>
                        <Divider orientation="vertical" />
                    </Box>
                    <Box>
                        <Heading mb={5} size="md">Related articles</Heading>
                        {relatedData.relatedPosts.map((p) => (
                            <Box key={p.id} mb={4}>
                                <Heading mb={2}size="sm">{p.title}</Heading>
                                <Text noOfLines={3} size="sm">{p.textSnippet}</Text>
                            </Box>    
                        ))}    
                    </Box>
                </Flex>
            </Flex>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
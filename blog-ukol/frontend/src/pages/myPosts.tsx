import { 
    Box, 
    Flex, 
    Heading, 
    Button, 
    Link, 
    Table, 
    Th, 
    Thead, 
    Tr, 
    Tbody,
    Td
} from '@chakra-ui/react';
import React, { useState } from 'react';
import NextLink from "next/link";
import Layout from "../components/Layout";
import { useMyPostsQuery, useMeQuery } from "../generated/graphql";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import { isServer } from '../utils/isServer';

interface myPostsProps {}

const myPosts: React.FC<myPostsProps> = ({}) => {
    const [{ data: meData }] = useMeQuery();

    const admin = meData!.me?.isAdmin as boolean;

    const [{ data, fetching }] = useMyPostsQuery({
        variables: {
            admin: admin,
        },
    });

    if(!fetching && !data) {
        return <div>You got query failed for some reason</div>;
    }

    return (
        <Layout>
            {!data && fetching ? (
                <div>loading...</div>
            ) : (
                <Box>
                    <Flex>
                        <Heading>My articles</Heading>
                        <NextLink href="/create-post">
                            <Button as={Link} ml={5}>Create new article</Button>
                        </NextLink>
                    </Flex>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Article title</Th>
                                <Th>Perex</Th>
                                <Th>Author</Th>
                                <Th># of comments</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data?.myPosts.map((p) => 
                                !p ? null : (
                                <Tr key={p.id}>
                                    <Td>{p.title}</Td>
                                    <Td>{p.parax}</Td>
                                    <Td>{p.creator.firstname} {p.creator.lastname}</Td>
                                    <Td>{p.commentsLength}</Td>
                                    <Td>
                                        <EditDeletePostButtons 
                                            id={p.id} 
                                            creatorId={p.creator.id} 
                                        />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(myPosts);
import React, { useState } from 'react';
import { useCommentsQuery, useCreateCommentMutation, useMeQuery, User } from "../generated/graphql";
import { Box, Flex, Text, Button, Avatar, Heading } from "@chakra-ui/react";
import { Form, Formik } from 'formik';
import InputField from './InputField';
import UpdootSection from './UpdootSection';
import moment from "moment";
import { isServer } from '../utils/isServer';

interface CommentsSectionProps {
    postId: number,
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
    const [variables, setVariables] = useState({
        limit: 10,
        postId: postId,
        cursor: null as null | string,
    });
    const [{data, fetching}] = useCommentsQuery({
        variables,
    });

    const [{data: meData, fetching: meFetching}] = useMeQuery({
        pause: isServer(),
    });
    
    if (!fetching && !data) {
        return <div>You got query failed for some reason</div>;
    }
    let name: string;
    if (meFetching) {
        
    } else if (meData?.me) {
        name = meData.me.firstname + " " + meData.me.lastname;
    }

    const [, createComment] = useCreateCommentMutation();
    return (
        <Box>
            <Heading size="md" mb={4} mt={4}>Comments ({data?.comments.comments.length})</Heading>
            <Formik 
                initialValues={{ id: postId, text: "" }}
                onSubmit={async (values) => {
                   const response = await createComment(values);
                }}    
            >
                {() => (
                    <Form>
                        <Flex align="center">
                            <Avatar size="sm" name={name} src={""} mr={4} my="auto" />
                            <Box mt={0} w="100%">
                                <InputField 
                                    name="text"
                                    placeholder="Join the discussion"
                                    label=""
                                />
                            </Box>
                        </Flex>
                    </Form>
                )}
            </Formik>
            {!data && fetching ? (
                <div>loading...</div>
            ) : (
                <Box mt={4}>
                    {data!.comments.comments.map((c) => (
                    <Flex key={c.id}>
                        <Avatar size="sm" name={c.author.firstname + " " + c.author.lastname} src={""} mr={4} />
                        <Box>
                            <Flex align="center" mb={2}>
                                <Heading size="sm" mr={2}>{c.author.firstname} {c.author.lastname}</Heading>
                                <Text>{moment(new Date(parseInt(c.createdAt)).toISOString()).fromNow()}</Text>
                            </Flex>
                            <Text mb={2}>{c.text}</Text>
                            <UpdootSection comment={c} />
                        </Box>
                    </Flex>
                    ))}
                </Box>
            )}
            {data && data.comments.hasMore ? (
                <Flex>
                    <Button
                        onClick={() => {
                        setVariables({
                            limit: variables.limit,
                            postId: variables.postId,
                            cursor: data.comments.comments[data.comments.comments.length - 1].createdAt,
                        });
                        }}
                        isLoading={fetching} 
                        m="auto" 
                        my={4}
                    >
                        Load more comments
                    </Button>
                </Flex>
            ) : null }
        </Box>
    );
};

export default CommentsSection;
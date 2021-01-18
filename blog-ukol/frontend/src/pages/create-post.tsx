import { Box, Button, Heading, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from "next/router";
import React from 'react';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout>
            <Formik 
                initialValues={{ title: "", text: ""}}
                onSubmit={async (values) => {
                    const {error} = await createPost({ input: values });
                    if (!error) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Box w="75%">
                        <Form>
                            <Flex mb={5}>
                                <Heading mr={4} size="xl">Create new article</Heading>
                                <Button  
                                    type="submit"
                                    isLoading={isSubmitting} 
                                    className="blueButton"
                                >
                                    Publish Article
                                </Button>
                            </Flex>
                            <InputField 
                                name="title"
                                placeholder="My First Article"
                                label="Article Title"
                            />
                            <Box mt={5}>
                                <InputField 
                                    textarea
                                    name="text"
                                    placeholder="Content"
                                    label="Content"
                                    className="formattedTextArea"
                                />
                            </Box>
                        </Form>
                    </Box>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
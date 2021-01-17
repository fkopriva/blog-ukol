import { Box, Flex, Heading, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useRouter } from "next/router";

const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{ data, fetching }] = useGetPostFromUrl();
    const [, updatePost] = useUpdatePostMutation();
    if (fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find post</Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Formik 
                initialValues={{ title: data.post.title, text: data.post.text}}
                onSubmit={async (values) => {
                    await updatePost({ id: intId, ...values });
                    router.back();
                }}
            >
                {({ isSubmitting }) => (
                    <Box w="75%">
                        <Form>
                            <Flex mb={5}>
                                <Heading mr={4} size="xl">Edit article</Heading>
                                <Button  
                                    type="submit"
                                    isLoading={isSubmitting} 
                                    colorScheme="blue"
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
}

export default withUrqlClient(createUrqlClient)(EditPost);
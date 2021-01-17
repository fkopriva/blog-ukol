import React from 'react';
import { Form, Formik } from "formik";
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { Box, Button, Flex, Link, Heading } from '@chakra-ui/react';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from "next/link";

const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Layout variant="small">
            <Formik 
                initialValues={{ email: "", password: ""}}
                onSubmit={async (values, {setErrors}) => {
                   const response = await login(values);
                   if (response.data?.login.errors) {
                       setErrors(toErrorMap(response.data.login.errors));
                   } else if (response.data?.login.user) {
                       if (typeof router.query.next === "string") {
                           router.push(router.query.next);
                       } else {
                           router.push("/");
                       }
                   }
                }}    
            >
                {({ isSubmitting }) => (
                    <Box shadow="md" borderWidth="1px" p={5}>
                        <Heading size="xl" mb={5}>Log In</Heading>
                        <Form>
                            <InputField 
                                name="email"
                                placeholder="email"
                                label="Email"
                            />
                            <Box mt={4}>
                                <InputField 
                                    name="password"
                                    placeholder="password"
                                    label="Password"
                                    type="password"
                                />
                            </Box>
                            <Flex mt={2}>
                                <NextLink href="/forgot-password">
                                    <Link mr="auto">forgot password?</Link>
                                </NextLink>
                            </Flex>
                            <Flex mt={5} justifyContent="flex-end">
                                <Button 
                                    type="submit"
                                    isLoading={isSubmitting} 
                                    colorScheme="blue"
                                >
                                    Log In
                                </Button>
                            </Flex>
                        </Form>
                    </Box>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(Login);
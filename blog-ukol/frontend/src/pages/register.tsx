import React from 'react';
import { Form, Formik } from "formik";
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router";
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();

    return (
        <Layout variant="small">
            <Formik 
                initialValues={{ email: "", firstname: "", lastname: "", password: "", confirmPassword: ""}}
                onSubmit={async (values, {setErrors}) => {
                   const response = await register({ options: values });
                   if (response.data?.register.errors) {
                       setErrors(toErrorMap(response.data.register.errors));
                   } else if (response.data?.register.user) {
                       router.push('/');
                   }
                }}    
            >
                {({ isSubmitting }) => (
                    <Box shadow="md" borderWidth="1px" p={5}>
                        <Heading size="xl" mb={5}>Register</Heading>
                        <Form>
                            <InputField 
                                name="firstname"
                                placeholder="First name"
                                label="First name"
                            />
                            <Box mt={4}>
                                <InputField
                                    name="lastname"
                                    placeholder="Last name"
                                    label="Last name"
                                />
                            </Box>
                            <Box mt={4}>
                                <InputField
                                    name="email"
                                    placeholder="Email"
                                    label="Email"
                                />
                            </Box>
                            <Box mt={4}>
                                <InputField 
                                    name="password"
                                    placeholder="Password"
                                    label="password"
                                    type="password"
                                />
                            </Box>
                            <Box mt={4}>
                                <InputField 
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    label="Confirm password"
                                    type="password"
                                />
                            </Box>
                            <Flex mt={5} justifyContent="flex-end">
                                <Button 
                                    type="submit"
                                    isLoading={isSubmitting} 
                                    colorScheme="blue"
                                >Register</Button>
                            </Flex>
                        </Form>
                    </Box>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(Register);
import { Box, Button, Heading, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
        <Layout variant="small">
            <Formik 
                initialValues={{ email: "email"}}
                onSubmit={async (values) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}    
            >
                {({ isSubmitting }) => complete ? (
                    <Box shadow="md" borderWidth="1px">
                        if an account with that email exists, we sent you an email
                    </Box>
                ) : (
                    <Box shadow="md" borderWidth="1px" p={5}>
                        <Heading size="xl" mb={5}>Reset Password</Heading>
                        <Form>
                            <InputField 
                                name="email"
                                placeholder="email"
                                label="Email"
                                type="email"
                            />
                            <Flex mt={5} justifyContent="flex-end">
                                <Button 
                                    mt={4} 
                                    type="submit"
                                    isLoading={isSubmitting} 
                                    colorScheme="blue"
                                >
                                    Reset Password
                                </Button>
                            </Flex>
                        </Form>                         
                    </Box>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
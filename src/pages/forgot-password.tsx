import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../gql/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';



const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
        return (
            <Wrapper variant='small'>
                <Formik
                    initialValues={{email: ""}}
                    onSubmit={async (values) => {
                        await forgotPassword(values);
                        setComplete(true);
                    }}
                >
                    {({isSubmitting}) => 
                        complete ?  (
                            <Box>
                                if an account with that email exists, we sent an email.
                            </Box>
                        ) : (
                        <Form>
                            <InputField
                                name='email'
                                placeholder='email'
                                label='Email'
                                type="email"
                            />
                            <Button
                                type='submit'
                                colorScheme="teal"
                                mt={2}
                                isLoading={isSubmitting}
                            >
                                forgot password
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);
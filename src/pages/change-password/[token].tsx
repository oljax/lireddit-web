import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import NextLink from "next/link";

import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import  { useRouter } from 'next/router';
import { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../gql/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';





const ChangePassword: NextPage = () => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');
    console.log("error is",tokenError);
        return (
            <Wrapper variant='small'>
                <Formik
                    initialValues={{newPassword: ''}}
                    onSubmit={async (values, {setErrors}) => {

                       const response = await changePassword({
                        newPassword: values.newPassword, 
                        token: typeof router.query.token === "string" ? router.query.token : "",
                        });

                       if(response.data?.changePassword.errors) {
                            const errorMap = toErrorMap(response.data.changePassword.errors);
                            if("token" in errorMap) {
                                setTokenError(errorMap.token);
                            }   
                            setErrors(errorMap);
                       } else if (response.data?.changePassword.user) {
                        router.push("/");
                       }
                    }}
                >
                    {({isSubmitting}) => (
                        <Form>                            
                           
                            <InputField
                                name="newPassword"
                                placeholder="new password"
                                label="New Password"
                                type="password"
                            />
                            
                            {
                                tokenError ? 
                                   <Flex>
                                     <Box color="red">{tokenError}</Box> 
                                     <NextLink href="/forgot-password">
                                        <Link>Try it again</Link>
                                     </NextLink>
                                   </Flex>
                                : null
                            }

                            <Button 
                                type='submit'
                                colorScheme='teal'
                                mt={4}                            
                                isLoading={isSubmitting}
                            >change password</Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

// ChangePassword.getInitialProps = ({query}) => {
//     return {
//         token: query.token as string
//     };
// };

export default withUrqlClient(createUrqlClient)(ChangePassword);